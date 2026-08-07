from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
import os
import models
import database
from auth.utils import JWT_SECRET_KEY, JWT_ALGORITHM

# Configuración del esquema de lectura de tokens en cabeceras HTTP estándar
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)) -> models.seguridad.Usuario:
    """
    Dependencia reutilizable que intercepta la petición, decodifica el token JWT 
    y retorna el objeto Usuario completo con sus relaciones de rol y permisos.
    """
    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales de acceso.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credenciales_exception
    except (jwt.PyJWTError, ValidationError):
        raise credenciales_exception
        
    # Consultar la persistencia para asegurar que el usuario existe y está activo
    usuario = db.query(models.seguridad.Usuario).filter(
        models.seguridad.Usuario.username == username
    ).first()
    
    if usuario is None:
        raise credenciales_exception
        
    if not usuario.es_activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="El usuario se encuentra inactivo en el sistema corporativo."
        )
        
    return usuario

class VerificadorPermiso:
    """
    Clase de control para implementar RBAC estricto a nivel de endpoints.
    Verifica si el código del permiso requerido se encuentra dentro de la lista de permisos del rol del usuario.
    """
    def __init__(self, codigo_permiso_requerido: str):
        self.codigo_permiso_requerido = codigo_permiso_requerido

    def __call__(self, usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)) -> bool:
        if not usuario_actual.rol:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario no tiene asignado ningún rol de acceso institucional."
            )
            
        # Extraer los códigos de permisos asociados al rol actual del usuario
        codigos_permisos_usuario = [p.codigo_permiso for p in usuario_actual.rol.permisos]
        
        if self.codigo_permiso_requerido not in codigos_permisos_usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere el permiso específico: [{self.codigo_permiso_requerido}]."
            )
            
        return True