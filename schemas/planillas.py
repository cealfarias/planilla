from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from models.enums import (
    PeriodoRentaEnum, TipoConceptoEnum, TipoPlanillaEnum, EstadoPlanillaEnum,
    TipoPrestamoEnum, EstadoPrestamoEnum, MotivoSalidaEnum, EstadoLiquidacionEnum
)

# --- PARÁMETROS LEGALES ---
class ParametroGlobalBase(BaseModel):
    clave: str
    valor: Decimal
    fecha_vigencia: date
    descripcion: Optional[str] = None

class ParametroGlobalCreate(ParametroGlobalBase):
    pass

class ParametroGlobalResponse(ParametroGlobalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ConceptoPlanillaBase(BaseModel):
    codigo: str
    descripcion: str
    tipo_concepto: TipoConceptoEnum
    afecta_isss: bool = False
    afecta_afp: bool = False
    afecta_renta: bool = False
    es_sistema: bool = False

class ConceptoPlanillaCreate(ConceptoPlanillaBase):
    pass

class ConceptoPlanillaResponse(ConceptoPlanillaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- CICLO DE PLANILLA Y NOVEDADES ---
class PeriodoPlanillaBase(BaseModel):
    codigo_periodo: str
    tipo_planilla: TipoPlanillaEnum
    fecha_inicio: date
    fecha_fin: date
    estado: EstadoPlanillaEnum = EstadoPlanillaEnum.ABIERTA

class PeriodoPlanillaCreate(PeriodoPlanillaBase):
    pass

class PeriodoPlanillaResponse(PeriodoPlanillaBase):
    id: int
    fecha_procesamiento: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class NovedadPlanillaBase(BaseModel):
    empleado_id: int
    periodo_planilla_id: int
    concepto_id: int
    cantidad: Decimal = Decimal('1.00')
    monto_total: Decimal

class NovedadPlanillaCreate(NovedadPlanillaBase):
    pass

class NovedadPlanillaResponse(NovedadPlanillaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class NovedadDirectaRequest(BaseModel):
    empleado_id: int
    tipo_novedad: str
    fecha: Optional[str] = None
    monto_total: Decimal
    observaciones: Optional[str] = None

class NovedadesLoteRequest(BaseModel):
    novedades: List[dict]

# --- BOLETAS DE PAGO ---
class BoletaPagoBase(BaseModel):
    empleado_id: int
    periodo_planilla_id: int
    salario_base_aplicado: Decimal
    dias_trabajados: int
    total_ingresos: Decimal
    total_descuentos: Decimal
    liquido_a_recibir: Decimal

class BoletaPagoCreate(BoletaPagoBase):
    pass

class BoletaPagoResponse(BoletaPagoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- PRESTAMOS Y LIQUIDACIONES ---
class PrestamoEmpleadoBase(BaseModel):
    empleado_id: int
    tipo_prestamo: TipoPrestamoEnum
    monto_total: Decimal
    saldo_pendiente: Decimal
    cuota_periodica: Decimal
    entidad: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: EstadoPrestamoEnum = EstadoPrestamoEnum.ACTIVO

class PrestamoEmpleadoCreate(PrestamoEmpleadoBase):
    pass

class PrestamoEmpleadoResponse(PrestamoEmpleadoBase):
    id: int
    fecha_registro: datetime
    model_config = ConfigDict(from_attributes=True)

class LiquidacionEmpleadoBase(BaseModel):
    empleado_id: int
    fecha_retiro: date
    motivo_salida: MotivoSalidaEnum
    salario_base_calculo: Decimal
    dias_laborados_pendientes: int = 0
    monto_salario_pendiente: Decimal = Decimal('0.00')
    monto_vacacion_proporcional: Decimal = Decimal('0.00')
    monto_aguinaldo_proporcional: Decimal = Decimal('0.00')
    monto_indemnizacion: Decimal = Decimal('0.00')
    total_ingresos_liquidacion: Decimal = Decimal('0.00')
    deducciones_ley: Decimal = Decimal('0.00')
    total_liquido_pagar: Decimal = Decimal('0.00')
    estado: EstadoLiquidacionEnum = EstadoLiquidacionEnum.BORRADOR
    documento_finiquito_url: Optional[str] = None

class LiquidacionEmpleadoCreate(LiquidacionEmpleadoBase):
    pass

class LiquidacionEmpleadoResponse(LiquidacionEmpleadoBase):
    id: int
    fecha_creacion: datetime
    model_config = ConfigDict(from_attributes=True)