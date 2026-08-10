from fastapi import APIRouter
from routers.auth import router as auth_router
from routers.seguridad import router as seguridad_router
from routers.organizacion import router as organizacion_router
from routers.recursos_humanos import router as rh_router
from routers.planillas import router as planillas_router
from routers.empresa import router as empresa_router
from routers.vacaciones import router as vacaciones_router
from routers.soporte import router as soporte_router

# Enrutador maestro para la API de datos puros
api_router = APIRouter(prefix="/api/v1")

# Acoplamiento atómico de los submódulos funcionales
api_router.include_router(auth_router)
api_router.include_router(seguridad_router)
api_router.include_router(organizacion_router)
api_router.include_router(rh_router)
api_router.include_router(planillas_router)
api_router.include_router(empresa_router)
api_router.include_router(vacaciones_router)
api_router.include_router(soporte_router)