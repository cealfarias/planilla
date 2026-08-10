from sqlalchemy.orm import Session
from sqlalchemy import extract
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
# OPERACIONES DE PRÉSTAMOS Y DESCUENTOS RECURRENTES
# ==========================================
def obtener_prestamos_empleado(db: Session, empleado_id: int):
    return db.query(models.planillas.PrestamoEmpleado).filter(
        models.planillas.PrestamoEmpleado.empleado_id == empleado_id
    ).order_by(models.planillas.PrestamoEmpleado.id.desc()).all()

def obtener_prestamos_activos_empleado(db: Session, empleado_id: int):
    return db.query(models.planillas.PrestamoEmpleado).filter(
        models.planillas.PrestamoEmpleado.empleado_id == empleado_id,
        models.planillas.PrestamoEmpleado.estado == models.enums.EstadoPrestamoEnum.ACTIVO,
        models.planillas.PrestamoEmpleado.saldo_pendiente > 0
    ).all()

def crear_prestamo_empleado(db: Session, prestamo: schemas.planillas.PrestamoEmpleadoCreate, empresa_id: int):
    """
    Registra un préstamo o embargo.
    Valida la regla de protección al salario: La suma de cuotas no debe exceder el 20% del salario nominal.
    """
    # 1. Verificar empleado y contrato activo
    contrato = db.query(models.recursos_humanos.Contrato).join(models.recursos_humanos.Empleado).filter(
        models.recursos_humanos.Empleado.id == prestamo.empleado_id,
        models.recursos_humanos.Empleado.empresa_id == empresa_id,
        models.recursos_humanos.Contrato.es_activo == True
    ).first()
    
    if not contrato:
        raise ValueError("El empleado no tiene un contrato activo.")
        
    salario_nominal = contrato.salario_base
    limite_descuento = Decimal(str(salario_nominal)) * Decimal('0.20')
    
    # 2. Sumar cuotas de préstamos actuales activos
    prestamos_activos = obtener_prestamos_empleado(db, prestamo.empleado_id)
    cuota_actual_total = sum((p.cuota_periodica for p in prestamos_activos), Decimal('0.00'))
    
    # 3. Validar el 20%
    nueva_cuota_total = cuota_actual_total + Decimal(str(prestamo.cuota_periodica))
    if nueva_cuota_total > limite_descuento:
        raise ValueError(
            f"El descuento sobrepasa el límite legal del 20%. "
            f"Salario: ${salario_nominal}. Límite 20%: ${limite_descuento}. "
            f"Cuotas Previas: ${cuota_actual_total}. Nueva Cuota Solicitada: ${prestamo.cuota_periodica}."
        )
        
    db_prestamo = models.planillas.PrestamoEmpleado(
        empleado_id=prestamo.empleado_id,
        tipo_prestamo=prestamo.tipo_prestamo,
        monto_total=prestamo.monto_total,
        saldo_pendiente=prestamo.saldo_pendiente,
        cuota_periodica=prestamo.cuota_periodica,
        estado=prestamo.estado
    )
    db.add(db_prestamo)
    db.commit()
    db.refresh(db_prestamo)
    return db_prestamo

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
        empleado.estado = "Inactivo"
        
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
def obtener_planillas(db: Session, empresa_id: int):
    """Devuelve el historial de planillas generadas por la empresa."""
    return db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.empresa_id == empresa_id
    ).order_by(models.planillas.PeriodoPlanilla.fecha_inicio.desc()).all()

def cerrar_planilla(db: Session, periodo_id: int, empresa_id: int):
    """Cierra una planilla abierta para que no pueda ser procesada de nuevo o modificada."""
    db_periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == periodo_id,
        models.planillas.PeriodoPlanilla.empresa_id == empresa_id
    ).first()
    
    if not db_periodo:
        raise ValueError("El período de planilla no existe.")
        
    if db_periodo.estado == models.enums.EstadoPlanillaEnum.CERRADA:
        raise ValueError("La planilla ya se encuentra cerrada.")
        
    db_periodo.estado = models.enums.EstadoPlanillaEnum.CERRADA
    db.commit()
    db.refresh(db_periodo)
    return db_periodo

