from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas
import crud
import models
from auth.dependencies import obtener_usuario_actual

router = APIRouter(
    prefix="/recursos-humanos",
    tags=["Recursos Humanos (Perfil 360)"]
)

@router.post(
    "/empleados", 
    response_model=schemas.empleado.EmpleadoResponse, 
    status_code=status.HTTP_201_CREATED
)
def registrar_empleado(
    empleado: schemas.empleado.EmpleadoCreate, 
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
    status_code=status.HTTP_201_CREATED
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
    response_model=List[schemas.empleado.EmpleadoResponse]
)
def listar_todos_los_empleados(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    return crud.recursos_humanos.listar_empleados(db=db, empresa_id=usuario_actual.empresa_id, skip=skip, limit=limit)

@router.post(
    "/estudios", 
    response_model=schemas.recursos_humanos.EstudioAcademicoResponse, 
    status_code=status.HTTP_201_CREATED
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
    status_code=status.HTTP_201_CREATED
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

@router.put(
    "/empleados/{empleado_id}/estado",
    response_model=schemas.empleado.EmpleadoResponse
)
def cambiar_estado_empleado(
    empleado_id: int,
    estado: str,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.recursos_humanos.cambiar_estado_empleado(db=db, empleado_id=empleado_id, empresa_id=usuario_actual.empresa_id, estado=estado)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put(
    "/empleados/{empleado_id}",
    response_model=schemas.empleado.EmpleadoResponse
)
def actualizar_empleado(
    empleado_id: int,
    datos: schemas.empleado.EmpleadoUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        return crud.recursos_humanos.actualizar_empleado(db=db, empleado_id=empleado_id, empresa_id=usuario_actual.empresa_id, datos=datos)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))