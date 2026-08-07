from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from database import Base

rol_permiso = Table(
    'seg_rol_permiso', Base.metadata,
    Column('rol_id', Integer, ForeignKey('seg_rol.id'), primary_key=True),
    Column('permiso_id', Integer, ForeignKey('seg_permiso.id'), primary_key=True)
)

class Rol(Base):
    __tablename__ = "seg_rol"
    id = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String, unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    permisos = relationship("Permiso", secondary=rol_permiso, back_populates="roles")

class Permiso(Base):
    __tablename__ = "seg_permiso"
    id = Column(Integer, primary_key=True, index=True)
    codigo_permiso = Column(String, unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    roles = relationship("Rol", secondary=rol_permiso, back_populates="permisos")

class Usuario(Base):
    __tablename__ = "seg_usuario"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    es_activo = Column(Boolean, default=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    rol_id = Column(Integer, ForeignKey("seg_rol.id"), nullable=False)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=True)
    rol = relationship("Rol")
    empresa = relationship("Empresa")