def limpiar_boletas_y_relaciones_de_periodo(db: Session, periodo_id: int):
    """Elimina boletas, amortizaciones y detalles asociados a un período respetando las llaves foráneas."""
    boletas = db.query(models.planillas.BoletaPago).filter(
        models.planillas.BoletaPago.periodo_planilla_id == periodo_id
    ).all()
    
    boleta_ids = [b.id for b in boletas]
    
    if boleta_ids:
        # 1. Revertir y borrar amortizaciones de préstamos
        amortizaciones = db.query(models.planillas.AmortizacionPrestamo).filter(
            models.planillas.AmortizacionPrestamo.boleta_pago_id.in_(boleta_ids)
        ).all()
        
        for amort in amortizaciones:
            prestamo = db.query(models.planillas.PrestamoEmpleado).filter(
                models.planillas.PrestamoEmpleado.id == amort.prestamo_empleado_id
            ).first()
            if prestamo:
                prestamo.saldo_pendiente += amort.monto_amortizado
                if prestamo.saldo_pendiente > 0:
                    prestamo.estado = models.enums.EstadoPrestamoEnum.ACTIVO
            db.delete(amort)
        db.flush()

        # 2. Borrar detalles de boletas
        db.query(models.planillas.BoletaPagoDetalle).filter(
            models.planillas.BoletaPagoDetalle.boleta_pago_id.in_(boleta_ids)
        ).delete(synchronize_session=False)
        db.flush()

        # 3. Borrar las boletas de pago
        db.query(models.planillas.BoletaPago).filter(
            models.planillas.BoletaPago.periodo_planilla_id == periodo_id
        ).delete(synchronize_session=False)
        db.flush()

def eliminar_planilla(db: Session, periodo_id: int, empresa_id: int):
    db_periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == periodo_id,
        models.planillas.PeriodoPlanilla.empresa_id == empresa_id
    ).first()
    if not db_periodo:
        raise ValueError("El período de planilla no existe.")
    if db_periodo.estado == models.enums.EstadoPlanillaEnum.CERRADA:
        raise ValueError("No se puede eliminar una planilla que ya ha sido CERRADA.")
        
    limpiar_boletas_y_relaciones_de_periodo(db, db_periodo.id)

    db.delete(db_periodo)
    db.commit()
    return {"mensaje": "Planilla eliminada con éxito"}

