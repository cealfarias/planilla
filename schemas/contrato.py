from pydantic import BaseModel, constr, Field
from typing import Optional
from datetime import date, time

class ContratoBase(BaseModel):
    empleado_id: int
    tipo_contrato: constr(strip_whitespace=True, min_length=3)
    cargo: constr(strip_whitespace=True, min_length=2)
    salario_base: float = Field(gt=0)
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    
    proporciona_alojamiento: bool = False
    direccion_alojamiento: Optional[constr(strip_whitespace=True)] = None
    
    dias_jornada: constr(strip_whitespace=True, min_length=3)
    hora_inicio: time
    hora_fin: time
    pausa_alimenticia_inicio: time
    pausa_alimenticia_fin: time
    horas_semanales: int = Field(le=44, gt=0)
    
    medio_pago: constr(strip_whitespace=True, min_length=3)
    lugar_pago: constr(strip_whitespace=True, min_length=3)
    
    herramientas_entregadas: Optional[constr(strip_whitespace=True)] = None
    lugar_entrega_herramientas: Optional[constr(strip_whitespace=True)] = None
    
    lugar_trabajo_direccion: constr(strip_whitespace=True, min_length=5)
    lugar_trabajo_distrito: constr(strip_whitespace=True, min_length=3)
    lugar_trabajo_municipio: constr(strip_whitespace=True, min_length=3)
    lugar_trabajo_departamento: constr(strip_whitespace=True, min_length=3)
    
    distrito_celebracion: constr(strip_whitespace=True, min_length=3)

class ContratoCreate(ContratoBase):
    es_activo: Optional[bool] = True

class ContratoUpdate(BaseModel):
    tipo_contrato: Optional[constr(strip_whitespace=True)] = None
    cargo: Optional[constr(strip_whitespace=True)] = None
    salario_base: Optional[float] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    
    proporciona_alojamiento: Optional[bool] = None
    direccion_alojamiento: Optional[constr(strip_whitespace=True)] = None
    
    dias_jornada: Optional[constr(strip_whitespace=True)] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    pausa_alimenticia_inicio: Optional[time] = None
    pausa_alimenticia_fin: Optional[time] = None
    horas_semanales: Optional[int] = None
    
    medio_pago: Optional[constr(strip_whitespace=True)] = None
    lugar_pago: Optional[constr(strip_whitespace=True)] = None
    
    herramientas_entregadas: Optional[constr(strip_whitespace=True)] = None
    lugar_entrega_herramientas: Optional[constr(strip_whitespace=True)] = None
    
    lugar_trabajo_direccion: Optional[constr(strip_whitespace=True)] = None
    lugar_trabajo_distrito: Optional[constr(strip_whitespace=True)] = None
    lugar_trabajo_municipio: Optional[constr(strip_whitespace=True)] = None
    lugar_trabajo_departamento: Optional[constr(strip_whitespace=True)] = None
    
    distrito_celebracion: Optional[constr(strip_whitespace=True)] = None
    es_activo: Optional[bool] = None

class ContratoResponse(ContratoBase):
    id: int
    es_activo: bool

    class Config:
        from_attributes = True