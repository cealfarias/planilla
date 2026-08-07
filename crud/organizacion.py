from sqlalchemy.orm import Session
from decimal import Decimal
import models
import schemas

# ==========================================
# OPERACIONES DE NIVEL ORGANIZACIONAL
# ==========================================
def obtener_niveles_organizacionales(db: Session, empresa_id: int, skip: int = 0, limit: int = 100):
    """Retorna la lista de niveles organizacionales ordenados por peso jerárquico."""
    return db.query(models.organizacion.NivelOrganizacional).filter(
        models.organizacion.NivelOrganizacional.empresa_id == empresa_id
    ).order_by(
        models.organizacion.NivelOrganizacional.peso_jerarquico.asc()
    ).offset(skip).limit(limit).all()

def crear_nivel_organizacional(db: Session, nivel: schemas.organizacion.NivelOrganizacionalCreate, empresa_id: int):
    """Registra un nuevo nivel jerárquico en la organización."""
    db_nivel = models.organizacion.NivelOrganizacional(
        empresa_id=empresa_id,
        nombre_nivel=nivel.nombre_nivel,
        peso_jerarquico=nivel.peso_jerarquico,
        es_staff=nivel.es_staff
    )
    db.add(db_nivel)
    db.commit()
    db.refresh(db_nivel)
    return db_nivel

# ==========================================
# OPERACIONES DE ESTRUCTURA ORGANIZATIVA
# ==========================================
def obtener_unidad_organizativa(db: Session, unidad_id: int, empresa_id: int):
    """Busca una unidad específica (ej. Gerencia) por su ID."""
    return db.query(models.organizacion.EstructuraOrganizativa).filter(
        models.organizacion.EstructuraOrganizativa.id == unidad_id,
        models.organizacion.EstructuraOrganizativa.empresa_id == empresa_id
    ).first()

def crear_unidad_organizativa(db: Session, unidad: schemas.organizacion.EstructuraOrganizativaCreate, empresa_id: int):
    """Inserta una unidad en el organigrama y la vincula a un padre si aplica."""
    db_unidad = models.organizacion.EstructuraOrganizativa(
        empresa_id=empresa_id,
        nombre_unidad=unidad.nombre_unidad,
        tipo_unidad=unidad.tipo_unidad,
        unidad_padre_id=unidad.unidad_padre_id
    )
    db.add(db_unidad)
    db.commit()
    db.refresh(db_unidad)
    return db_unidad

# ==========================================
# OPERACIONES DE PUESTOS
# ==========================================
def obtener_puesto_por_id(db: Session, puesto_id: int):
    """Busca la definición de un puesto en la base de datos."""
    return db.query(models.organizacion.Puesto).filter(
        models.organizacion.Puesto.id == puesto_id
    ).first()

def crear_puesto(db: Session, puesto: schemas.organizacion.PuestoCreate):
    """Registra un puesto validando que los rangos financieros sean congruentes."""
    if puesto.salario_minimo > puesto.salario_maximo:
        raise ValueError("El salario mínimo no puede ser mayor al salario máximo establecido.")
        
    db_puesto = models.organizacion.Puesto(
        nombre_puesto=puesto.nombre_puesto,
        estructura_organizativa_id=puesto.estructura_organizativa_id,
        nivel_organizacional_id=puesto.nivel_organizacional_id,
        puesto_jefe_id=puesto.puesto_jefe_id,
        es_jefatura=puesto.es_jefatura,
        salario_minimo=puesto.salario_minimo,
        salario_maximo=puesto.salario_maximo,
        proposito_principal=puesto.proposito_principal,
        anios_experiencia_minima=puesto.anios_experiencia_minima
    )
    db.add(db_puesto)
    db.commit()
    db.refresh(db_puesto)
    return db_puesto

# ==========================================
# OPERACIONES DE ASIGNACIÓN DE PUESTOS
# ==========================================
def obtener_asignacion_actual_empleado(db: Session, empleado_id: int):
    """Obtiene la asignación de puesto vigente de un empleado (fecha_fin es nulo)."""
    return db.query(models.organizacion.AsignacionPuesto).filter(
        models.organizacion.AsignacionPuesto.empleado_id == empleado_id,
        models.organizacion.AsignacionPuesto.fecha_fin.is_(None)
    ).first()

def crear_asignacion_puesto(db: Session, asignacion: schemas.organizacion.AsignacionPuestoCreate):
    """
    Vincula un empleado a un puesto específico.
    Valida estrictamente los límites del salario asignado contra el perfil del puesto.
    """
    puesto = obtener_puesto_por_id(db, puesto_id=asignacion.puesto_id)
    if not puesto:
        raise ValueError(f"El puesto con ID {asignacion.puesto_id} no existe.")

    # Regla de negocio: Validación de topes salariales del puesto
    if asignacion.salario_asignado < puesto.salario_minimo or asignacion.salario_asignado > puesto.salario_maximo:
        raise ValueError(
            f"El salario asignado (${asignacion.salario_asignado}) está fuera del rango "
            f"permitido para este puesto (${puesto.salario_minimo} - ${puesto.salario_maximo})."
        )

    # Regla de negocio: Finalizar la asignación anterior si existe
    asignacion_previa = obtener_asignacion_actual_empleado(db, empleado_id=asignacion.empleado_id)
    if asignacion_previa:
        asignacion_previa.fecha_fin = asignacion.fecha_inicio

    db_asignacion = models.organizacion.AsignacionPuesto(
        empleado_id=asignacion.empleado_id,
        puesto_id=asignacion.puesto_id,
        fecha_inicio=asignacion.fecha_inicio,
        fecha_fin=None,
        salario_asignado=asignacion.salario_asignado,
        motivo_asignacion=asignacion.motivo_asignacion
    )
    db.add(db_asignacion)
    db.commit()
    db.refresh(db_asignacion)
    return db_asignacion