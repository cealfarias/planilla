from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from decimal import Decimal
from models.enums import TipoUnidadEnum, FrecuenciaEnum, NivelEstudioEnum, EstadoEstudioEnum

# --- NIVEL ORGANIZACIONAL ---
class NivelOrganizacionalBase(BaseModel):
    nombre_nivel: str
    peso_jerarquico: int
    es_staff: bool = False

class NivelOrganizacionalCreate(NivelOrganizacionalBase):
    pass

class NivelOrganizacionalResponse(NivelOrganizacionalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- ESTRUCTURA ORGANIZATIVA ---
class EstructuraOrganizativaBase(BaseModel):
    nombre_unidad: str
    tipo_unidad: TipoUnidadEnum
    unidad_padre_id: Optional[int] = None

class EstructuraOrganizativaCreate(EstructuraOrganizativaBase):
    pass

class EstructuraOrganizativaResponse(EstructuraOrganizativaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- PUESTOS Y RESPONSABILIDADES ---
class PuestoBase(BaseModel):
    nombre_puesto: str
    estructura_organizativa_id: int
    nivel_organizacional_id: int
    puesto_jefe_id: Optional[int] = None
    es_jefatura: bool = False
    salario_minimo: Decimal
    salario_maximo: Decimal
    proposito_principal: Optional[str] = None
    anios_experiencia_minima: int = 0

class PuestoCreate(PuestoBase):
    pass

class PuestoResponse(PuestoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AsignacionPuestoBase(BaseModel):
    empleado_id: int
    puesto_id: int
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    salario_asignado: Decimal
    motivo_asignacion: Optional[str] = None

class AsignacionPuestoCreate(AsignacionPuestoBase):
    pass

class AsignacionPuestoResponse(AsignacionPuestoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)