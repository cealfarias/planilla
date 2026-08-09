from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class ProgramacionVacacionBase(BaseModel):
    empleado_id: int
    anio_ejercicio: int
    fecha_inicio_programada: date
    observaciones: Optional[str] = None

class ProgramacionVacacionCreate(ProgramacionVacacionBase):
    pass

class ProgramacionVacacionResponse(ProgramacionVacacionBase):
    id: int
    empresa_id: int
    fecha_derecho: date
    fecha_limite_goce: date
    fecha_fin_programada: date
    estado: str
    nombre_empleado: Optional[str] = None
    cumple_200_dias: Optional[bool] = True
    dias_trabajados_acumulados: Optional[int] = 365
    
    model_config = ConfigDict(from_attributes=True)
