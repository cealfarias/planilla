from sqlalchemy.orm import Session
from decimal import Decimal
import models
import schemas

# ==========================================
# OPERACIONES DE PARÁMETROS LEGALES
# ==========================================
def obtener_parametro_global(db: Session, clave: str):
    """Busca un parámetro legal dinámico (ej. EDAD_JUBILACION_MASCULINA) por su clave."""
    return db.query(models.planillas.ParametroGlobal).filter(
        models.planillas.ParametroGlobal.clave == clave
    ).first()

def crear_o_actualizar_parametro(db: Session, parametro: schemas.planillas.ParametroGlobalCreate):
    """Inserta o actualiza un parámetro global garantizando la vigencia paramétrica."""
    db_param = db.query(models.planillas.ParametroGlobal).filter(
        models.planillas.ParametroGlobal.clave == parametro.clave
    ).first()
    
    if db_param:
        db_param.valor = parametro.valor
        db_param.fecha_vigencia = parametro.fecha_vigencia
        db_param.descripcion = parametro.descripcion
    else:
        db_param = models.planillas.ParametroGlobal(
            clave=parametro.clave,
            valor=parametro.valor,
            fecha_vigencia=parametro.fecha_vigencia,
            descripcion=parametro.descripcion
        )
        db.add(db_param)
        
    db.commit()
    db.refresh(db_param)
    return db_param

# ==========================================
# OPERACIONES DE CONCEPTOS Y NOVEDADES
# ==========================================
def crear_concepto_planilla(db: Session, concepto: schemas.planillas.ConceptoPlanillaCreate):
    """Registra un concepto salarial definiendo su impacto fiscal (ISSS, AFP, Renta)."""
    db_concepto = models.planillas.ConceptoPlanilla(
        codigo=concepto.codigo,
        descripcion=concepto.descripcion,
        tipo_concepto=concepto.tipo_concepto,
        afecta_isss=concepto.afecta_isss,
        afecta_afp=concepto.afecta_afp,
        afecta_renta=concepto.afecta_renta,
        es_sistema=concepto.es_sistema
    )
    db.add(db_concepto)
    db.commit()
    db.refresh(db_concepto)
    return db_concepto

def registrar_novedad_planilla(db: Session, novedad: schemas.planillas.NovedadPlanillaCreate, empresa_id: int):
    """Registra una incidencia periódica (horas extra, comisiones, ausencias) en una planilla abierta."""
    periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == novedad.periodo_planilla_id,
        models.planillas.PeriodoPlanilla.empresa_id == empresa_id
    ).first()
    
    if not periodo or periodo.estado != models.enums.EstadoPlanillaEnum.ABIERTA:
        raise ValueError("No se pueden registrar novedades en un período cerrado o inexistente.")
        
    db_novedad = models.planillas.NovedadPlanilla(
        empleado_id=novedad.empleado_id,
        periodo_planilla_id=novedad.periodo_planilla_id,
        concepto_id=novedad.concepto_id,
        cantidad=novedad.cantidad,
        monto_total=novedad.monto_total
    )
    db.add(db_novedad)
    db.commit()
    db.refresh(db_novedad)
    return db_novedad

# ==========================================
# OPERACIONES DE LIQUIDACIÓN Y RETIROS (FINIQUITOS)
# ==========================================
def crear_liquidacion_empleado(db: Session, liquidacion: schemas.planillas.LiquidacionEmpleadoCreate, empresa_id: int):
    """
    Registra el cálculo de la liquidación de un empleado.
    Si el estado de la liquidación se pasa a PAGADA, desactiva automáticamente al empleado
    en el expediente digital (Módulo de Recursos Humanos).
    """
    # Validar existencia del empleado
    empleado = db.query(models.recursos_humanos.Empleado).filter(
        models.recursos_humanos.Empleado.id == liquidacion.empleado_id,
        models.recursos_humanos.Empleado.empresa_id == empresa_id
    ).first()
    if not empleado:
        raise ValueError(f"El empleado con ID {liquidacion.empleado_id} no existe o no pertenece a la empresa.")

    db_liquidacion = models.planillas.LiquidacionEmpleado(
        empleado_id=liquidacion.empleado_id,
        fecha_retiro=liquidacion.fecha_retiro,
        motivo_salida=liquidacion.motivo_salida,
        salario_base_calculo=liquidacion.salario_base_calculo,
        dias_laborados_pendientes=liquidacion.dias_laborados_pendientes,
        monto_salario_pendiente=liquidacion.monto_salario_pendiente,
        monto_vacacion_proporcional=liquidacion.monto_vacacion_proporcional,
        monto_aguinaldo_proporcional=liquidacion.monto_aguinaldo_proporcional,
        monto_indemnizacion=liquidacion.monto_indemnizacion,
        total_ingresos_liquidacion=liquidacion.total_ingresos_liquidacion,
        deducciones_ley=liquidacion.deducciones_ley,
        total_liquido_pagar=liquidacion.total_liquido_pagar,
        estado=liquidacion.estado,
        documento_finiquito_url=liquidacion.documento_finiquito_url
    )
    
    db.add(db_liquidacion)
    
    # Transacción Atómica: Si se liquida y paga inmediatamente, cambiar estados del sistema
    if liquidacion.estado == models.enums.EstadoLiquidacionEnum.PAGADA:
        empleado.estado = models.enums.EstadoEmpleadoEnum.INACTIVO
        
        # Cerrar la asignación de puesto vigente
        asignacion_activa = db.query(models.organizacion.AsignacionPuesto).filter(
            models.organizacion.AsignacionPuesto.empleado_id == liquidacion.empleado_id,
            models.organizacion.AsignacionPuesto.fecha_fin.is_(None)
        ).first()
        if asignacion_activa:
            asignacion_activa.fecha_fin = liquidacion.fecha_retiro
            
        # Desactivar credenciales de usuario si posee
        usuario = db.query(models.seguridad.Usuario).filter(
            models.seguridad.Usuario.empleado_id == liquidacion.empleado_id
        ).first()
        if usuario:
            usuario.es_activo = False

    db.commit()
    db.refresh(db_liquidacion)
    return db_liquidacion

