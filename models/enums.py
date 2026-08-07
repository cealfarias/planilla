import enum

class GeneroEnum(enum.Enum):
    MASCULINO = "Masculino"
    FEMENINO = "Femenino"

class NivelEstudioEnum(enum.Enum):
    BASICA = "Educación Básica"
    BACHILLERATO = "Bachillerato"
    TECNICO = "Técnico"
    PREGRADO = "Pregrado/Licenciatura/Ingeniería"
    POSTGRADO = "Postgrado/Maestría"
    DOCTORADO = "Doctorado"
    CERTIFICACION = "Certificación Especializada"

class EstadoEstudioEnum(enum.Enum):
    GRADUADO = "Graduado"
    EGRESADO = "Egresado"
    EN_CURSO = "En Curso"
    INCOMPLETO = "Incompleto"

class NivelDominioEnum(enum.Enum):
    BASICO = "Básico"
    INTERMEDIO = "Intermedio"
    AVANZADO = "Avanzado"
    EXPERTO = "Experto"
    NATIVO = "Nativo"

class EstadoEmpleadoEnum(enum.Enum):
    ACTIVO = "Activo"
    SUSPENDIDO = "Suspendido"
    INACTIVO = "Inactivo"

class FrecuenciaEnum(enum.Enum):
    DIARIA = "Diaria"
    SEMANAL = "Semanal"
    MENSUAL = "Mensual"
    OCASIONAL = "Ocasional"

class TipoUnidadEnum(enum.Enum):
    DIRECCION = "Dirección"
    GERENCIA = "Gerencia"
    DEPARTAMENTO = "Departamento"
    SECCION = "Sección"
    UNIDAD = "Unidad"
    AREA = "Área"

class TipoConceptoEnum(enum.Enum):
    INGRESO = "Ingreso"
    DESCUENTO = "Descuento"
    APORTE_PATRONAL = "Aporte Patronal"
    PROVISION = "Provisión"

class PeriodoRentaEnum(enum.Enum):
    QUINCENAL = "Quincenal"
    MENSUAL = "Mensual"

class TipoPlanillaEnum(enum.Enum):
    QUINCENAL = "Quincenal"
    MENSUAL = "Mensual"
    AGUINALDO = "Aguinaldo"
    VACACIONES = "Vacaciones"

class EstadoPlanillaEnum(enum.Enum):
    ABIERTA = "Abierta"
    EN_PROCESO = "En Proceso"
    CERRADA = "Cerrada"
    PAGADA = "Pagada"

class TipoPrestamoEnum(enum.Enum):
    INTERNO = "Interno"
    BANCARIO = "Bancario"
    EMBARGO_JUDICIAL = "Embargo Judicial"
    ANTICIPO = "Anticipo"

class EstadoPrestamoEnum(enum.Enum):
    ACTIVO = "Activo"
    PAGADO = "Pagado"
    SUSPENDIDO = "Suspendido"

class MotivoSalidaEnum(enum.Enum):
    DESPIDO_INJUSTIFICADO = "Despido Injustificado"
    DESPIDO_JUSTIFICADO = "Despido Justificado"
    RENUNCIA_VOLUNTARIA = "Renuncia Voluntaria"
    MUTUO_ACUERDO = "Mutuo Acuerdo"
    JUBILACION = "Jubilación"
    DEFUNCION = "Defunción"

class EstadoLiquidacionEnum(enum.Enum):
    BORRADOR = "Borrador"
    APROBADA = "Aprobada"
    PAGADA = "Pagada"
