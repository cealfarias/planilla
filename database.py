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
            # Empleados
            "ALTER TABLE empleados ADD COLUMN departamento_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN municipio_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN distrito_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_departamento_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_municipio_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_distrito_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_fecha_expedicion DATE DEFAULT CURRENT_DATE NOT NULL",
            # Contratos
            "ALTER TABLE contratos ADD COLUMN proporciona_alojamiento BOOLEAN DEFAULT FALSE NOT NULL",
            "ALTER TABLE contratos ADD COLUMN direccion_alojamiento TEXT",
            "ALTER TABLE contratos ADD COLUMN dias_jornada VARCHAR(100) DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN hora_inicio TIME DEFAULT '08:00' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN hora_fin TIME DEFAULT '17:00' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN pausa_alimenticia_inicio TIME DEFAULT '12:00' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN pausa_alimenticia_fin TIME DEFAULT '13:00' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN horas_semanales INTEGER DEFAULT 44 NOT NULL",
            "ALTER TABLE contratos ADD COLUMN medio_pago VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN lugar_pago TEXT DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN herramientas_entregadas TEXT",
            "ALTER TABLE contratos ADD COLUMN lugar_entrega_herramientas VARCHAR(100)",
            "ALTER TABLE contratos ADD COLUMN lugar_trabajo_direccion TEXT DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN lugar_trabajo_distrito VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN lugar_trabajo_municipio VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN lugar_trabajo_departamento VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE contratos ADD COLUMN distrito_celebracion VARCHAR(50) DEFAULT '' NOT NULL",
            # Empresas
            "ALTER TABLE empresas ADD COLUMN logo_base64 TEXT"
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