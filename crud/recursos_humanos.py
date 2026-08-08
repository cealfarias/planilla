from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models.recursos_humanos import Empleado, Contrato
import schemas

def crear_empleado(db: Session, empleado: schemas.empleado.EmpleadoCreate, empresa_id: int):
    """
    Inserta un nuevo registro de empleado validando de forma específica 
    la duplicidad de restricciones únicas (DUI, NIT, Email) por empresa.
    """
    # 1. Validación específica e individual de campos únicos
    empleado_dui = db.query(Empleado).filter(Empleado.dui == empleado.dui, Empleado.empresa_id == empresa_id).first()
    if empleado_dui:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El Documento Único de Identidad (DUI) ingresado ya se encuentra registrado en el sistema."
        )

    empleado_nit = db.query(Empleado).filter(Empleado.nit == empleado.nit, Empleado.empresa_id == empresa_id).first()
    if empleado_nit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El Número de Identificación Tributaria (NIT) ingresado ya se encuentra registrado en el sistema."
        )

    if empleado.email_institucional:
        empleado_email = db.query(Empleado).filter(Empleado.email_institucional == empleado.email_institucional, Empleado.empresa_id == empresa_id).first()
        if empleado_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico institucional ingresado ya está asignado a otro colaborador."
            )

    # 2. Construcción del objeto si pasa los filtros previos
    db_empleado = Empleado(
        empresa_id=empresa_id,
        primer_nombre=empleado.primer_nombre,
        segundo_nombre=empleado.segundo_nombre,
        primer_apellido=empleado.primer_apellido,
        segundo_apellido=empleado.segundo_apellido,
        dui=empleado.dui,
        nit=empleado.nit,
        isss_afiliacion=empleado.isss_afiliacion,
        nup_afp=empleado.nup_afp,
        email_institucional=empleado.email_institucional,
        telefono=empleado.telefono,
        fecha_nacimiento=empleado.fecha_nacimiento,
        genero=empleado.genero,
        estado_familiar=empleado.estado_familiar,
        profesion_oficio=empleado.profesion_oficio,
        nacionalidad=empleado.nacionalidad,
        departamento_residencia=empleado.departamento_residencia,
        municipio_residencia=empleado.municipio_residencia,
        distrito_residencia=empleado.distrito_residencia,
        dui_departamento_expedicion=empleado.dui_departamento_expedicion,
        dui_municipio_expedicion=empleado.dui_municipio_expedicion,
        dui_distrito_expedicion=empleado.dui_distrito_expedicion,
        dui_fecha_expedicion=empleado.dui_fecha_expedicion,
        puesto_id=empleado.puesto_id,
        estado="Activo"
    )
    
    try:
        db.add(db_empleado)
        db.commit()
        db.refresh(db_empleado)
        return db_empleado
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad de datos no controlado en la base de datos."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado en el servidor al persistir el empleado: {str(e)}"
        )


def listar_empleados(db: Session, empresa_id: int, skip: int = 0, limit: int = 100):
    """
    Recupera la lista de empleados registrados con soporte para paginación básica.
    """
    return db.query(Empleado).filter(Empleado.empresa_id == empresa_id).offset(skip).limit(limit).all()


def obtener_empleado(db: Session, empleado_id: int, empresa_id: int):
    """
    Busca y retorna un empleado específico mediante su identificador primario.
    """
    return db.query(Empleado).filter(Empleado.id == empleado_id, Empleado.empresa_id == empresa_id).first()


def crear_contrato(db: Session, contrato: schemas.contrato.ContratoCreate, empresa_id: int):
    """
    Inserta un nuevo contrato para el empleado y desactiva los anteriores.
    """
    empleado_existente = db.query(Empleado).filter(Empleado.id == contrato.empleado_id, Empleado.empresa_id == empresa_id).first()
    if not empleado_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el empleado con ID {contrato.empleado_id} o no pertenece a tu empresa."
        )
        
    try:
        db.query(Contrato).filter(
            Contrato.empleado_id == contrato.empleado_id,
            Contrato.es_activo == True
        ).update({"es_activo": False})
        
        db_contrato = Contrato(
            empleado_id=contrato.empleado_id,
            tipo_contrato=contrato.tipo_contrato,
            cargo=contrato.cargo,
            salario_base=contrato.salario_base,
            fecha_inicio=contrato.fecha_inicio,
            fecha_fin=contrato.fecha_fin,
            lugar_trabajo=contrato.lugar_trabajo,
            horario_trabajo=contrato.horario_trabajo,
            forma_pago=contrato.forma_pago,
            municipio_celebracion=contrato.municipio_celebracion,
            es_activo=contrato.es_activo
        )
        
        db.add(db_contrato)
        db.commit()
        db.refresh(db_contrato)
        return db_contrato
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al persistir el contrato en SQLite: {str(e)}"
        )


def obtener_contratos_por_empleado(db: Session, empleado_id: int, empresa_id: int):
    """
    Devuelve el historial completo de contratos de un empleado.
    """
    empleado = obtener_empleado(db, empleado_id, empresa_id)
    if not empleado:
        return []
        
    return db.query(Contrato).filter(
        Contrato.empleado_id == empleado_id
    ).order_by(Contrato.fecha_inicio.desc()).all()


def obtener_contrato_activo(db: Session, empleado_id: int, empresa_id: int):
    """
    Devuelve estrictamente el contrato activo de un empleado.
    """
    empleado = obtener_empleado(db, empleado_id, empresa_id)
    if not empleado:
        return None
        
    return db.query(Contrato).filter(
        Contrato.empleado_id == empleado_id,
        Contrato.es_activo == True
    ).first()