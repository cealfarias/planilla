from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from models.enums import GeneroEnum, EstadoEmpleadoEnum, NivelEstudioEnum, EstadoEstudioEnum

# --- EMPLEADO MAESTRO ---
class EmpleadoBase(BaseModel):
    nombres: str
    apellidos: str
    foto_perfil: Optional[str] = None
    dui: str
    nit: Optional[str] = None
    nup: Optional[str] = None
    isss: Optional[str] = None
    fecha_nacimiento: date
    genero: GeneroEnum
    telefono_movil: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    correo_personal: Optional[str] = None
    correo_corporativo: Optional[str] = None
    direccion_residencia: Optional[str] = None
    banco_nombre: Optional[str] = None
    numero_cuenta_bancaria: Optional[str] = None
    estado: EstadoEmpleadoEnum = EstadoEmpleadoEnum.ACTIVO

class EmpleadoCreate(EmpleadoBase):
    pass

class EmpleadoResponse(EmpleadoBase):
    id: int
    fecha_registro: datetime
    model_config = ConfigDict(from_attributes=True)

# --- FORMACIÓN Y EXPERIENCIA ---
class EstudioAcademicoBase(BaseModel):
    empleado_id: int
    nivel_estudio: NivelEstudioEnum
    institucion: str
    titulo_carrera: str
    estado_actual: EstadoEstudioEnum
    fecha_inicio: date
    fecha_fin: Optional[date] = None

class EstudioAcademicoCreate(EstudioAcademicoBase):
    pass

class EstudioAcademicoResponse(EstudioAcademicoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ExperienciaLaboralBase(BaseModel):
    empleado_id: int
    empresa: str
    cargo_desempenado: str
    fecha_inicio: date
    fecha_fin: date
    motivo_retiro: Optional[str] = None

class ExperienciaLaboralCreate(ExperienciaLaboralBase):
    pass

class ExperienciaLaboralResponse(ExperienciaLaboralBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- HABILIDADES E IDIOMAS ---
class EmpleadoHabilidadBase(BaseModel):
    empleado_id: int
    habilidad_id: int
    porcentaje_dominio: int
    evidencia_respaldo: Optional[str] = None

class EmpleadoHabilidadCreate(EmpleadoHabilidadBase):
    pass

class EmpleadoHabilidadResponse(EmpleadoHabilidadBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PerfilConductualBase(BaseModel):
    empleado_id: int
    nombre_prueba: str
    fecha_evaluacion: date
    resultados: str
    observaciones_rrhh: Optional[str] = None

class PerfilConductualCreate(PerfilConductualBase):
    pass

class PerfilConductualResponse(PerfilConductualBase):
    id: int
    model_config = ConfigDict(from_attributes=True)