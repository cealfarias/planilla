from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- Esquemas de Permisos (RBAC) ---

class PermisoBase(BaseModel):
    """Atributos compartidos para el manejo de permisos de la aplicación."""
    codigo_permiso: str
    descripcion: Optional[str] = None

class PermisoCreate(PermisoBase):
    """Esquema de validación para la creación de un nuevo permiso en la base de datos."""
    pass

class PermisoResponse(PermisoBase):
    """Esquema de salida con datos serializados desde la base de datos."""
    id: int

    class Config:
        from_attributes = True


# --- Esquemas de Roles ---

class RolBase(BaseModel):
    nombre_rol: str
    descripcion: Optional[str] = None

class RolCreate(RolBase):
    permisos_ids: List[int] = []

class RolResponse(RolBase):
    id: int
    permisos: List[PermisoResponse] = []

    class Config:
        from_attributes = True


# --- Esquemas de Usuarios y Autenticación ---

class UsuarioBase(BaseModel):
    username: str
    email: EmailStr
    es_activo: bool = True
    empresa_id: int
    rol_id: int
    empleado_id: Optional[int] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioResponse(UsuarioBase):
    id: int
    rol: Optional[RolResponse] = None

    class Config:
        from_attributes = True


# --- Esquemas de Autenticación JWT (OAuth2) ---

class TokenResponse(BaseModel):
    """Esquema profesional para el retorno de credenciales JWT al iniciar sesión."""
    access_token: str
    token_type: str
    username: str
    rol: str

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    """Esquema para almacenar los datos decodificados del payload del JWT."""
    username: Optional[str] = None
    empresa_id: Optional[int] = None
    permisos: List[str] = []

# --- Esquema de Registro SaaS (Onboarding) ---

class RegistroSaaSRequest(BaseModel):
    empresa_nombre: str
    empresa_nit: str
    admin_username: str
    admin_email: EmailStr
    admin_password: str
    aceptar_publicidad: bool = False

# --- Esquemas Google SSO ---

class GoogleLoginRequest(BaseModel):
    token: str

class GoogleRegistroRequest(BaseModel):
    token: str
    empresa_nombre: str
    empresa_nit: str
    aceptar_publicidad: bool = False