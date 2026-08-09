from sqlalchemy import Column, Integer, String, Boolean, Numeric, Date, DateTime, ForeignKey, Text, Enum
from database import Base
from datetime import datetime
from models.enums import (
    PeriodoRentaEnum, TipoConceptoEnum, TipoPlanillaEnum, EstadoPlanillaEnum, 
    TipoPrestamoEnum, EstadoPrestamoEnum, MotivoSalidaEnum, EstadoLiquidacionEnum
)

class ParametroGlobal(Base):
    __tablename__ = "pla_parametro_global"
    id = Column(Integer, primary_key=True, index=True)
    clave = Column(String, unique=True, nullable=False)
    valor = Column(Numeric(10, 4), nullable=False)
    fecha_vigencia = Column(Date, nullable=False)
    descripcion = Column(Text, nullable=True)

class TramoRenta(Base):
    __tablename__ = "pla_tramo_renta"
    id = Column(Integer, primary_key=True, index=True)
    periodo_pago = Column(Enum(PeriodoRentaEnum), nullable=False)
    tramo_numero = Column(Integer, nullable=False)
    desde_monto = Column(Numeric(10, 2), nullable=False)
    hasta_monto = Column(Numeric(10, 2), nullable=False)
    porcentaje_aplicar = Column(Numeric(5, 4), nullable=False)
    sobre_exceso_de = Column(Numeric(10, 2), nullable=False)
    cuota_fija = Column(Numeric(10, 2), nullable=False)

class ConceptoPlanilla(Base):
    __tablename__ = "pla_concepto"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, nullable=False)
    descripcion = Column(String, nullable=False)
    tipo_concepto = Column(Enum(TipoConceptoEnum), nullable=False)
    afecta_isss = Column(Boolean, default=False)
    afecta_afp = Column(Boolean, default=False)
    afecta_renta = Column(Boolean, default=False)
    es_sistema = Column(Boolean, default=False)

class PrestamoEmpleado(Base):
    __tablename__ = "pla_prestamo_empleado"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    tipo_prestamo = Column(Enum(TipoPrestamoEnum), nullable=False)
    monto_total = Column(Numeric(10, 2), nullable=False)
    saldo_pendiente = Column(Numeric(10, 2), nullable=False)
    cuota_periodica = Column(Numeric(10, 2), nullable=False)
    entidad = Column(String, nullable=True)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)
    estado = Column(Enum(EstadoPrestamoEnum), default=EstadoPrestamoEnum.ACTIVO)
    fecha_registro = Column(DateTime, default=datetime.utcnow)

class BeneficioRecurrente(Base):
    __tablename__ = "pla_beneficio_recurrente"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    concepto_id = Column(Integer, ForeignKey("pla_concepto.id"), nullable=False)
    monto_asignado = Column(Numeric(10, 2), nullable=False)
    estado = Column(Boolean, default=True)

class RegistroComision(Base):
    __tablename__ = "pla_registro_comision"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    periodo_planilla_id = Column(Integer, ForeignKey("pla_periodo.id"), nullable=False)
    concepto_id = Column(Integer, ForeignKey("pla_concepto.id"), nullable=False)
    monto_generado = Column(Numeric(10, 2), nullable=False)
    origen_calculo = Column(Text, nullable=False)
    fecha_registro = Column(DateTime, default=datetime.utcnow)

class PeriodoPlanilla(Base):
    __tablename__ = "pla_periodo"
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    codigo_periodo = Column(String, unique=True, nullable=False)
    tipo_planilla = Column(Enum(TipoPlanillaEnum), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(Enum(EstadoPlanillaEnum), default=EstadoPlanillaEnum.ABIERTA)
    fecha_procesamiento = Column(DateTime, nullable=True)

class NovedadPlanilla(Base):
    __tablename__ = "pla_novedad"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    periodo_planilla_id = Column(Integer, ForeignKey("pla_periodo.id"), nullable=False)
    concepto_id = Column(Integer, ForeignKey("pla_concepto.id"), nullable=False)
    cantidad = Column(Numeric(10, 2), default=1)
    monto_total = Column(Numeric(10, 2), nullable=False)

class BoletaPago(Base):
    __tablename__ = "pla_boleta_pago"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    periodo_planilla_id = Column(Integer, ForeignKey("pla_periodo.id"), nullable=False)
    salario_base_aplicado = Column(Numeric(10, 2), nullable=False)
    dias_trabajados = Column(Integer, nullable=False)
    total_ingresos = Column(Numeric(10, 2), default=0.00)
    total_descuentos = Column(Numeric(10, 2), default=0.00)
    liquido_a_recibir = Column(Numeric(10, 2), default=0.00)

class BoletaPagoDetalle(Base):
    __tablename__ = "pla_boleta_pago_detalle"
    id = Column(Integer, primary_key=True, index=True)
    boleta_pago_id = Column(Integer, ForeignKey("pla_boleta_pago.id"), nullable=False)
    concepto_id = Column(Integer, ForeignKey("pla_concepto.id"), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)

class AmortizacionPrestamo(Base):
    __tablename__ = "pla_amortizacion_prestamo"
    id = Column(Integer, primary_key=True, index=True)
    prestamo_empleado_id = Column(Integer, ForeignKey("pla_prestamo_empleado.id"), nullable=False)
    boleta_pago_id = Column(Integer, ForeignKey("pla_boleta_pago.id"), nullable=False)
    monto_amortizado = Column(Numeric(10, 2), nullable=False)
    fecha_aplicacion = Column(Date, nullable=False)

class LiquidacionEmpleado(Base):
    __tablename__ = "rh_liquidacion_empleado"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    fecha_retiro = Column(Date, nullable=False)
    motivo_salida = Column(Enum(MotivoSalidaEnum), nullable=False)
    salario_base_calculo = Column(Numeric(10, 2), nullable=False)
    dias_laborados_pendientes = Column(Integer, default=0)
    monto_salario_pendiente = Column(Numeric(10, 2), default=0.00)
    monto_vacacion_proporcional = Column(Numeric(10, 2), default=0.00)
    monto_aguinaldo_proporcional = Column(Numeric(10, 2), default=0.00)
    monto_indemnizacion = Column(Numeric(10, 2), default=0.00)
    total_ingresos_liquidacion = Column(Numeric(10, 2), default=0.00)
    deducciones_ley = Column(Numeric(10, 2), default=0.00)
    total_liquido_pagar = Column(Numeric(10, 2), default=0.00)
    estado = Column(Enum(EstadoLiquidacionEnum), default=EstadoLiquidacionEnum.BORRADOR)
    documento_finiquito_url = Column(String, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
