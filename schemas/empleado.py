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
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    dui: Optional[str] = None
    nit: Optional[str] = None
    isss_afiliacion: Optional[str] = None
    nup_afp: Optional[str] = None
    email_institucional: Optional[str] = None
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    puesto_id: Optional[int] = None
    estado_familiar: Optional[str] = None
    profesion_oficio: Optional[str] = None
    nacionalidad: Optional[str] = None
    
    banco_nombre: Optional[str] = None
    numero_cuenta_bancaria: Optional[str] = None
    foto_url_base64: Optional[str] = None
    
    departamento_residencia: Optional[str] = None
    municipio_residencia: Optional[str] = None
    distrito_residencia: Optional[str] = None
    
    dui_departamento_expedicion: Optional[str] = None
    dui_municipio_expedicion: Optional[str] = None
    dui_distrito_expedicion: Optional[str] = None
    dui_fecha_expedicion: Optional[date] = None

class EmpleadoCreate(EmpleadoBase):
    pass

class EmpleadoUpdate(BaseModel):
    primer_nombre: Optional[str] = Field(None, max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: Optional[str] = Field(None, max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    email_institucional: Optional[str] = None
    telefono: Optional[str] = Field(None, max_length=20)
    puesto_id: Optional[int] = None
    estado: Optional[str] = Field(None, max_length=20)
    banco_nombre: Optional[str] = Field(None, max_length=100)
    numero_cuenta_bancaria: Optional[str] = Field(None, max_length=50)
    foto_url_base64: Optional[str] = None
    
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