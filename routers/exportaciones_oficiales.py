from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv
from datetime import datetime
from database import get_db
from routers.auth import obtener_usuario_actual
import models
import schemas
from fpdf import FPDF

router = APIRouter(
    prefix="/exportaciones",
    tags=["Exportaciones Oficiales & Reportes Avanzados"]
)

# =====================================================================
# 1. EXPORTACIÓN PLANILLA ÚNICA ISSS (FORMATO TEXTO OIR)
# =====================================================================
@router.get("/isss-txt")
def exportar_isss_txt(
    periodo_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    periodo = db.query(models.planillas.PeriodoPlanilla).filter(
        models.planillas.PeriodoPlanilla.id == periodo_id,
        models.planillas.PeriodoPlanilla.empresa_id == usuario_actual.empresa_id
    ).first()

    if not periodo:
        raise HTTPException(status_code=404, detail="Período de planilla no encontrado.")

    empresa = db.query(models.empresa.Empresa).filter(
        models.empresa.Empresa.id == usuario_actual.empresa_id
    ).first()

    boletas = db.query(models.planillas.BoletaPago).filter(
        models.planillas.BoletaPago.periodo_planilla_id == periodo_id
    ).all()

    # Formato oficial ISSS: NUM_PATRONAL|NIT_DUI|NOMBRE_COMPLETO|SALARIO_DEVENGADO|DIAS_TRABAJADOS|COTIZACION_ISSS
    lineas = []
    num_patronal = empresa.isss_patronal or "000000000"

    for b in boletas:
        emp = db.query(models.recursos_humanos.Empleado).filter(
            models.recursos_humanos.Empleado.id == b.empleado_id
        ).first()

        if emp:
            nit_dui = (emp.dui or emp.nit or "").replace("-", "").strip()
            nombre = f"{emp.primer_nombre} {emp.segundo_nombre or ''} {emp.primer_apellido} {emp.segundo_apellido or ''}".strip().upper()
            salario = f"{float(b.total_ingresos or 0.0):.2f}"
            dias = str(b.dias_trabajados or 15)

            # Buscar aporte ISSS en detalle
            isss_monto = 0.0
            detalles = db.query(models.planillas.BoletaPagoDetalle).filter(models.planillas.BoletaPagoDetalle.boleta_pago_id == b.id).all()
            for d in detalles:
                c = db.query(models.planillas.ConceptoPlanilla).filter(models.planillas.ConceptoPlanilla.id == d.concepto_id).first()
                if c and "ISSS" in c.codigo.upper() and "PATRONAL" not in c.codigo.upper():
                    isss_monto = float(d.monto or 0.0)

            lineas.append(f"{num_patronal}|{nit_dui}|{nombre}|{salario}|{dias}|{isss_monto:.2f}")

    contenido_txt = "\r\n".join(lineas)
    filename = f"Planilla_ISSS_{periodo.codigo_periodo}.txt"

    return StreamingResponse(
        io.BytesIO(contenido_txt.encode("utf-8")),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# =====================================================================
# 2. EXPORTACIÓN COTIZACIÓN AFP (FORMATO CSV CRECER / CONFIA)
# =====================================================================
@router.get("/afp-csv")
def exportar_afp_csv(
    periodo_id: int,
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

    output = io.StringIO()
    writer = csv.writer(output, delimiter=",")
    writer.writerow([
        "NUP_AFP", "TIPO_DOCUMENTO", "NUM_DOCUMENTO", "PRIMER_APELLIDO", "SEGUNDO_APELLIDO", 
        "PRIMER_NOMBRE", "SEGUNDO_NOMBRE", "DEVENGADO", "COTIZACION_LABORAL", "COTIZACION_PATRONAL"
    ])

    for b in boletas:
        emp = db.query(models.recursos_humanos.Empleado).filter(
            models.recursos_humanos.Empleado.id == b.empleado_id
        ).first()

        if emp:
            devengado = float(b.total_ingresos or 0.0)
            afp_lab = devengado * 0.0725
            afp_pat = devengado * 0.0875

            writer.writerow([
                emp.nup_afp or "000000000000",
                "DUI",
                (emp.dui or "").replace("-", ""),
                emp.primer_apellido.upper(),
                (emp.segundo_apellido or "").upper(),
                emp.primer_nombre.upper(),
                (emp.segundo_nombre or "").upper(),
                f"{devengado:.2f}",
                f"{afp_lab:.2f}",
                f"{afp_pat:.2f}"
            ])

    filename = f"Planilla_AFP_{periodo.codigo_periodo}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# =====================================================================
# 3. ARCHIVO DE PAGO MASIVO BANCARIO (TELEBANCA / DAVIBOX / BAC)
# =====================================================================
@router.get("/pago-masivo-banco")
def exportar_pago_masivo_banco(
    periodo_id: int,
    banco: str = "BANCO_AGRICOLA",
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

    lineas = []
    for b in boletas:
        emp = db.query(models.recursos_humanos.Empleado).filter(
            models.recursos_humanos.Empleado.id == b.empleado_id
        ).first()

        if emp:
            cuenta = (emp.numero_cuenta_bancaria or "000000000000").replace("-", "").strip()
            nombre = f"{emp.primer_nombre} {emp.primer_apellido}".strip().upper()
            monto = f"{float(b.liquido_a_recibir or 0.0):.2f}"
            banco_emp = emp.banco_nombre or "BANCO AGRICOLA"

            if "AGRICOLA" in banco.upper():
                # Formato Telebanca Agrícola: CUENTA|MONTO|NOMBRE|CONCEPTO
                lineas.append(f"{cuenta}|{monto}|{nombre}|PAGO PLANILLA {periodo.codigo_periodo}")
            elif "DAVIVIENDA" in banco.upper():
                # Formato Davibox: CUENTA,MONTO,DUI,NOMBRE
                dui = (emp.dui or "").replace("-", "")
                lineas.append(f"{cuenta},{monto},{dui},{nombre}")
            else:
                # Formato Estándar Transfer365
                lineas.append(f"{banco_emp}\t{cuenta}\t{monto}\t{nombre}\t{periodo.codigo_periodo}")

    contenido = "\r\n".join(lineas)
    ext = "txt" if "AGRICOLA" in banco.upper() else "csv"
    filename = f"Pago_Masivo_{banco}_{periodo.codigo_periodo}.{ext}"

    return StreamingResponse(
        io.BytesIO(contenido.encode("utf-8")),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# =====================================================================
# 4. REPORTE ANUAL F-910 MINISTERIO DE HACIENDA (RETENCIONES ISR)
# =====================================================================
@router.get("/f910-hacienda")
def exportar_f910_hacienda(
    anio: int = 2026,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    empresa = db.query(models.empresa.Empresa).filter(
        models.empresa.Empresa.id == usuario_actual.empresa_id
    ).first()

    empleados = db.query(models.recursos_humanos.Empleado).filter(
        models.recursos_humanos.Empleado.empresa_id == usuario_actual.empresa_id
    ).all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow([
        "NIT_EMPRESA", "NIT_EMPLEADO", "DUI", "NOMBRE_COMPLETO", 
        "TOTAL_DEVENGADO_ANUAL", "ISSS_ANUAL", "AFP_ANUAL", "RENTA_RETENIDA_ANUAL", "MONTO_LIQUIDO_ANUAL"
    ])

    for emp in empleados:
        # Sumar todas las boletas del año
        boletas = db.query(models.planillas.BoletaPago).join(models.planillas.PeriodoPlanilla).filter(
            models.planillas.BoletaPago.empleado_id == emp.id,
            models.planillas.PeriodoPlanilla.fecha_inicio >= f"{anio}-01-01",
            models.planillas.PeriodoPlanilla.fecha_fin <= f"{anio}-12-31"
        ).all()

        t_devengado = sum(float(b.total_ingresos or 0.0) for b in boletas)
        t_liquido = sum(float(b.liquido_a_recibir or 0.0) for b in boletas)
        t_isss = t_devengado * 0.03
        t_afp = t_devengado * 0.0725
        t_renta = sum(float(b.total_descuentos or 0.0) for b in boletas) - (t_isss + t_afp)
        if t_renta < 0: t_renta = 0.0

        if t_devengado > 0:
            nombre = f"{emp.primer_nombre} {emp.segundo_nombre or ''} {emp.primer_apellido} {emp.segundo_apellido or ''}".strip().upper()
            writer.writerow([
                (empresa.nit or "").replace("-", ""),
                (emp.nit or "").replace("-", ""),
                (emp.dui or "").replace("-", ""),
                nombre,
                f"{t_devengado:.2f}",
                f"{t_isss:.2f}",
                f"{t_afp:.2f}",
                f"{t_renta:.2f}",
                f"{t_liquido:.2f}"
            ])

    filename = f"Informe_F910_Hacienda_{anio}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# =====================================================================
# 5. CÁLCULO DE LIQUIDACIÓN, INDEMNIZACIÓN Y FINIQUITO (ART. 58 C.T.)
# =====================================================================
class LiquidacionRequest(schemas.BaseModel):
    empleado_id: int
    motivo: str = "Despido Injustificado" # Despido Injustificado, Renuncia Voluntaria
    fecha_salida: str
    salario_mensual: float
    anios_servicio: float

@router.post("/liquidar-finiquito")
def calcular_liquidar_finiquito(
    req: LiquidacionRequest,
    db: Session = Depends(get_db),
    usuario_actual: models.seguridad.Usuario = Depends(obtener_usuario_actual)
):
    emp = db.query(models.recursos_humanos.Empleado).filter(
        models.recursos_humanos.Empleado.id == req.empleado_id,
        models.recursos_humanos.Empleado.empresa_id == usuario_actual.empresa_id
    ).first()

    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")

    empresa = db.query(models.empresa.Empresa).filter(models.empresa.Empresa.id == usuario_actual.empresa_id).first()

    # Cálculo Ley: Art. 58 C.T. (1 salario mínimo o sueldo mensual por año trabajado, max 4 salarios mínimos por año)
    salario_diario = req.salario_mensual / 30.0
    
    # Indemnización (Solo despido)
    indemnizacion = (req.salario_mensual * req.anios_servicio) if "Despido" in req.motivo else 0.0
    
    # Vacación proporcional (15 días + 30% recargo proporcional)
    vacacion_prop = (salario_diario * 15 * 1.30) * (req.anios_servicio % 1.0)
    
    # Aguinaldo proporcional (15 a 21 días proporcional)
    dias_aguinaldo = 15 if req.anios_servicio < 3 else (19 if req.anios_servicio < 10 else 21)
    aguinaldo_prop = (salario_diario * dias_aguinaldo) * (req.anios_servicio % 1.0)

    total_liquidacion = indemnizacion + vacacion_prop + aguinaldo_prop

    # Generar PDF Finiquito de Trabajo
    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, f"FINIQUITO Y LIQUIDACIÓN LABORAL", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, f"Empresa: {empresa.nombre} | NIT: {empresa.nit}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("helvetica", "B", 11)
    nombre_emp = f"{emp.primer_nombre} {emp.primer_apellido}".upper()
    pdf.cell(0, 8, f"COLABORADOR: {nombre_emp} | DUI: {emp.dui}", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, f"Motivo de Salida: {req.motivo} | Antigüedad: {req.anios_servicio:.2f} años", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Detalle Financiero
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(120, 8, "Concepto de Liquidación", border=1)
    pdf.cell(60, 8, "Monto (USD)", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("helvetica", "", 10)
    pdf.cell(120, 7, f"Indemnización por Tiempo de Servicio (Art. 58 C.T.)", border=1)
    pdf.cell(60, 7, f"${indemnizacion:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(120, 7, f"Vacación Proporcional Remunerada + 30% (Art. 177 C.T.)", border=1)
    pdf.cell(60, 7, f"${vacacion_prop:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.cell(120, 7, f"Aguinaldo Proporcional de Ley (Art. 196 C.T.)", border=1)
    pdf.cell(60, 7, f"${aguinaldo_prop:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("helvetica", "B", 11)
    pdf.cell(120, 8, "TOTAL NETO A RECIBIR EN FINIQUITO", border=1)
    pdf.cell(60, 8, f"${total_liquidacion:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(15)
    pdf.set_font("helvetica", "I", 9)
    pdf.multi_cell(0, 5, f"Declaración de Finiquito: El suscrito {nombre_emp} declara haber recibido a su entera satisfacción la suma de ${total_liquidacion:.2f} en concepto de liquidación final, no teniendo nada más que reclamar a la empresa por salarios o prestaciones.")

    pdf.ln(25)
    pdf.cell(90, 6, "F. ___________________________", align="C")
    pdf.cell(90, 6, "F. ___________________________", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(90, 5, f"Firma Colaborador ({nombre_emp})", align="C")
    pdf.cell(90, 5, f"Firma Patrono / RRHH ({empresa.nombre})", align="C")

    buffer = io.BytesIO()
    buffer.write(pdf.output())
    buffer.seek(0)

    filename = f"Finiquito_{nombre_emp.replace(' ', '_')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
