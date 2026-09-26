import os
import re
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import logging

load_dotenv()

def get_formatted_database_url(raw_url: str = None) -> str:
    if not raw_url:
        raw_url = os.getenv("DATABASE_URL", "sqlite:///./planillas.db")
    
    url = raw_url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and "+" not in url.split("://")[0]:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    is_sqlite = url.startswith("sqlite")
    
    if not is_sqlite and "sslmode" not in url:
        delimiter = "&" if "?" in url else "?"
        url += f"{delimiter}sslmode=require"
                
    return url

SQLALCHEMY_DATABASE_URL = get_formatted_database_url()

is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

connect_args = {"check_same_thread": False} if is_sqlite else {
    "keepalives": 1,
    "keepalives_idle": 30,
    "keepalives_interval": 10,
    "keepalives_count": 5
}

engine_kwargs = {"connect_args": connect_args, "echo": False}

if not is_sqlite:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 280,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def auto_migrate_db():
    try:
        from models.seguridad import Usuario
        from models.empresa import Empresa
        from models.recursos_humanos import Empleado, Contrato
        from models.planillas import PeriodoPlanilla, BoletaPago
        
        Base.metadata.create_all(bind=engine)
        
        columns_to_add = [
            "ALTER TABLE empleados ADD COLUMN departamento_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN municipio_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN distrito_residencia VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_departamento_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_municipio_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_distrito_expedicion VARCHAR(50) DEFAULT '' NOT NULL",
            "ALTER TABLE empleados ADD COLUMN dui_fecha_expedicion DATE DEFAULT CURRENT_DATE NOT NULL",
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
            "ALTER TABLE empresas ADD COLUMN logo_base64 TEXT",
            "ALTER TABLE empresas ADD COLUMN politica_indemnizacion VARCHAR(20) DEFAULT 'Acumulada'",
            "ALTER TABLE empleados ADD COLUMN banco_nombre VARCHAR(100)",
            "ALTER TABLE empleados ADD COLUMN numero_cuenta_bancaria VARCHAR(50)",
            "ALTER TABLE empleados ADD COLUMN foto_url_base64 TEXT"
        ]
        for col in columns_to_add:
            try:
                with engine.begin() as conn:
                    conn.execute(text(col))
            except Exception:
                pass
    except Exception as e:
        logging.error(f"Error en auto-migración: {e}")

auto_migrate_db()