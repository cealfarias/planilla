from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import date
from .contrato import ContratoResponse  # Importación cruzada

# =====================================================================
# 1. ESQUEMAS DE ESTUDIOS ACADÉMICOS
# =====================================================================
class EstudioAcademicoBase(BaseModel):
    institucion: str = Field(..., max_length=150)
    titulo_obtenido: str = Field(..., max_length=150)
    fecha_graduacion: Optional[date] = None
    nivel_estudio: str = Field(..., max_length=50)

class EstudioAcademicoCreate(EstudioAcademicoBase):
    empleado_id: int

class EstudioAcademicoResponse(EstudioAcademicoBase):
    id: int
    empleado_id: int

    class Config:
        from_attributes = True

# =====================================================================
# 1B. ESQUEMAS DE EXPERIENCIA LABORAL
# =====================================================================
class ExperienciaLaboralBase(BaseModel):
    empresa: str = Field(..., max_length=150)
    puesto_desempeniado: str = Field(..., max_length=150)
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    motivo_salida: Optional[str] = Field(None, max_length=255)

class ExperienciaLaboralCreate(ExperienciaLaboralBase):
    empleado_id: int

class ExperienciaLaboralResponse(ExperienciaLaboralBase):
    id: int
    empleado_id: int

    class Config:
        from_attributes = True

# =====================================================================
# 2. ESQUEMAS DE DEPENDIENTES / BENEFICIARIOS
# =====================================================================
class DependienteBase(BaseModel):
    nombre_completo: str = Field(..., max_length=200)
    parentesco: str = Field(..., max_length=50)
    fecha_nacimiento: date
    porcentaje_beneficio: float = Field(0.0, ge=0.0, le=100.0)

class DependienteCreate(DependienteBase):
    empleado_id: int

class DependienteResponse(DependienteBase):
    id: int
    empleado_id: int

    class Config:
        from_attributes = True

# =====================================================================
# 4. ESQUEMAS PRINCIPALES DE EMPLEADO
# =====================================================================
class EmpleadoBase(BaseModel):
    primer_nombre: str = Field(..., max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: str = Field(..., max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    dui: str = Field(..., max_length=10, description="Formato: 00000000-0")
    nit: str = Field(..., max_length=17, description="Formato: 0000-000000-000-0")
    isss_afiliacion: Optional[str] = Field(None, max_length=9)
    nup_afp: Optional[str] = Field(None, max_length=12)
    email_institucional: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    fecha_nacimiento: date
    genero: str = Field(..., max_length=1)
    puesto_id: Optional[int] = None
    estado_familiar: str = Field(..., max_length=20)
    profesion_oficio: str = Field(..., max_length=100)
    nacionalidad: str = Field(..., max_length=50)
    
    departamento_residencia: str = Field(..., max_length=50)
    municipio_residencia: str = Field(..., max_length=50)
    distrito_residencia: str = Field(..., max_length=50)
    
    dui_departamento_expedicion: str = Field(..., max_length=50)
    dui_municipio_expedicion: str = Field(..., max_length=50)
    dui_distrito_expedicion: str = Field(..., max_length=50)
    dui_fecha_expedicion: date

class EmpleadoCreate(EmpleadoBase):
    pass

class EmpleadoUpdate(BaseModel):
    primer_nombre: Optional[str] = Field(None, max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: Optional[str] = Field(None, max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    email_institucional: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    puesto_id: Optional[int] = None
    estado: Optional[str] = Field(None, max_length=20)
    
    departamento_residencia: Optional[str] = Field(None, max_length=50)
    municipio_residencia: Optional[str] = Field(None, max_length=50)
    distrito_residencia: Optional[str] = Field(None, max_length=50)
    
    dui_departamento_expedicion: Optional[str] = Field(None, max_length=50)
    dui_municipio_expedicion: Optional[str] = Field(None, max_length=50)
    dui_distrito_expedicion: Optional[str] = Field(None, max_length=50)
    dui_fecha_expedicion: Optional[date] = None

# =====================================================================
# 5. ESQUEMA DE RESPUESTA INTEGRAL
# =====================================================================
class EmpleadoResponse(EmpleadoBase):
    id: int
    estado: str
    estudios: List[EstudioAcademicoResponse] = []
    experiencias: List[ExperienciaLaboralResponse] = []
    dependientes: List[DependienteResponse] = []
    contratos: List[ContratoResponse] = []

    class Config:
        from_attributes = True