from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from database import get_db
from auth.dependencies import obtener_usuario_actual
import models.seguridad
import models.recursos_humanos
import models.vacaciones
import schemas.vacaciones

router = APIRouter(prefix="/vacaciones", tags=["Vacaciones MTPS"])

def add_months(sourcedate, months):
    import calendar
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

@router.get("/programacion", response_model=List[schemas.vacaciones.ProgramacionVacacionResponse])
def obtener_programacion_vacaciones(
    anio: int = date.today().year,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    empleados = db.query(models.recursos_humanos.Empleado).filter(
        models.recursos_humanos.Empleado.empresa_id == usuario_actual.empresa_id,
        models.recursos_humanos.Empleado.estado == "Activo"
    ).all()

    resultado = []
    today = date.today()

    for emp in empleados:
        contrato = db.query(models.recursos_humanos.Contrato).filter(
            models.recursos_humanos.Contrato.empleado_id == emp.id,
            models.recursos_humanos.Contrato.es_activo == True
        ).first()

        fecha_inicio_labores = contrato.fecha_inicio if contrato else (emp.fecha_creacion or today)
        dias_trabajados = (today - fecha_inicio_labores).days
        cumple_200 = dias_trabajados >= 200

        # Fecha cumplimiento 1 año
        fecha_derecho = date(fecha_inicio_labores.year + 1, fecha_inicio_labores.month, min(fecha_inicio_labores.day, 28))
        fecha_limite = add_months(fecha_derecho, 4)

        # Buscar si ya tiene programacion
        prog = db.query(models.vacaciones.ProgramacionVacacion).filter(
            models.vacaciones.ProgramacionVacacion.empresa_id == usuario_actual.empresa_id,
            models.vacaciones.ProgramacionVacacion.empleado_id == emp.id,
            models.vacaciones.ProgramacionVacacion.anio_ejercicio == anio
        ).first()

        if prog:
            fecha_inc = prog.fecha_inicio_programada
            fecha_fin = prog.fecha_fin_programada
            estado = prog.estado
            prog_id = prog.id
        else:
            fecha_inc = date(anio, fecha_derecho.month, min(fecha_derecho.day, 28))
            fecha_fin = fecha_inc + timedelta(days=15)
            estado = "PROGRAMADA"
            prog_id = 0

        resultado.append(schemas.vacaciones.ProgramacionVacacionResponse(
            id=prog_id,
            empresa_id=usuario_actual.empresa_id,
            empleado_id=emp.id,
            anio_ejercicio=anio,
            fecha_derecho=fecha_derecho,
            fecha_limite_goce=fecha_limite,
            fecha_inicio_programada=fecha_inc,
            fecha_fin_programada=fecha_fin,
            estado=estado,
            nombre_empleado=f"{emp.primer_nombre} {emp.primer_apellido}",
            cumple_200_dias=cumple_200,
            dias_trabajados_acumulados=dias_trabajados
        ))

    return resultado

@router.post("/programacion")
def guardar_programacion_vacaciones(
    req: schemas.vacaciones.ProgramacionVacacionCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    try:
        emp = db.query(models.recursos_humanos.Empleado).filter(
            models.recursos_humanos.Empleado.id == req.empleado_id,
            models.recursos_humanos.Empleado.empresa_id == usuario_actual.empresa_id
        ).first()

        if not emp:
            raise HTTPException(status_code=404, detail="Empleado no encontrado.")

        contrato = db.query(models.recursos_humanos.Contrato).filter(
            models.recursos_humanos.Contrato.empleado_id == emp.id,
            models.recursos_humanos.Contrato.es_activo == True
        ).first()

        fecha_inicio_labores = contrato.fecha_inicio if contrato else date.today()
        fecha_derecho = date(req.fecha_inicio_programada.year, fecha_inicio_labores.month, min(fecha_inicio_labores.day, 28))
        fecha_limite = add_months(fecha_derecho, 4)
        fecha_fin = req.fecha_inicio_programada + timedelta(days=15)

        prog = db.query(models.vacaciones.ProgramacionVacacion).filter(
            models.vacaciones.ProgramacionVacacion.empresa_id == usuario_actual.empresa_id,
            models.vacaciones.ProgramacionVacacion.empleado_id == req.empleado_id,
            models.vacaciones.ProgramacionVacacion.anio_ejercicio == req.anio_ejercicio
        ).first()

        if not prog:
            prog = models.vacaciones.ProgramacionVacacion(
                empresa_id=usuario_actual.empresa_id,
                empleado_id=req.empleado_id,
                anio_ejercicio=req.anio_ejercicio,
                fecha_derecho=fecha_derecho,
                fecha_limite_goce=fecha_limite,
                fecha_inicio_programada=req.fecha_inicio_programada,
                fecha_fin_programada=fecha_fin,
                estado="PROGRAMADA",
                observaciones=req.observaciones
            )
            db.add(prog)
        else:
            prog.fecha_inicio_programada = req.fecha_inicio_programada
            prog.fecha_fin_programada = fecha_fin
            prog.fecha_derecho = fecha_derecho
            prog.fecha_limite_goce = fecha_limite
            prog.observaciones = req.observaciones

        db.commit()
        return {"mensaje": "Programación de vacaciones guardada con éxito."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
