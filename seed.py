import sys
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from crud.seguridad import pwd_context

def poblar_datos_iniciales():
    """
    Inserta de forma atómica los datos base de configuración de seguridad
    necesarios para el arranque inicial de la plataforma de planillas.
    """
    db: Session = SessionLocal()
    print("Iniciando proceso de inicialización de base de datos (Seeding)...")
    
    try:
        # 1. Definición exhaustiva de los permisos RBAC requeridos
        lista_permisos = [
            {"codigo_permiso": "RH_EMPLEADOS_CREAR", "descripcion": "Permite registrar nuevos colaboradores en el sistema."},
            {"codigo_permiso": "RH_EMPLEADOS_LEER", "descripcion": "Permite visualizar el expediente digital general de empleados."},
            {"codigo_permiso": "RH_EXPEDIENTE_EDITAR", "descripcion": "Permite modificar estudios, experiencia y habilidades en el Perfil 360."},
            {"codigo_permiso": "PLA_PARAM_EDITAR", "descripcion": "Permite modificar los parámetros de ley y tramos de ISR salvadoreños."},
            {"codigo_permiso": "PLA_CONFIG_EDITAR", "descripcion": "Permite configurar conceptos salariales gravados o exentos."},
            {"codigo_permiso": "PLA_NOVEDADES_EDITAR", "descripcion": "Permite ingresar incidencias del periodo a las planillas."},
            {"codigo_permiso": "PLA_LIQ_PROCESAR", "descripcion": "Permite procesar indemnizaciones y finiquitos legales por retiro o jubilación."}
        ]
        
        objetos_permisos_creados = []
        for p in lista_permisos:
            permiso_existente = db.query(models.seguridad.Permiso).filter(
                models.seguridad.Permiso.codigo_permiso == p["codigo_permiso"]
            ).first()
            
            if not permiso_existente:
                db_permiso = models.seguridad.Permiso(
                    codigo_permiso=p["codigo_permiso"],
                    descripcion=p["descripcion"]
                )
                db.add(db_permiso)
                objetos_permisos_creados.append(db_permiso)
                print(f" -> Permiso registrado: {p['codigo_permiso']}")
            else:
                objetos_permisos_creados.append(permiso_existente)
        
        # Guardar cambios parciales de permisos
        db.commit()
        
        # 2. Creación del Rol Administrativo Global
        nombre_rol_admin = "Administrador de Sistemas"
        rol_admin_existente = db.query(models.seguridad.Rol).filter(
            models.seguridad.Rol.nombre_rol == nombre_rol_admin
        ).first()
        
        if not rol_admin_existente:
            rol_admin_existente = models.seguridad.Rol(
                nombre_rol=nombre_rol_admin,
                descripcion="Acceso total a las configuraciones de seguridad, estructura y motor de nóminas."
            )
            # Vincular todos los permisos del sistema a este rol
            rol_admin_existente.permisos = objetos_permisos_creados
            db.add(rol_admin_existente)
            db.commit()
            db.refresh(rol_admin_existente)
            print(f" -> Rol registrado: '{nombre_rol_admin}' con {len(objetos_permisos_creados)} permisos asociados.")
        else:
            print(f" -> El rol '{nombre_rol_admin}' ya se encuentra en el sistema.")
            
        # 3. Creación del Usuario Administrador Inicial
        username_inicial = "admin_planilla"
        usuario_existente = db.query(models.seguridad.Usuario).filter(
            models.seguridad.Usuario.username == username_inicial
        ).first()
        
        if not usuario_existente:
            # Primero crear la Empresa base para el administrador global (SaaS)
            empresa_base = db.query(models.empresa.Empresa).filter(
                models.empresa.Empresa.nit == "0000-000000-000-0"
            ).first()
            if not empresa_base:
                empresa_base = models.empresa.Empresa(
                    nit="0000-000000-000-0",
                    nombre="Administración Central SaaS",
                    es_activa=True
                )
                db.add(empresa_base)
                db.commit()
                db.refresh(empresa_base)
                
            # Contraseña por defecto para el primer acceso seguro
            password_plana = "AdminPlanilla2026*"
            hash_seguro = pwd_context.hash(password_plana)
            
            usuario_inicial = models.seguridad.Usuario(
                username=username_inicial,
                email="sistemas.admin@empresa.com.sv",
                password_hash=hash_seguro,
                es_activo=True,
                rol_id=rol_admin_existente.id,
                empresa_id=empresa_base.id,
                empleado_id=None  # Usuario de TI global, no vinculado a expediente laboral
            )
            db.add(usuario_inicial)
            db.commit()
            print("=====================================================================")
            print("¡USUARIO ADMINISTRADOR CREADO CON ÉXITO!")
            print(f" Username: {username_inicial}")
            print(f" Password: {password_plana}")
            print(" Por favor resguarde y cambie estas credenciales en producción viva.")
            print("=====================================================================")
        else:
            print(f" -> El usuario '{username_inicial}' ya existe en el sistema.")
            
    except Exception as e:
        db.rollback()
        print(f"\nError durante el proceso de Seeding: {str(e)}")
        sys.exit(1)
    finally:
        db.close()
        print("Proceso de inicialización cerrado de forma limpia.")

if __name__ == "__main__":
    poblar_datos_iniciales()