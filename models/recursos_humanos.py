from sqlalchemy import Column, Integer, String, Float, Boolean, Date, Time, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    primer_nombre = Column(String(50), nullable=False)
    segundo_nombre = Column(String(50), nullable=True)
    primer_apellido = Column(String(50), nullable=False)
    segundo_apellido = Column(String(50), nullable=True)
    fecha_nacimiento = Column(Date, nullable=False)
    genero = Column(String(1), nullable=False)
    estado_familiar = Column(String(20), nullable=False)
    profesion_oficio = Column(String(100), nullable=False)
    nacionalidad = Column(String(50), nullable=False)
    dui = Column(String(10), unique=True, index=True, nullable=False)
    nit = Column(String(17), unique=True, index=True, nullable=False)
    
    isss_afiliacion = Column(String(9), nullable=True)
    nup_afp = Column(String(12), nullable=True)
    puesto_id = Column(Integer, nullable=True)
    
    departamento_residencia = Column(String(50), nullable=False)
    municipio_residencia = Column(String(50), nullable=False)
    distrito_residencia = Column(String(50), nullable=False)
    
    dui_departamento_expedicion = Column(String(50), nullable=False)
    dui_municipio_expedicion = Column(String(50), nullable=False)
    dui_distrito_expedicion = Column(String(50), nullable=False)
    dui_fecha_expedicion = Column(Date, nullable=False)
    
    email_institucional = Column(String(100), unique=True, index=True, nullable=True)
    telefono = Column(String(20), nullable=True)
    
    # DATOS BANCARIOS PARA TRANSFERENCIAS
    banco_nombre = Column(String(100), nullable=True)
    numero_cuenta_bancaria = Column(String(50), nullable=True)
    foto_url_base64 = Column(Text, nullable=True)

    estado = Column(String(20), default="Activo", nullable=False)
    fecha_creacion = Column(Date, server_default=func.current_date())

    contratos = relationship("Contrato", back_populates="empleado", cascade="all, delete-orphan")
    dependientes = relationship("DependienteEconomico", back_populates="empleado", cascade="all, delete-orphan")
    estudios = relationship("EstudioAcademico", back_populates="empleado", cascade="all, delete-orphan")
    experiencias = relationship("ExperienciaLaboral", back_populates="empleado", cascade="all, delete-orphan")


class EstudioAcademico(Base):
    __tablename__ = "estudios_academicos"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    institucion = Column(String(150), nullable=False)
    titulo_obtenido = Column(String(150), nullable=False)
    fecha_graduacion = Column(Date, nullable=True)
    nivel_estudio = Column(String(50), nullable=False)

    empleado = relationship("Empleado", back_populates="estudios")


class ExperienciaLaboral(Base):
    __tablename__ = "experiencias_laborales"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    empresa = Column(String(150), nullable=False)
    puesto_desempeniado = Column(String(150), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    motivo_salida = Column(String(255), nullable=True)

    empleado = relationship("Empleado", back_populates="experiencias")


class DependienteEconomico(Base):
    __tablename__ = "dependientes_economicos"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    parentesco = Column(String(50), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    porcentaje_beneficio = Column(Float, default=0.0)

    empleado = relationship("Empleado", back_populates="dependientes")


class Contrato(Base):
    __tablename__ = "contratos"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    
    tipo_contrato = Column(String(50), nullable=False)
    cargo = Column(String(100), nullable=False)
    salario_base = Column(Float, nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    
    proporciona_alojamiento = Column(Boolean, default=False, nullable=False)
    direccion_alojamiento = Column(Text, nullable=True)
    
    dias_jornada = Column(String(100), nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    pausa_alimenticia_inicio = Column(Time, nullable=False)
    pausa_alimenticia_fin = Column(Time, nullable=False)
    horas_semanales = Column(Integer, nullable=False)
    
    medio_pago = Column(String(50), nullable=False)
    lugar_pago = Column(Text, nullable=False)
    
    herramientas_entregadas = Column(Text, nullable=True)
    lugar_entrega_herramientas = Column(String(100), nullable=True)
    
    lugar_trabajo_direccion = Column(Text, nullable=False)
    lugar_trabajo_distrito = Column(String(50), nullable=False)
    lugar_trabajo_municipio = Column(String(50), nullable=False)
    lugar_trabajo_departamento = Column(String(50), nullable=False)
    
    distrito_celebracion = Column(String(50), nullable=False)
    
    es_activo = Column(Boolean, default=True, nullable=False)

    empleado = relationship("Empleado", back_populates="contratos")

class CatalogoHabilidad(Base):
    __tablename__ = "rh_catalogo_habilidad"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)

class CatalogoIdioma(Base):
    __tablename__ = "rh_catalogo_idioma"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
