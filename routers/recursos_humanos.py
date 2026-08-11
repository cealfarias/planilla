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

@router.get("/empleados/plantilla-csv")
def descargar_plantilla_importacion():
    from fastapi.responses import StreamingResponse
    import io

    csv_header = (
        "primer_nombre,segundo_nombre,primer_apellido,segundo_apellido,dui,nit,nup_afp,isss,"
        "cargo,departamento_costo,salario_base,fecha_ingreso,forma_pago,banco,numero_cuenta\n"
        "Juan,Carlos,Pérez,Gómez,01234567-8,0614-010190-101-1,123456789012,123456789,"
        "Ejecutivo de Ventas,Ventas,600.00,2026-01-15,TRANSFERENCIA,BANCO_AGRICOLA,3100987654\n"
        "María,Elena,Rodríguez,López,09876543-2,0614-150592-102-2,987654432101,987654321,"
        "Contadora General,Administrativo,950.00,2025-06-01,TRANSFERENCIA,DAVIVIENDA,1029384756\n"
    )

    output = io.BytesIO()
    output.write(csv_header.encode('utf-8'))
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Plantilla_Importacion_Empleados_El_Salvador.csv"}
    )

@router.post("/empleados/importar-masivo")
def importar_empleados_masivo(
    lista_empleados: List[dict],
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    importados = 0
    omitidos = 0
    errores = []

    for item in lista_empleados:
        try:
            dui = str(item.get("dui", "")).strip()
            primer_nombre = str(item.get("primer_nombre", "")).strip()
            primer_apellido = str(item.get("primer_apellido", "")).strip()

            if not dui or not primer_nombre or not primer_apellido:
                omitidos += 1
                continue

            # Verificar duplicado
            existente = db.query(models.recursos_humanos.Empleado).filter(
                models.recursos_humanos.Empleado.empresa_id == usuario_actual.empresa_id,
                models.recursos_humanos.Empleado.dui == dui
            ).first()

            if existente:
                omitidos += 1
                continue

            # Crear empleado
            nuevo_emp = models.recursos_humanos.Empleado(
                empresa_id=usuario_actual.empresa_id,
                primer_nombre=primer_nombre,
                segundo_nombre=str(item.get("segundo_nombre", "")).strip() or None,
                primer_apellido=primer_apellido,
                segundo_apellido=str(item.get("segundo_apellido", "")).strip() or None,
                dui=dui,
                nit=str(item.get("nit", "")).strip() or None,
                nup_afp=str(item.get("nup_afp", "")).strip() or None,
                isss=str(item.get("isss", "")).strip() or None,
                departamento_costo=str(item.get("departamento_costo", "Administrativo")).strip(),
                estado="ACTIVO"
            )
            db.add(nuevo_emp)
            db.commit()
            db.refresh(nuevo_emp)

            # Crear contrato activo
            salario = float(item.get("salario_base", 365.00) or 365.00)
            fecha_ing = str(item.get("fecha_ingreso", "2026-01-01")).strip()
            nuevo_contrato = models.recursos_humanos.Contrato(
                empresa_id=usuario_actual.empresa_id,
                empleado_id=nuevo_emp.id,
                cargo=str(item.get("cargo", "Colaborador")).strip(),
                salario_base=salario,
                tipo_contrato="INDEFINIDO",
                tipo_jornada="COMPLETA",
                fecha_inicio=fecha_ing,
                estado="ACTIVO"
            )
            db.add(nuevo_contrato)
            db.commit()
            importados += 1

        except Exception as e:
            db.rollback()
            errores.append(f"Error procesando {item.get('primer_nombre')}: {str(e)}")

    return {
        "status": "ok",
        "importados": importados,
        "omitidos": omitidos,
        "errores": errores,
        "mensaje": f"Se importaron {importados} colaboradores exitosamente. {omitidos} registros omitidos (duplicados o incompletos)."
    }