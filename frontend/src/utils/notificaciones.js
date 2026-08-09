/**
 * Helper de Notificaciones Multicanal (WhatsApp y Email)
 */

export const notificarVacacionWhatsApp = (emp, fechaInicio, fechaFin, empresaNombre = "SaaS Planilla") => {
  const telefono = (emp.telefono || "").replace(/[^0-9]/g, "");
  const nombreComp = `${emp.nombre_empleado || emp.primer_nombre || 'Colaborador'}`;
  
  const mensaje = 
`📌 *NOTIFICACIÓN OFICIAL DE VACACIONES (Art. 182 Código de Trabajo)*

Estimado/a *${nombreComp}*,

Por este medio la empresa *${empresaNombre}* le notifica con la anticipación legal requerida (al menos 30 días previos / Art. 182 C.T.) la programación de su período anual de vacaciones remuneradas:

📅 *Fecha de Inicio:* ${fechaInicio}
📅 *Fecha de Reincorporación:* ${fechaFin}
🌴 *Duración:* 15 días continuos remunerados con el 30% de recargo legal (Art. 177 C.T.).

Atentamente,
*Departamento de Gestión Humana - ${empresaNombre}*`;

  const phoneParam = telefono.length >= 8 ? (telefono.length === 8 ? `503${telefono}` : telefono) : "";
  const url = `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
};

export const notificarVacacionEmail = (emp, fechaInicio, fechaFin, empresaNombre = "SaaS Planilla") => {
  const email = emp.email_institucional || emp.correo_personal || "";
  const nombreComp = `${emp.nombre_empleado || emp.primer_nombre || 'Colaborador'}`;
  
  const asunto = `Notificación Oficial de Vacaciones - ${empresaNombre}`;
  const cuerpo = 
`Estimado/a ${nombreComp},

Por este medio se le notifica oficialmente con el preaviso legal de 30 días (Art. 182 del Código de Trabajo de El Salvador) que su período de vacaciones anuales remuneradas ha sido programado de la siguiente manera:

- Fecha de inicio: ${fechaInicio}
- Fecha de retorno: ${fechaFin}
- Período: 15 días continuos remunerados (+30% recargo vacacional legal).

Saludos cordiales,
Departamento de Recursos Humanos - ${empresaNombre}`;

  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.location.href = mailtoUrl;
};

export const notificarBoletaWhatsApp = (emp, periodoCodigo, liquido, empresaNombre = "SaaS Planilla") => {
  const telefono = (emp.telefono || "").replace(/[^0-9]/g, "");
  const nombreComp = `${emp.nombre_completo || emp.primer_nombre || 'Colaborador'}`;

  const mensaje = 
`📄 *COMPROBANTE DE PAGO DE NÓMINA*

Estimado/a *${nombreComp}*,

Le informamos que se ha procesado con éxito su boleta de pago para el período *${periodoCodigo}* en *${empresaNombre}*.

💰 *Líquido a Recibir / Depositado:* $${parseFloat(liquido).toFixed(2)}

Puede consultar y descargar el desglose detallado de sus retenciones de ley (ISSS, AFP, Renta) en la plataforma.

Atentamente,
*Administración de Nómina - ${empresaNombre}*`;

  const phoneParam = telefono.length >= 8 ? (telefono.length === 8 ? `503${telefono}` : telefono) : "";
  const url = `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
};

export const notificarBoletaEmail = (emp, periodoCodigo, liquido, empresaNombre = "SaaS Planilla") => {
  const email = emp.email_institucional || emp.correo_personal || "";
  const nombreComp = `${emp.nombre_completo || emp.primer_nombre || 'Colaborador'}`;

  const asunto = `Boleta de Pago Procesada - Período ${periodoCodigo}`;
  const cuerpo = 
`Estimado/a ${nombreComp},

Le notificamos que la nómina correspondiente al período ${periodoCodigo} ha sido procesada exitosamente.

Monto Líquido: $${parseFloat(liquido).toFixed(2)}

Su recibo de pago ya se encuentra disponible para su revisión.

Atentamente,
Recursos Humanos - ${empresaNombre}`;

  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.location.href = mailtoUrl;
};
