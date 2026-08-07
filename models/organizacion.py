from sqlalchemy import Column, Integer, String, Boolean, Numeric, Date, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
from models.enums import TipoUnidadEnum, FrecuenciaEnum, NivelEstudioEnum, EstadoEstudioEnum

class NivelOrganizacional(Base):
    __tablename__ = "org_nivel_organizacional"
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nombre_nivel = Column(String, nullable=False)
    peso_jerarquico = Column(Integer, nullable=False)
    es_staff = Column(Boolean, default=False)

class EstructuraOrganizativa(Base):
    __tablename__ = "org_estructura_organizativa"
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nombre_unidad = Column(String, nullable=False)
    tipo_unidad = Column(Enum(TipoUnidadEnum), nullable=False)
    unidad_padre_id = Column(Integer, ForeignKey("org_estructura_organizativa.id"), nullable=True)
    subunidades = relationship("EstructuraOrganizativa")

class Puesto(Base):
    __tablename__ = "org_puesto"
    id = Column(Integer, primary_key=True, index=True)
    nombre_puesto = Column(String, nullable=False)
    estructura_organizativa_id = Column(Integer, ForeignKey("org_estructura_organizativa.id"), nullable=False)
    nivel_organizacional_id = Column(Integer, ForeignKey("org_nivel_organizacional.id"), nullable=False)
    puesto_jefe_id = Column(Integer, ForeignKey("org_puesto.id"), nullable=True)
    es_jefatura = Column(Boolean, default=False)
    salario_minimo = Column(Numeric(10, 2), nullable=False)
    salario_maximo = Column(Numeric(10, 2), nullable=False)
    proposito_principal = Column(Text, nullable=True)
    anios_experiencia_minima = Column(Integer, default=0)

class ResponsabilidadPuesto(Base):
    __tablename__ = "org_responsabilidad_puesto"
    id = Column(Integer, primary_key=True, index=True)
    puesto_id = Column(Integer, ForeignKey("org_puesto.id"), nullable=False)
    descripcion_responsabilidad = Column(Text, nullable=False)
    frecuencia = Column(Enum(FrecuenciaEnum), nullable=False)

class RequisitoAcademicoPuesto(Base):
    __tablename__ = "org_requisito_academico"
    id = Column(Integer, primary_key=True, index=True)
    puesto_id = Column(Integer, ForeignKey("org_puesto.id"), nullable=False)
    nivel_estudio_minimo = Column(Enum(NivelEstudioEnum), nullable=False)
    area_estudio = Column(String, nullable=False)
    condicion_aceptable = Column(Enum(EstadoEstudioEnum), nullable=False)

class RequisitoHabilidadPuesto(Base):
    __tablename__ = "org_requisito_habilidad"
    id = Column(Integer, primary_key=True, index=True)
    puesto_id = Column(Integer, ForeignKey("org_puesto.id"), nullable=False)
    habilidad_id = Column(Integer, ForeignKey("rh_catalogo_habilidad.id"), nullable=False)
    porcentaje_minimo_requerido = Column(Integer, nullable=False)
    es_excluyente = Column(Boolean, default=False)

class RequisitoIdiomaPuesto(Base):
    __tablename__ = "org_requisito_idioma"
    id = Column(Integer, primary_key=True, index=True)
    puesto_id = Column(Integer, ForeignKey("org_puesto.id"), nullable=False)
    idioma_id = Column(Integer, ForeignKey("rh_catalogo_idioma.id"), nullable=False)
    nivel_conversacion_minimo = Column(Integer, default=0)
    nivel_lectura_minimo = Column(Integer, default=0)
    nivel_escritura_minimo = Column(Integer, default=0)

class AsignacionPuesto(Base):
    __tablename__ = "org_asignacion_puesto"
    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    puesto_id = Column(Integer, ForeignKey("org_puesto.id"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    salario_asignado = Column(Numeric(10, 2), nullable=False)
    motivo_asignacion = Column(String, nullable=True)
