from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models
from routers.auth import VerificadorPermiso

router = APIRouter(
    prefix="/empresa",
    tags=["Configuración de Empresa"]
)

@router.get("/me", response_model=schemas.empresa.EmpresaResponse)
def obtener_mi_empresa(
    db: Session = Depends(get_db),
    token_data: dict = Depends(VerificadorPermiso())
):
    empresa_id = token_data.get("empresa_id")
    empresa = db.query(models.empresa.Empresa).filter(models.empresa.Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

@router.put("/me", response_model=schemas.empresa.EmpresaResponse)
def actualizar_mi_empresa(
    empresa_update: schemas.empresa.EmpresaUpdate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(VerificadorPermiso())
):
    empresa_id = token_data.get("empresa_id")
    empresa = db.query(models.empresa.Empresa).filter(models.empresa.Empresa.id == empresa_id).first()
    
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
    update_data = empresa_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(empresa, key, value)
        
    db.commit()
    db.refresh(empresa)
    return empresa
