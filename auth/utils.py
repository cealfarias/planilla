import os
from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
from pydantic import ValidationError

# Carga de variables de entorno con valores de contingencia seguros para desarrollo
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "DESARROLLO_SECRET_KEY_NO_USAR_EN_PRODUCCION_12345")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 480

def crear_token_acceso(subject: Union[str, Any], expires_delta: int = None) -> str:
    """
    Genera un token firmado JWT utilizando el identificador único del usuario (username).
    Establece la expiración matemática del token.
    """
    if expires_delta is not None:
        expiration = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    else:
        expiration = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expiration,
        "sub": str(subject),
        "iss": "sistema_planillas_sv"
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt