from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import schemas
import crud
import models
from auth.dependencies import obtener_usuario_actual, VerificadorPermiso

router = APIRouter(
    prefix="/planillas",
    tags=["Motor de Planillas y Liquidaciones"]
)

@router.post(
    "/parametros", 
    response_model=schemas.planillas.ParametroGlobalResponse,
    dependencies=[Depends(VerificadorPermiso("PLA_PARAM_EDITAR"))]
)
def configurar_parametro_global(
    parametro: schemas.planillas.ParametroGlobalCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    return crud.planillas.crear_o_actualizar_parametro(db=db, parametro=parametro)

@router.post(
    "/conceptos", 
    response_model=schemas.planillas.ConceptoPlanillaResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("PLA_CONFIG_EDITAR"))]
)
def registrar_concepto_salarial(
    concepto: schemas.planillas.ConceptoPlanillaCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    return crud.planillas.crear_concepto_planilla(db=db, concepto=concepto)

@router.post(
    "/novedades", 
    response_model=schemas.planillas.NovedadPlanillaResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("PLA_NOVEDADES_EDITAR"))]
)
def ingresar_novedad_periodo(
    novedad: schemas.planillas.NovedadPlanillaCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.planillas.registrar_novedad_planilla(db=db, novedad=novedad)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/liquidaciones", 
    response_model=schemas.planillas.LiquidacionEmpleadoResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("PLA_LIQ_PROCESAR"))]
)
def procesar_liquidacion_empleado(
    liquidacion: schemas.planillas.LiquidacionEmpleadoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.planillas.crear_liquidacion_empleado(db=db, liquidacion=liquidacion)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/procesar", 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("PLA_CONFIG_EDITAR"))]
)
def procesar_nomina_mensual(
    periodo: schemas.planillas.PeriodoPlanillaCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.planillas.procesar_planilla_mensual(db=db, periodo=periodo, empresa_id=usuario_actual.empresa_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))