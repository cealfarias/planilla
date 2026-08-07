from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas
import crud

router = APIRouter(
    prefix="/organizacion",
    tags=["Jerarquía y Estructura Organizativa"]
)

@router.post("/niveles", response_model=schemas.organizacion.NivelOrganizacionalResponse, status_code=status.HTTP_201_CREATED)
def registrar_nivel_organizacional(nivel: schemas.organizacion.NivelOrganizacionalCreate, db: Session = Depends(get_db)):
    return crud.organizacion.crear_nivel_organizacional(db=db, nivel=nivel)

@router.get("/niveles", response_model=List[schemas.organizacion.NivelOrganizacionalResponse])
def listar_niveles_organizacionales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.organizacion.obtener_niveles_organizacionales(db=db, skip=skip, limit=limit)

@router.post("/unidades", response_model=schemas.organizacion.EstructuraOrganizativaResponse, status_code=status.HTTP_201_CREATED)
def registrar_unidad_organizativa(unidad: schemas.organizacion.EstructuraOrganizativaCreate, db: Session = Depends(get_db)):
    if unidad.unidad_padre_id:
        padre = crud.organizacion.obtener_unidad_organizativa(db, unidad_id=unidad.unidad_padre_id)
        if not padre:
            raise HTTPException(status_code=404, detail="La unidad organizativa padre especificada no existe.")
    return crud.organizacion.crear_unidad_organizativa(db=db, unidad=unidad)

@router.post("/puestos", response_model=schemas.organizacion.PuestoResponse, status_code=status.HTTP_201_CREATED)
def registrar_puesto(puesto: schemas.organizacion.PuestoCreate, db: Session = Depends(get_db)):
    try:
        return crud.organizacion.crear_puesto(db=db, puesto=puesto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/asignaciones", response_model=schemas.organizacion.AsignacionPuestoResponse, status_code=status.HTTP_201_CREATED)
def asignar_puesto_empleado(asignacion: schemas.organizacion.AsignacionPuestoCreate, db: Session = Depends(get_db)):
    try:
        return crud.organizacion.crear_asignacion_puesto(db=db, asignacion=asignacion)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))