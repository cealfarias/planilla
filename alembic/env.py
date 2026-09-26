import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv

# 1. Importar la Base y todos los modelos para que Alembic detecte la estructura
from database import Base
import models  # Esto ejecuta models/__init__.py, cargando todas las tablas

# Cargar variables de entorno
load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada.")

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif database_url.startswith("postgresql://") and "+" not in database_url.split("://")[0]:
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

import re
is_render = os.getenv("RENDER") == "true" or os.path.exists("/opt/render")

if is_render and "@dpg-" in database_url:
    database_url = re.sub(r'(@dpg-[a-z0-9]+-[a-z0-9]+)\.[a-z0-9-]+\.render\.com', r'\1', database_url)
    database_url = re.sub(r'(@dpg-[a-z0-9]+-[a-z0-9]+)\.render\.com', r'\1', database_url)

if "postgresql" in database_url and "sslmode" not in database_url and not is_render:
    delimiter = "&" if "?" in database_url else "?"
    database_url += f"{delimiter}sslmode=require"

config.set_main_option("sqlalchemy.url", database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Asignar la metadata de los modelos a Alembic
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True, # Obligatorio para SQLite3
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            render_as_batch=True # Obligatorio para SQLite3
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()