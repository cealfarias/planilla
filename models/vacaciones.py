from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class ProgramacionVacacion(Base):
    __tablename__ = "rrhh_pla_programacion_vacacion"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("rrhh_empresas.id"), nullable=False)
    empleado_id = Column(Integer, ForeignKey("rrhh_empleados.id"), nullable=False)
    anio_ejercicio = Column(Integer, nullable=False)
    
    fecha_derecho = Column(Date, nullable=False)           # Fecha cumplimiento 200 días / 1 año
    fecha_limite_goce = Column(Date, nullable=False)       # Fecha derecho + 4 meses (Art. 183 CT)
    fecha_inicio_programada = Column(Date, nullable=False) # Fecha asignada por el patrono
    fecha_fin_programada = Column(Date, nullable=False)    # 15 días continuos después
    
    estado = Column(String(30), default="PROGRAMADA")       # PROGRAMADA, NOTIFICADA, GOZADA, CANCELADA
    observaciones = Column(Text, nullable=True)

    empleado = relationship("Empleado")
