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
        return crud.planillas.registrar_novedad_planilla(db=db, novedad=novedad, empresa_id=usuario_actual.empresa_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/prestamos/{empleado_id}",
    response_model=list[schemas.planillas.PrestamoEmpleadoResponse],
    dependencies=[Depends(VerificadorPermiso("PLA_NOVEDADES_VER"))]
)
def listar_prestamos_empleado(
    empleado_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    return crud.planillas.obtener_prestamos_empleado(db=db, empleado_id=empleado_id)

@router.post(
    "/prestamos",
    response_model=schemas.planillas.PrestamoEmpleadoResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("PLA_NOVEDADES_EDITAR"))]
)
def registrar_prestamo_empleado(
    prestamo: schemas.planillas.PrestamoEmpleadoCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.planillas.crear_prestamo_empleado(db=db, prestamo=prestamo, empresa_id=usuario_actual.empresa_id)
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

@router.get(
    "/",
    response_model=list[schemas.planillas.PeriodoPlanillaResponse],
    dependencies=[Depends(VerificadorPermiso("PLA_CONFIG_VER"))]
)
def listar_planillas(
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    return crud.planillas.obtener_planillas(db=db, empresa_id=usuario_actual.empresa_id)

@router.put(
    "/{periodo_id}/cerrar",
    response_model=schemas.planillas.PeriodoPlanillaResponse,
    dependencies=[Depends(VerificadorPermiso("PLA_CONFIG_EDITAR"))]
)
def cerrar_periodo_planilla(
    periodo_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.planillas.cerrar_planilla(db=db, periodo_id=periodo_id, empresa_id=usuario_actual.empresa_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

from fastapi.responses import StreamingResponse
import io
from utils.pdf_generator import generar_planilla_general_pdf, generar_boletas_pago_pdf

@router.get(
    "/{periodo_id}/reporte",
    dependencies=[Depends(VerificadorPermiso("PLA_CONFIG_VER"))]
)
def descargar_reporte_planilla(
    periodo_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    empresa = db.query(models.organizacion.Empresa).filter(models.organizacion.Empresa.id == usuario_actual.empresa_id).first()
    periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == periodo_id,
        models.planillas.PeriodoPlanilla.empresa_id == empresa.id
    ).first()
    
    if not periodo:
        raise HTTPException(status_code=404, detail="Período no encontrado.")
        
    boletas = db.query(models.planillas.BoletaPago).filter(
        models.planillas.BoletaPago.periodo_planilla_id == periodo.id
    ).all()
    
    pdf_bytes = generar_planilla_general_pdf(empresa, periodo, boletas, db)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes), 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Planilla_General_{periodo.codigo_periodo}.pdf"}
    )

@router.get(
    "/{periodo_id}/boletas",
    dependencies=[Depends(VerificadorPermiso("PLA_CONFIG_VER"))]
)
def descargar_boletas_pago(
    periodo_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    empresa = db.query(models.organizacion.Empresa).filter(models.organizacion.Empresa.id == usuario_actual.empresa_id).first()
    periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == periodo_id,
        models.planillas.PeriodoPlanilla.empresa_id == empresa.id
    ).first()
    
    if not periodo:
        raise HTTPException(status_code=404, detail="Período no encontrado.")
        
    boletas = db.query(models.planillas.BoletaPago).filter(
        models.planillas.BoletaPago.periodo_planilla_id == periodo.id
    ).all()
    
    pdf_bytes = generar_boletas_pago_pdf(empresa, periodo, boletas, db)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes), 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Boletas_Pago_{periodo.codigo_periodo}.pdf"}
    )