from pydantic import BaseModel
from typing import Optional

class EmpresaBase(BaseModel):
    nombre: str
    nit: str
    nrc: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    politica_indemnizacion: Optional[str] = "Acumulada"

class EmpresaResponse(EmpresaBase):
    id: int
    es_activa: bool
    logo_base64: Optional[str] = None

    class Config:
        from_attributes = True

class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    nrc: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    logo_base64: Optional[str] = None
    politica_indemnizacion: Optional[str] = None