def procesar_planilla_mensual(db: Session, periodo: schemas.planillas.PeriodoPlanillaCreate, empresa_id: int):
    # 1. Normalizar tipo_planilla
    tipo_enum = periodo.tipo_planilla
    if isinstance(tipo_enum, str):
        for member in models.enums.TipoPlanillaEnum:
            if member.value.lower() == tipo_enum.lower() or member.name.lower() == tipo_enum.lower():
                tipo_enum = member
                break

    # Validar incompabilidad Quincenal / Mensual para evitar duplicación de saldos y retenciones de ley
    mes_inicio = periodo.fecha_inicio.month
    ano_inicio = periodo.fecha_inicio.year

    if tipo_enum == models.enums.TipoPlanillaEnum.MENSUAL:
        quincenal_existente = db.query(models.planillas.PeriodoPlanilla).filter(
            models.planillas.PeriodoPlanilla.empresa_id == empresa_id,
            models.planillas.PeriodoPlanilla.tipo_planilla == models.enums.TipoPlanillaEnum.QUINCENAL,
            models.planillas.PeriodoPlanilla.codigo_periodo != periodo.codigo_periodo,
            extract('month', models.planillas.PeriodoPlanilla.fecha_inicio) == mes_inicio,
            extract('year', models.planillas.PeriodoPlanilla.fecha_inicio) == ano_inicio
        ).first()
        if quincenal_existente:
            raise ValueError(
                f"No es posible generar una Planilla Mensual para el mes {mes_inicio}/{ano_inicio} porque ya se encuentra registrada la planilla quincenal '{quincenal_existente.codigo_periodo}'. Procesar ambas generaría duplicidad de sueldos y deducciones de ley (ISSS, AFP, Renta)."
            )

    if tipo_enum == models.enums.TipoPlanillaEnum.QUINCENAL:
        mensual_existente = db.query(models.planillas.PeriodoPlanilla).filter(
            models.planillas.PeriodoPlanilla.empresa_id == empresa_id,
            models.planillas.PeriodoPlanilla.tipo_planilla == models.enums.TipoPlanillaEnum.MENSUAL,
            models.planillas.PeriodoPlanilla.codigo_periodo != periodo.codigo_periodo,
            extract('month', models.planillas.PeriodoPlanilla.fecha_inicio) == mes_inicio,
            extract('year', models.planillas.PeriodoPlanilla.fecha_inicio) == ano_inicio
        ).first()
        if mensual_existente:
            raise ValueError(
                f"No es posible generar una Planilla Quincenal para el mes {mes_inicio}/{ano_inicio} porque ya se encuentra registrada la planilla mensual '{mensual_existente.codigo_periodo}'."
            )

    # 2. Buscar si el periodo ya existe en la base de datos
    db_periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.codigo_periodo == periodo.codigo_periodo,
        models.planillas.PeriodoPlanilla.empresa_id == empresa_id
    ).first()
    
    if db_periodo:
        if db_periodo.estado == models.enums.EstadoPlanillaEnum.CERRADA:
            raise ValueError("Este período de planilla ya fue procesado y CERRADO. No puede ser recalculado.")
            
        # Si la planilla existe y está ABIERTA -> Limpiar boletas previas en orden para recalcular limpia
        limpiar_boletas_y_relaciones_de_periodo(db, db_periodo.id)

        db_periodo.fecha_inicio = periodo.fecha_inicio
        db_periodo.fecha_fin = periodo.fecha_fin
        db_periodo.tipo_planilla = tipo_enum
        db.flush()
    else:
        db_periodo = models.planillas.PeriodoPlanilla(
            empresa_id=empresa_id,
            codigo_periodo=periodo.codigo_periodo,
            tipo_planilla=tipo_enum,
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
    
    desglose = []
    
    for emp in empleados_activos:
        # Obtener contrato activo
        contrato = db.query(models.recursos_humanos.Contrato).filter(
            models.recursos_humanos.Contrato.empleado_id == emp.id,
            models.recursos_humanos.Contrato.es_activo == True
        ).first()
        
        if not contrato:
            continue
            
        salario = Decimal(str(contrato.salario_base))
        
        # Usar el motor de cálculo original del usuario
        from services.calculos_ley import calcular_liquidacion_boleta
        
        resultado_calculo = calcular_liquidacion_boleta(float(salario))
        
        isss = Decimal(str(resultado_calculo["deduccion_isss"]))
        afp = Decimal(str(resultado_calculo["deduccion_afp"]))
        renta = Decimal(str(resultado_calculo["deduccion_isr"]))
        # Deducciones adicionales: Préstamos y Embargos Activos
        prestamos_activos = obtener_prestamos_activos_empleado(db, emp.id)
        descuentos_prestamos = Decimal('0.00')
        prestamos_a_amortizar = []
        
        for p in prestamos_activos:
            # Si el saldo pendiente es menor que la cuota, cobramos solo el saldo restante
            cuota = min(p.cuota_periodica, p.saldo_pendiente)
            descuentos_prestamos += cuota
            prestamos_a_amortizar.append({
                "prestamo": p,
                "monto_amortizado": cuota
            })
            
        total_descuentos = Decimal(str(resultado_calculo["total_deducciones"])) + descuentos_prestamos
        liquido = Decimal(str(resultado_calculo["salario_liquido"])) - descuentos_prestamos
        
        # Validar que el líquido no sea negativo (teóricamente no debería por la validación del 20%)
        if liquido < Decimal('0.00'):
            liquido = Decimal('0.00')
        
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
        db.flush() # Para obtener el ID de la boleta y usarlo en las amortizaciones
        
        # Registrar amortizaciones y actualizar saldo
        for pa in prestamos_a_amortizar:
            prestamo_obj = pa["prestamo"]
            monto_amortizado = pa["monto_amortizado"]
            
            amortizacion = models.planillas.AmortizacionPrestamo(
                prestamo_empleado_id=prestamo_obj.id,
                boleta_pago_id=boleta.id,
                monto_amortizado=monto_amortizado,
                fecha_aplicacion=periodo.fecha_fin
            )
            db.add(amortizacion)
            
            # Actualizar saldo
            prestamo_obj.saldo_pendiente -= monto_amortizado
            if prestamo_obj.saldo_pendiente <= Decimal('0.00'):
                prestamo_obj.estado = models.enums.EstadoPrestamoEnum.PAGADO
                
        boletas_creadas += 1
        total_nomina += liquido
        
        desglose.append({
            "empleado_id": emp.id,
            "nombre_completo": f"{emp.primer_nombre} {emp.primer_apellido}",
            "salario_base": float(salario),
            "isss": float(isss),
            "afp": float(afp),
            "renta": float(renta),
            "prestamos": float(descuentos_prestamos),
            "total_descuentos": float(total_descuentos),
            "liquido_recibir": float(liquido)
        })
        
    db.commit()
    db.refresh(db_periodo)
    
    return {
        "periodo": db_periodo,
        "estadisticas": {
            "boletas_generadas": boletas_creadas,
            "total_liquido_pagar": float(total_nomina)
        },
        "desglose": desglose
    }