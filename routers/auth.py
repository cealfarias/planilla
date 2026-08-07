from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import crud
import schemas
import database
from auth.jwt import crear_token_acceso

router = APIRouter(prefix="/auth", tags=["Autenticación y Sesiones"])

@router.post("/login", response_model=schemas.seguridad.TokenResponse)
def login_para_obtener_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    """
    Verifica las credenciales del usuario a través de parámetros de formulario
    estándar (OAuth2), retornando el Token JWT Bearer firmado y los datos del rol.
    """
    usuario = crud.seguridad.obtener_usuario_por_username(db, username=form_data.username)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso inválidas en el sistema.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not crud.seguridad.pwd_context.verify(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso inválidas en el sistema.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not usuario.es_activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El usuario se encuentra inactivo."
        )
    
    # Extraer la lista de códigos de permisos vinculados a su Rol para el payload del JWT
    codigos_permisos = [p.codigo_permiso for p in usuario.rol.permisos] if usuario.rol else []
    
    datos_token = {
        "sub": usuario.username,
        "empresa_id": usuario.empresa_id,
        "permisos": codigos_permisos
    }
    
    token_jwt = crear_token_acceso(data=datos_token)
    
    return {
        "access_token": token_jwt,
        "token_type": "bearer",
        "username": usuario.username,
        "rol": usuario.rol.nombre_rol if usuario.rol else "Sin Rol Asignado"
    }