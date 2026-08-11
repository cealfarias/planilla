from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from routers.auth import obtener_usuario_actual
import models
import schemas
import crud.soporte
from datetime import datetime

router = APIRouter(
    prefix="/contabilidad",
    tags=["Contabilidad & Partidas de Nómina"]
)

@router.get("/planillas/{periodo_id}/partida-contable")
def obtener_partida_contable(
    periodo_id: int,
    forma_pago: Optional[str] = "TRANSFERENCIA",
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == periodo_id,
        models.planillas.PeriodoPlanilla.empresa_id == usuario_actual.empresa_id
    ).first()

    if not periodo:
        raise HTTPException(status_code=404, detail="Período de planilla no encontrado.")

    boletas = db.query(models.planillas.BoletaPago).filter(
        models.planillas.BoletaPago.periodo_planilla_id == periodo_id
    ).all()

    if not boletas:
        raise HTTPException(status_code=400, detail="El período no tiene boletas calculadas.")

    # Inicializar agrupaciones por departamento contable
    grupos = {
        "Administrativo": {"sueldos": 0.0, "isss_patronal": 0.0, "afp_patronal": 0.0},
        "Ventas": {"sueldos": 0.0, "isss_patronal": 0.0, "afp_patronal": 0.0},
        "Costos": {"sueldos": 0.0, "isss_patronal": 0.0, "afp_patronal": 0.0}
    }

    totales_retenciones = {
        "isss_laboral": 0.0,
        "afp_laboral": 0.0,
        "isr_retenido": 0.0,
        "total_deducciones": 0.0,
        "total_liquido": 0.0
    }

    for boleta in boletas:
        emp = db.query(models.recursos_humanos.Empleado).filter(
            models.recursos_humanos.Empleado.id == boleta.empleado_id
        ).first()

        dept = (emp.departamento_costo if emp and emp.departamento_costo in grupos else "Administrativo")
        
        ingreso = float(boleta.total_ingresos or 0.0)
        grupos[dept]["sueldos"] += ingreso

        # Calcular aportes patronales (ISSS Patronal 7.5% tope $1000 = $75.00, AFP Patronal 8.75%)
        base_isss = min(ingreso, 1000.0)
        isss_pat = base_isss * 0.075
        afp_pat = ingreso * 0.0875

        grupos[dept]["isss_patronal"] += isss_pat
        grupos[dept]["afp_patronal"] += afp_pat

        # Obtener desglose de deducciones laborales
        detalles = db.query(models.planillas.BoletaPagoDetalle).filter(
            models.planillas.BoletaPagoDetalle.boleta_pago_id == boleta.id
        ).all()

        for d in detalles:
            concepto = db.query(models.planillas.ConceptoPlanilla).filter(
                models.planillas.ConceptoPlanilla.id == d.concepto_id
            ).first()
            if concepto:
                codigo = concepto.codigo.upper()
                monto = float(d.monto or 0.0)
                if "ISSS" in codigo and "PATRONAL" not in codigo:
                    totales_retenciones["isss_laboral"] += monto
                elif "AFP" in codigo and "PATRONAL" not in codigo:
                    totales_retenciones["afp_laboral"] += monto
                elif "RENTA" in codigo or "ISR" in codigo:
                    totales_retenciones["isr_retenido"] += monto

        totales_retenciones["total_deducciones"] += float(boleta.total_descuentos or 0.0)
        totales_retenciones["total_liquido"] += float(boleta.liquido_a_recibir or 0.0)

    # Construir Asiento Contable por Doble Entrada (Debe = Haber)
    asiento_lineas = []

    total_debe = 0.0
    total_haber = 0.0

    # 1. CARGOS / DEBE (Gastos y Costos)
    codigos_debe = {
        "Administrativo": {"sueldo": "6101.01", "isss": "6101.02", "afp": "6101.03", "nombre": "Gastos de Administración"},
        "Ventas": {"sueldo": "6201.01", "isss": "6201.02", "afp": "6201.03", "nombre": "Gastos de Ventas"},
        "Costos": {"sueldo": "5101.01", "isss": "5101.02", "afp": "5101.03", "nombre": "Costos de Producción / Servicios"}
    }

    for d_key, d_vals in grupos.items():
        cfg = codigos_debe[d_key]
        if d_vals["sueldos"] > 0:
            asiento_lineas.append({
                "codigo_cuenta": cfg["sueldo"],
                "nombre_cuenta": f"Sueldos y Salarios - {cfg['nombre']}",
                "debe": round(d_vals["sueldos"], 2),
                "haber": 0.0
            })
            total_debe += round(d_vals["sueldos"], 2)

        if d_vals["isss_patronal"] > 0:
            asiento_lineas.append({
                "codigo_cuenta": cfg["isss"],
                "nombre_cuenta": f"Aporte Patronal ISSS (7.5%) - {cfg['nombre']}",
                "debe": round(d_vals["isss_patronal"], 2),
                "haber": 0.0
            })
            total_debe += round(d_vals["isss_patronal"], 2)

        if d_vals["afp_patronal"] > 0:
            asiento_lineas.append({
                "codigo_cuenta": cfg["afp"],
                "nombre_cuenta": f"Aporte Patronal AFP (8.75%) - {cfg['nombre']}",
                "debe": round(d_vals["afp_patronal"], 2),
                "haber": 0.0
            })
            total_debe += round(d_vals["afp_patronal"], 2)

    # 2. ABONOS / HABER (Pasivos por Pagar y Salida de Caja/Bancos)
    total_patronal = sum(g["isss_patronal"] + g["afp_patronal"] for g in grupos.values())

    if totales_retenciones["isss_laboral"] > 0:
        asiento_lineas.append({
            "codigo_cuenta": "2102.01",
            "nombre_cuenta": "Retenciones por Pagar - ISSS Laboral (3.0%)",
            "debe": 0.0,
            "haber": round(totales_retenciones["isss_laboral"], 2)
        })
        total_haber += round(totales_retenciones["isss_laboral"], 2)

    if totales_retenciones["afp_laboral"] > 0:
        asiento_lineas.append({
            "codigo_cuenta": "2102.02",
            "nombre_cuenta": "Retenciones por Pagar - AFP Laboral (7.25%)",
            "debe": 0.0,
            "haber": round(totales_retenciones["afp_laboral"], 2)
        })
        total_haber += round(totales_retenciones["afp_laboral"], 2)

    if totales_retenciones["isr_retenido"] > 0:
        asiento_lineas.append({
            "codigo_cuenta": "2102.03",
            "nombre_cuenta": "Retenciones por Pagar - Impuesto sobre la Renta (ISR)",
            "debe": 0.0,
            "haber": round(totales_retenciones["isr_retenido"], 2)
        })
        total_haber += round(totales_retenciones["isr_retenido"], 2)

    if total_patronal > 0:
        asiento_lineas.append({
            "codigo_cuenta": "2103.01",
            "nombre_cuenta": "Aportes Patronales por Pagar (ISSS + AFP 16.25%)",
            "debe": 0.0,
            "haber": round(total_patronal, 2)
        })
        total_haber += round(total_patronal, 2)

    # Cuenta de Salida según Forma de Pago (TRANSFERENCIA, EFECTIVO, CHEQUE)
    cuenta_salida_codigo = "1101.02" if forma_pago == "TRANSFERENCIA" else "1101.01" if forma_pago == "EFECTIVO" else "1101.03"
    cuenta_salida_nombre = f"Bancos Nacionales (Davivienda - Transfer365)" if forma_pago == "TRANSFERENCIA" else "Caja General (Efectivo)" if forma_pago == "EFECTIVO" else "Cheques por Pagar / Bancos"

    asiento_lineas.append({
        "codigo_cuenta": cuenta_salida_codigo,
        "nombre_cuenta": f"{cuenta_salida_nombre} - Líquido a Pagar",
        "debe": 0.0,
        "haber": round(totales_retenciones["total_liquido"], 2)
    })
    total_haber += round(totales_retenciones["total_liquido"], 2)

    return {
        "periodo_codigo": periodo.codigo_periodo,
        "tipo_planilla": periodo.tipo_planilla.value if hasattr(periodo.tipo_planilla, "value") else str(periodo.tipo_planilla),
        "forma_pago": forma_pago,
        "lineas": asiento_lineas,
        "total_debe": round(total_debe, 2),
        "total_haber": round(total_haber, 2),
        "cuadrado": abs(round(total_debe - total_haber, 2)) < 0.05
    }

