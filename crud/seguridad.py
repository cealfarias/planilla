from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models
import schemas

# Configuración del contexto de hasheo utilizando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# OPERACIONES DE PERMISOS
# ==========================================
def obtener_permiso_por_codigo(db: Session, codigo_permiso: str):
    """Busca un permiso específico en la base de datos por su código único."""
    return db.query(models.seguridad.Permiso).filter(
        models.seguridad.Permiso.codigo_permiso == codigo_permiso
    ).first()

def crear_permiso(db: Session, permiso: schemas.seguridad.PermisoCreate):
    """Registra un nuevo permiso en el sistema."""
    db_permiso = models.seguridad.Permiso(
        codigo_permiso=permiso.codigo_permiso,
        descripcion=permiso.descripcion
    )
    db.add(db_permiso)
    db.commit()
    db.refresh(db_permiso)
    return db_permiso

# ==========================================
# OPERACIONES DE ROLES
# ==========================================
def obtener_rol_por_nombre(db: Session, nombre_rol: str):
    """Busca un rol por su nombre único."""
    return db.query(models.seguridad.Rol).filter(
        models.seguridad.Rol.nombre_rol == nombre_rol
    ).first()

def crear_rol(db: Session, rol: schemas.seguridad.RolCreate):
    """Crea un rol y le asocia una lista de IDs de permisos existentes."""
    db_rol = models.seguridad.Rol(
        nombre_rol=rol.nombre_rol,
        descripcion=rol.descripcion
    )
    
    # Asignar permisos si se proporcionaron IDs válidos
    if rol.permisos_ids:
        permisos = db.query(models.seguridad.Permiso).filter(
            models.seguridad.Permiso.id.in_(rol.permisos_ids)
        ).all()
        db_rol.permisos = permisos
        
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol

# ==========================================
# OPERACIONES DE USUARIOS
# ==========================================
def obtener_usuario_por_username(db: Session, username: str):
    """Busca un usuario activo o inactivo por su username único."""
    return db.query(models.seguridad.Usuario).filter(
        models.seguridad.Usuario.username == username
    ).first()

def obtener_usuario_por_email(db: Session, email: str):
    """Busca un usuario por su correo electrónico único."""
    return db.query(models.seguridad.Usuario).filter(
        models.seguridad.Usuario.email == email
    ).first()

def crear_usuario(db: Session, usuario: schemas.seguridad.UsuarioCreate):
    """Crea un usuario hasheando su contraseña y asociándolo a un rol."""
    # Hashear la contraseña en texto plano utilizando el contexto de passlib
    hashed_password = pwd_context.hash(usuario.password)
    
    db_usuario = models.seguridad.Usuario(
        username=usuario.username,
        email=usuario.email,
        password_hash=hashed_password,
        es_activo=usuario.es_activo if hasattr(usuario, 'es_activo') else True,
        empresa_id=usuario.empresa_id,
        rol_id=usuario.rol_id,
        empleado_id=usuario.empleado_id
    )
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con el hash almacenado."""
    return pwd_context.verify(plain_password, hashed_password)