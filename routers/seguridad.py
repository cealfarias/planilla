from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import schemas
import crud

router = APIRouter(
    prefix="/seguridad",
    tags=["Seguridad y Accesos (RBAC)"]
)

@router.post("/permisos", response_model=schemas.seguridad.PermisoResponse, status_code=status.HTTP_201_CREATED)
def registrar_permiso(permiso: schemas.seguridad.PermisoCreate, db: Session = Depends(get_db)):
    db_permiso = crud.seguridad.obtener_permiso_por_codigo(db, codigo_permiso=permiso.codigo_permiso)
    if db_permiso:
        raise HTTPException(status_code=400, detail="El código de permiso ya se encuentra registrado.")
    return crud.seguridad.crear_permiso(db=db, permiso=permiso)

@router.post("/roles", response_model=schemas.seguridad.RolResponse, status_code=status.HTTP_201_CREATED)
def registrar_rol(rol: schemas.seguridad.RolCreate, db: Session = Depends(get_db)):
    db_rol = crud.seguridad.obtener_rol_por_nombre(db, nombre_rol=rol.nombre_rol)
    if db_rol:
        raise HTTPException(status_code=400, detail="El nombre del rol ya se encuentra registrado.")
    return crud.seguridad.crear_rol(db=db, rol=rol)

@router.post("/usuarios", response_model=schemas.seguridad.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: schemas.seguridad.UsuarioCreate, db: Session = Depends(get_db)):
    db_user_username = crud.seguridad.obtener_usuario_por_username(db, username=usuario.username)
    if db_user_username:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso.")
        
    db_user_email = crud.seguridad.obtener_usuario_por_email(db, email=usuario.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
        
    return crud.seguridad.crear_usuario(db=db, usuario=usuario)