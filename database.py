import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Obtener la URL de la base de datos
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada. Verifica el archivo .env.")

# Crear el motor de conexión dinámicamente
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    echo=False, 
    connect_args=connect_args
)

# Configurar la fábrica de sesiones transaccionales
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base que todos los modelos heredan
Base = declarative_base()

# Dependencia para inyectar la sesión de base de datos en las rutas de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import text
import logging

def auto_migrate_db():
    try:
        # Importar modelos aquí para evitar dependencias circulares
        from models.seguridad import Usuario
        from models.empresa import Empresa
        from models.recursos_humanos import Empleado, Contrato
        from models.planillas import PeriodoPlanilla, BoletaPago
        
        # Crear tablas nuevas si no existen
        Base.metadata.create_all(bind=engine)
        
        # Migraciones para columnas añadidas
        columns_to_add = [
            "ALTER TABLE empleados ADD COLUMN departamento_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN municipio_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN distrito_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_departamento_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_municipio_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_distrito_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_fecha_expedicion DATE DEFAULT CURRENT_DATE NOT NULL"
        ]
        for col in columns_to_add:
            try:
                with engine.begin() as conn:
                    conn.execute(text(col))
            except Exception as e:
                pass
    except Exception as e:
        logging.error(f"Error en auto-migración: {e}")

# Ejecutar migración al iniciar
auto_migrate_db()