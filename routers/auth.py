from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import crud
import schemas
import database
from auth.jwt import crear_token_acceso
import models

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

@router.post("/registro", status_code=status.HTTP_201_CREATED)
def registrar_nueva_empresa(
    registro: schemas.seguridad.RegistroSaaSRequest,
    db: Session = Depends(database.get_db)
):
    # 1. Validar si el NIT o el usuario ya existen
    empresa_existente = db.query(models.empresa.Empresa).filter(
        models.empresa.Empresa.nit == registro.empresa_nit
    ).first()
    if empresa_existente:
        raise HTTPException(status_code=400, detail="Ya existe una empresa con ese NIT.")
        
    usuario_existente = db.query(models.seguridad.Usuario).filter(
        (models.seguridad.Usuario.username == registro.admin_username) |
        (models.seguridad.Usuario.email == registro.admin_email)
    ).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El nombre de usuario o correo ya está en uso.")

    try:
        # 2. Crear la Empresa
        nueva_empresa = models.empresa.Empresa(
            nombre=registro.empresa_nombre,
            nit=registro.empresa_nit,
            es_activa=True
        )
        db.add(nueva_empresa)
        db.flush() # Para obtener el ID de la empresa sin hacer commit

        # 3. Buscar el rol de administrador (si no existe lo creamos o usamos fallback)
        rol_admin = db.query(models.seguridad.Rol).filter(
            models.seguridad.Rol.nombre_rol == "Administrador de Sistemas"
        ).first()
        
        # 4. Crear el Usuario Administrador
        hash_seguro = crud.seguridad.pwd_context.hash(registro.admin_password)
        nuevo_usuario = models.seguridad.Usuario(
            username=registro.admin_username,
            email=registro.admin_email,
            password_hash=hash_seguro,
            es_activo=True,
            empresa_id=nueva_empresa.id,
            rol_id=rol_admin.id if rol_admin else 1, # Fallback seguro
            empleado_id=None
        )
        db.add(nuevo_usuario)
        
        # Opcional: Guardar el flag de publicidad (aceptar_publicidad) en una tabla futura
        
        db.commit()
        return {"mensaje": "Empresa y administrador registrados con éxito. Ya puedes iniciar sesión."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar: {str(e)}")