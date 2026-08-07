from fastapi import FastAPI
from .api import api_router
from .views import router as views_router

def incluir_enrutadores(app: FastAPI) -> None:
    """
    Orquesta la inyección masiva de rutas en la instancia del servidor.
    Mantiene separadas las rutas de servicios de datos de las rutas visuales de usuario.
    """
    # 1. Rutas de interfaces web (HTML) - Raíz limpia
    app.include_router(views_router)
    
    # 2. Rutas de servicios de backend (JSON REST) - Prefijadas bajo /api/v1
    app.include_router(api_router)