# ==========================================
# MOTOR DE PLANILLA AUTOMÁTICA
# ==========================================
def procesar_planilla_mensual(db: Session, periodo: schemas.planillas.PeriodoPlanillaCreate, empresa_id: int):
    # 1. Crear el periodo
    db_periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.codigo_periodo == periodo.codigo_periodo,
        models.planillas.PeriodoPlanilla.empresa_id == empresa_id
    ).first()
    
    if db_periodo:
        raise ValueError("Este código de período ya fue procesado para esta empresa.")
        
    db_periodo = models.planillas.PeriodoPlanilla(
        empresa_id=empresa_id,
        codigo_periodo=periodo.codigo_periodo,
        tipo_planilla=periodo.tipo_planilla,
        fecha_inicio=periodo.fecha_inicio,
        fecha_fin=periodo.fecha_fin,
        estado=models.enums.EstadoPlanillaEnum.ABIERTA
    )
    db.add(db_periodo)
    db.flush() # Para obtener db_periodo.id
    
    # 2. Obtener empleados activos
    empleados_activos = db.query(models.recursos_humanos.Empleado).filter(
        models.recursos_humanos.Empleado.empresa_id == empresa_id,
        models.recursos_humanos.Empleado.estado == "Activo"
    ).all()
    
    boletas_creadas = 0
    total_nomina = Decimal('0.00')
    
    for emp in empleados_activos:
        # Obtener contrato activo
        contrato = db.query(models.recursos_humanos.Contrato).filter(
            models.recursos_humanos.Contrato.empleado_id == emp.id,
            models.recursos_humanos.Contrato.es_activo == True
        ).first()
        
        if not contrato:
            continue
            
        salario = Decimal(str(contrato.salario_base))
        
        # Cálculos de Ley (El Salvador)
        # 1. ISSS (3%, tope salarial $1000)
        isss = min(salario, Decimal('1000.00')) * Decimal('0.03')
        
        # 2. AFP (7.25%)
        afp = salario * Decimal('0.0725')
        
        # 3. Renta
        salario_neto = salario - isss - afp
        renta = Decimal('0.00')
        
        if salario_neto <= Decimal('472.00'):
            renta = Decimal('0.00')
        elif salario_neto <= Decimal('895.24'):
            renta = ((salario_neto - Decimal('472.00')) * Decimal('0.10')) + Decimal('17.67')
        elif salario_neto <= Decimal('2038.10'):
            renta = ((salario_neto - Decimal('895.24')) * Decimal('0.20')) + Decimal('60.00')
        else:
            renta = ((salario_neto - Decimal('2038.10')) * Decimal('0.30')) + Decimal('288.57')
            
        total_descuentos = isss + afp + renta
        liquido = salario - total_descuentos
        
        boleta = models.planillas.BoletaPago(
            empleado_id=emp.id,
            periodo_planilla_id=db_periodo.id,
            salario_base_aplicado=salario,
            dias_trabajados=30, # Asumiendo mes completo para MVP
            total_ingresos=salario,
            total_descuentos=total_descuentos,
            liquido_a_recibir=liquido
        )
        db.add(boleta)
        boletas_creadas += 1
        total_nomina += liquido
        
    db.commit()
    db.refresh(db_periodo)
    
    return {
        "periodo": db_periodo,
        "estadisticas": {
            "boletas_generadas": boletas_creadas,
            "total_liquido_pagar": float(total_nomina)
        }
    }