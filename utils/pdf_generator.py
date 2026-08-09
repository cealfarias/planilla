import io
from fpdf import FPDF
from datetime import datetime
from services.calculos_ley import calcular_liquidacion_boleta
from sqlalchemy.orm import Session
import crud

class ReportePlanilla(FPDF):
    def __init__(self, empresa, periodo):
        super().__init__(orientation="L", unit="mm", format="A4")
        self.empresa = empresa
        self.periodo = periodo

    def header(self):
        self.set_font("helvetica", "B", 14)
        self.cell(0, 10, f"Planilla General - {self.empresa.nombre}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("helvetica", "", 10)
        self.cell(0, 6, f"NIT: {self.empresa.nit}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 6, f"Período: {self.periodo.codigo_periodo} ({self.periodo.fecha_inicio} al {self.periodo.fecha_fin})", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

        # Table Header
        self.set_font("helvetica", "B", 9)
        self.set_fill_color(220, 220, 220)
        self.cell(10, 8, "ID", border=1, fill=True, align="C")
        self.cell(50, 8, "Empleado", border=1, fill=True)
        self.cell(25, 8, "S. Base", border=1, fill=True, align="C")
        self.cell(25, 8, "Ingresos", border=1, fill=True, align="C")
        self.cell(25, 8, "ISSS", border=1, fill=True, align="C")
        self.cell(25, 8, "AFP", border=1, fill=True, align="C")
        self.cell(25, 8, "Renta", border=1, fill=True, align="C")
        self.cell(25, 8, "Préstamos", border=1, fill=True, align="C")
        self.cell(30, 8, "T. Descuentos", border=1, fill=True, align="C")
        self.cell(30, 8, "Líquido", border=1, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")

    def footer(self):
        self.set_y(-15)
        # Nota de licencia (Watermark)
        self.set_font("helvetica", "B", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, "Generado por Administración Planilla de Sueldos SaaS (Licencia Freeware).", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("helvetica", "I", 7)
        self.cell(0, 5, "Para remover esta marca de agua y obtener soporte prioritario, por favor actualice su licencia a Premium.", align="C", new_x="LMARGIN", new_y="NEXT")
        
        # Paginación
        self.set_font("helvetica", "I", 8)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, f"Página {self.page_no()}/{{nb}} - Generado el {datetime.now().strftime('%Y-%m-%d %H:%M')}", align="C")


class BoletaPagoPDF(FPDF):
    def __init__(self, empresa, periodo):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.empresa = empresa
        self.periodo = periodo

    def footer(self):
        self.set_y(-15)
        # Nota de licencia (Watermark)
        self.set_font("helvetica", "B", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, "Generado por Administración Planilla de Sueldos SaaS (Licencia Freeware).", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("helvetica", "I", 7)
        self.cell(0, 5, "Para remover esta marca de agua, actualice a Premium.", align="C", new_x="LMARGIN", new_y="NEXT")
        
        self.set_font("helvetica", "I", 8)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, f"Generado el {datetime.now().strftime('%Y-%m-%d %H:%M')}", align="C")


def generar_planilla_general_pdf(empresa, periodo, boletas, db: Session) -> bytes:
    pdf = ReportePlanilla(empresa, periodo)
    pdf.add_page()
    
    pdf.set_font("helvetica", "", 9)
    
    totales = {
        "s_base": 0, "ingresos": 0, "isss": 0, "afp": 0, "renta": 0,
        "prestamos": 0, "t_desc": 0, "liquido": 0
    }
    
    import models
    for boleta in boletas:
        empleado = db.query(models.recursos_humanos.Empleado).filter(models.recursos_humanos.Empleado.id == boleta.empleado_id).first()
        
        resultado_calculo = calcular_liquidacion_boleta(float(boleta.salario_base_aplicado))
        isss = resultado_calculo["deduccion_isss"]
        afp = resultado_calculo["deduccion_afp"]
        renta = resultado_calculo["deduccion_isr"]
        prestamos = float(boleta.total_descuentos) - resultado_calculo["total_deducciones"]
        if prestamos < 0: prestamos = 0
        
        pdf.cell(10, 8, str(empleado.id), border=1, align="C")
        nombre_trunc = f"{empleado.primer_nombre} {empleado.primer_apellido}"[:22]
        pdf.cell(50, 8, nombre_trunc, border=1)
        pdf.cell(25, 8, f"${boleta.salario_base_aplicado:.2f}", border=1, align="R")
        pdf.cell(25, 8, f"${boleta.total_ingresos:.2f}", border=1, align="R")
        pdf.cell(25, 8, f"${isss:.2f}", border=1, align="R")
        pdf.cell(25, 8, f"${afp:.2f}", border=1, align="R")
        pdf.cell(25, 8, f"${renta:.2f}", border=1, align="R")
        pdf.cell(25, 8, f"${prestamos:.2f}", border=1, align="R")
        pdf.cell(30, 8, f"${boleta.total_descuentos:.2f}", border=1, align="R")
        pdf.cell(30, 8, f"${boleta.liquido_a_recibir:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        totales["s_base"] += float(boleta.salario_base_aplicado)
        totales["ingresos"] += float(boleta.total_ingresos)
        totales["isss"] += isss
        totales["afp"] += afp
        totales["renta"] += renta
        totales["prestamos"] += prestamos
        totales["t_desc"] += float(boleta.total_descuentos)
        totales["liquido"] += float(boleta.liquido_a_recibir)

    # Totales Row
    pdf.set_font("helvetica", "B", 9)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(60, 8, "TOTALES GENERALES", border=1, fill=True, align="R")
    pdf.cell(25, 8, f"${totales['s_base']:.2f}", border=1, fill=True, align="R")
    pdf.cell(25, 8, f"${totales['ingresos']:.2f}", border=1, fill=True, align="R")
    pdf.cell(25, 8, f"${totales['isss']:.2f}", border=1, fill=True, align="R")
    pdf.cell(25, 8, f"${totales['afp']:.2f}", border=1, fill=True, align="R")
    pdf.cell(25, 8, f"${totales['renta']:.2f}", border=1, fill=True, align="R")
    pdf.cell(25, 8, f"${totales['prestamos']:.2f}", border=1, fill=True, align="R")
    pdf.cell(30, 8, f"${totales['t_desc']:.2f}", border=1, fill=True, align="R")
    pdf.cell(30, 8, f"${totales['liquido']:.2f}", border=1, fill=True, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(20)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(100, 8, "_____________________________________", align="C")
    pdf.cell(100, 8, "_____________________________________", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(100, 6, "Firma del Representante Legal / RRHH", align="C")
    pdf.cell(100, 6, "Sello de la Empresa", align="C", new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())


def generar_boletas_pago_pdf(empresa, periodo, boletas, db: Session) -> bytes:
    pdf = BoletaPagoPDF(empresa, periodo)
    
    import models
    for boleta in boletas:
        empleado = db.query(models.recursos_humanos.Empleado).filter(models.recursos_humanos.Empleado.id == boleta.empleado_id).first()
        resultado_calculo = calcular_liquidacion_boleta(float(boleta.salario_base_aplicado))
        
        pdf.add_page()
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, "BOLETA DE PAGO DE SALARIO", align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 6, f"Empresa: {empresa.nombre} (NIT: {empresa.nit})", align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f"Período: {periodo.codigo_periodo} ({periodo.fecha_inicio} al {periodo.fecha_fin})", align="C", new_x="LMARGIN", new_y="NEXT")
        
        pdf.ln(10)
        pdf.set_font("helvetica", "B", 11)
        pdf.cell(0, 8, f"Datos del Empleado:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 10)
        pdf.cell(50, 6, f"Nombre Completo:")
        pdf.cell(0, 6, f"{empleado.primer_nombre} {empleado.primer_apellido}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(50, 6, f"DUI:")
        pdf.cell(0, 6, f"{empleado.dui or 'N/A'}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(50, 6, f"Días Trabajados:")
        pdf.cell(0, 6, f"{boleta.dias_trabajados}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(50, 6, f"Salario Base Mensual:")
        pdf.cell(0, 6, f"${boleta.salario_base_aplicado:.2f}", new_x="LMARGIN", new_y="NEXT")
        
        pdf.ln(5)
        
        # Tabla de Detalles
        pdf.set_font("helvetica", "B", 10)
        pdf.set_fill_color(220, 220, 220)
        pdf.cell(130, 8, "Concepto", border=1, fill=True)
        pdf.cell(30, 8, "Ingreso", border=1, fill=True, align="R")
        pdf.cell(30, 8, "Descuento", border=1, fill=True, align="R", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("helvetica", "", 10)
        
        pdf.cell(130, 8, "Salario Base", border=1)
        pdf.cell(30, 8, f"${boleta.salario_base_aplicado:.2f}", border=1, align="R")
        pdf.cell(30, 8, "", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        pdf.cell(130, 8, "Retención ISSS", border=1)
        pdf.cell(30, 8, "", border=1, align="R")
        pdf.cell(30, 8, f"${resultado_calculo['deduccion_isss']:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        pdf.cell(130, 8, "Retención AFP", border=1)
        pdf.cell(30, 8, "", border=1, align="R")
        pdf.cell(30, 8, f"${resultado_calculo['deduccion_afp']:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        pdf.cell(130, 8, "Impuesto Sobre la Renta (ISR)", border=1)
        pdf.cell(30, 8, "", border=1, align="R")
        pdf.cell(30, 8, f"${resultado_calculo['deduccion_isr']:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        prestamos = float(boleta.total_descuentos) - resultado_calculo["total_deducciones"]
        if prestamos > 0.01:
            pdf.cell(130, 8, "Préstamos / Embargos Activos", border=1)
            pdf.cell(30, 8, "", border=1, align="R")
            pdf.cell(30, 8, f"${prestamos:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
                
        # Resumen
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(130, 8, "TOTALES", border=1, align="R")
        pdf.cell(30, 8, f"${boleta.total_ingresos:.2f}", border=1, align="R")
        pdf.cell(30, 8, f"${boleta.total_descuentos:.2f}", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        pdf.ln(5)
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(130, 10, "LÍQUIDO A RECIBIR:", align="R")
        pdf.set_text_color(0, 128, 0)
        pdf.cell(60, 10, f"${boleta.liquido_a_recibir:.2f}", align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)
        
        pdf.ln(30)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, "________________________________________________", align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, "Firma de Recibido Conforme", align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f"{empleado.primer_nombre} {empleado.primer_apellido}", align="C", new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())
