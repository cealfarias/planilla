import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import incluir_enrutadores

def crear_aplicacion() -> FastAPI:
    """
    Fábrica de software encargada de inicializar y parametrizar
    la instancia global del servidor FastAPI.
    """
    app = FastAPI(
        title="Sistema Profesional de Recursos Humanos y Planillas",
        description="Plataforma modular con cumplimiento fiscal de ISSS, AFP, ISR y Código de Trabajo de El Salvador.",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc"
    )

    # Configuración estricta de Orígenes Cruzados (CORS) para producción viva
    origenes_permitidos = os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origenes_permitidos,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Control e interceptación global de errores no controlados para resguardar la estabilidad
    @app.exception_handler(Exception)
    def manejador_excepciones_globales(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Error interno del servidor",
                "detalle": str(exc) if os.getenv("DEBUG") == "True" else "Ocurrió una anomalía transaccional en el backend."
            }
        )

    # Inyección atómica de la arquitectura de enrutadores unificados
    incluir_enrutadores(app)

    return app

# Instancia ejecutable de la plataforma
app = crear_aplicacion()