@router.post("/planillas/{periodo_id}/notificar-contador")
def notificar_contador(
    periodo_id: int,
    telefono_contador: Optional[str] = "",
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    partida = obtener_partida_contable(periodo_id=periodo_id, forma_pago="TRANSFERENCIA", db=db, usuario_actual=usuario_actual)

    mensaje_texto = (
        f"📢 *AVISO DE PAGO DE PLANILLA A CONTABILIDAD - {partida['periodo_codigo']}*\n\n"
        f"Estimado Contador, le informamos que la Planilla de Sueldos correspondiente al período *{partida['periodo_codigo']}* ya fue procesada y pagada por Recursos Humanos.\n\n"
        f"Los montos del período agrupados por Gastos de Administración, Ventas y Costos están listos para que usted (como máxima autoridad contable) elabore y valide la partida de diario de nómina:\n\n"
        f"▫️ *Cargos Estimados (Debe):* ${partida['total_debe']:,.2f}\n"
        f"▫️ *Abonos Estimados (Haber):* ${partida['total_haber']:,.2f}\n"
        f"▫️ *Estado de Balance:* {'✅ CUADRADO (PRINCIPIO DE DOBLE ENTRADA)' if partida['cuadrado'] else '⚠️ REVISAR'}\n\n"
        f"Los datos completos están disponibles en el módulo contable para su integración."
    )

    # Registrar Ticket en Inbox Interno del Propietario / Contador
    crud.soporte.crear_ticket_soporte(
        db=db,
        ticket_data=schemas.soporte.TicketSoporteCreate(
            asunto=f"📢 PLANILLA PAGADA - NOTIFICACIÓN A CONTABILIDAD: {partida['periodo_codigo']}",
            categoria="Consultoría Laboral",
            prioridad="Media",
            mensaje_inicial=mensaje_texto
        ),
        empresa_id=usuario_actual.empresa_id,
        usuario_id=usuario_actual.id
    )

    # Generar enlace de WhatsApp
    import urllib.parse
    tel_clean = "".join(filter(str.isdigit, telefono_contador)) if telefono_contador else ""
    whatsapp_url = f"https://wa.me/{tel_clean}?text={urllib.parse.quote(mensaje_texto)}" if tel_clean else f"https://wa.me/?text={urllib.parse.quote(mensaje_texto)}"

    return {
        "mensaje": "Notificación enviada al Inbox del Contador y enlace de WhatsApp generado.",
        "whatsapp_url": whatsapp_url
    }
