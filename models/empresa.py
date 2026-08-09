from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    nit = Column(String(17), unique=True, index=True, nullable=False)
    nrc = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    telefono = Column(String(20), nullable=True)
    es_activa = Column(Boolean, default=True, nullable=False)
    logo_base64 = Column(Text, nullable=True)
