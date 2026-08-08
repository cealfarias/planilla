from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas
import crud
import models
from auth.dependencies import obtener_usuario_actual, VerificadorPermiso

router = APIRouter(
    prefix="/recursos-humanos",
    tags=["Recursos Humanos (Perfil 360)"]
)

@router.post(
    "/empleados", 
    response_model=schemas.recursos_humanos.EmpleadoResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("RH_EMPLEADOS_CREAR"))]
)
def registrar_empleado(
    empleado: schemas.recursos_humanos.EmpleadoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.recursos_humanos.crear_empleado(db=db, empleado=empleado, empresa_id=usuario_actual.empresa_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/empleados/{empleado_id}/contratos", 
    response_model=schemas.contrato.ContratoResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("RH_EMPLEADOS_CREAR"))]
)
def registrar_contrato_empleado(
    empleado_id: int,
    contrato: schemas.contrato.ContratoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        contrato.empleado_id = empleado_id
        return crud.recursos_humanos.crear_contrato(db=db, contrato=contrato, empresa_id=usuario_actual.empresa_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/empleados", 
    response_model=List[schemas.recursos_humanos.EmpleadoResponse],
    dependencies=[Depends(VerificadorPermiso("RH_EMPLEADOS_LEER"))]
)
def listar_todos_los_empleados(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    return crud.recursos_humanos.listar_empleados(db=db, skip=skip, limit=limit)

@router.post(
    "/estudios", 
    response_model=schemas.recursos_humanos.EstudioAcademicoResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("RH_EXPEDIENTE_EDITAR"))]
)
def asociar_estudio_academico(
    estudio: schemas.recursos_humanos.EstudioAcademicoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.recursos_humanos.agregar_estudio_academico(db=db, estudio=estudio)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/experiencias", 
    response_model=schemas.recursos_humanos.ExperienciaLaboralResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(VerificadorPermiso("RH_EXPEDIENTE_EDITAR"))]
)
def asociar_experiencia_laboral(
    experiencia: schemas.recursos_humanos.ExperienciaLaboralCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.recursos_humanos.agregar_experiencia_laboral(db=db, experiencia=experiencia)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))