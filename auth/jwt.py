import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from dotenv import load_dotenv

load_dotenv()

# Configuración de variables de entorno para la firma segura
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CualquierClaveSecretaSuperSeguraParaPlanillasSV2026*")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Empaqueta los claims del usuario y sus permisos en un token string 
    criptográficamente firmado mediante codificación simétrica.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Inyectar expiración estándar en el payload (claim exp)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt