import React from 'react';

export default function TerminosModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Términos de Referencia y Condiciones de Servicio</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>
        
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
          <p><strong>Última actualización:</strong> 09 de Agosto de 2026</p>
          <p>Bienvenido a <strong>Administración Planilla de Sueldos SaaS</strong> (en adelante, "la Plataforma"). Al registrar su empresa y utilizar nuestros servicios, usted acepta estar sujeto a los siguientes Términos de Referencia y Condiciones de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder a la Plataforma.</p>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>1. Naturaleza del Servicio</h3>
          <p>La Plataforma es un software alojado en la nube (SaaS - Software as a Service) diseñado para proveer a las empresas herramientas automatizadas de gestión de recursos humanos, cálculo de planillas, gestión de descuentos (préstamos, embargos), y emisión de boletas de pago. La Plataforma actúa exclusivamente como una herramienta informática para facilitar sus procesos administrativos.</p>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>2. Cumplimiento Legal (El Salvador)</h3>
          <p>La Plataforma ha sido desarrollada en estricto cumplimiento con la legislación laboral de la República de El Salvador, incluyendo pero no limitado a:</p>
          <ul>
            <li><strong>Código de Trabajo de El Salvador:</strong> Art. 136 (Restricciones y topes legales para descuentos y embargos salariales) y Art. 138-143 (Disposiciones sobre el pago del salario y emisión de comprobantes o boletas de pago).</li>
            <li><strong>Leyes de Seguridad Social:</strong> Cumplimiento con las normativas para retenciones de ISSS y AFP vigentes, de acuerdo a lo establecido por el Instituto Salvadoreño del Seguro Social y la Superintendencia del Sistema Financiero.</li>
            <li><strong>Ministerio de Trabajo y Previsión Social (MTPS):</strong> Los reportes y formatos generados por la plataforma están alineados con los requerimientos de inspección del MTPS para facilitar la auditoría patronal.</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>3. Licenciamiento y Modelos de Uso</h3>
          <p>La Plataforma se ofrece bajo diferentes modalidades de licencia, las cuales pueden variar según el plan elegido:</p>
          <ul>
            <li><strong>Versión Gratuita (Freeware con Publicidad):</strong> El uso de la plataforma puede ser gratuito sujeto a la visualización de anuncios publicitarios de terceros, tiempos de espera programados (cool-downs) para ciertas acciones, y límites en la cantidad de empleados.</li>
            <li><strong>Período de Prueba (Trial):</strong> Podrá disponer de un período de prueba gratuito de 14 días con todas las funciones Premium habilitadas. Transcurrido este tiempo, deberá adquirir una suscripción o su cuenta pasará a la versión gratuita con restricciones.</li>
            <li><strong>Versiones Premium:</strong> Libres de publicidad, sin tiempos de espera, y con características adicionales descritas en la página de precios.</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>4. Responsabilidad de la Información (Integridad de Datos)</h3>
          <ul>
            <li><strong>Exactitud de los Datos:</strong> El usuario administrador de la empresa es el único responsable de la veracidad, exactitud y actualización de los datos ingresados en el sistema (nombres, salarios, NIT, descuentos, etc.).</li>
            <li><strong>Cálculos Legales:</strong> Aunque la Plataforma automatiza el cálculo de retenciones y topes legales, es responsabilidad de la empresa verificar y aprobar las planillas antes de su ejecución y pago. La Plataforma no sustituye el criterio contable ni legal de su empresa.</li>
            <li><strong>Uso de Firmas y Documentos:</strong> Los documentos generados por la Plataforma (ej. finiquitos, boletas de pago) se proporcionan como formatos de apoyo. Es responsabilidad de la empresa asegurar su validez legal mediante las firmas y sellos correspondientes.</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>5. Privacidad y Confidencialidad de los Datos</h3>
          <ul>
            <li><strong>Aislamiento de Datos (Multi-Tenant):</strong> Garantizamos que la información de su empresa está estrictamente aislada y es inaccesible para otras empresas que utilicen la Plataforma.</li>
            <li><strong>Propiedad de los Datos:</strong> Usted retiene todos los derechos y la propiedad intelectual sobre la información ingresada al sistema. La Plataforma únicamente actúa como custodio de sus datos.</li>
            <li><strong>Uso de Datos Personales:</strong> La Plataforma no venderá, alquilará ni distribuirá los datos de sus empleados a terceros bajo ninguna circunstancia.</li>
            <li><strong>Uso de Cookies y Tecnologías de Seguimiento:</strong> La Plataforma utiliza cookies propias y de terceros necesarias para mantener la sesión activa, recordar sus preferencias y recopilar datos estadísticos. Al utilizar nuestros servicios, usted otorga su consentimiento para el almacenamiento y uso de estas cookies.</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>6. Propiedad Intelectual y Restricciones de Uso</h3>
          <ul>
            <li><strong>Derechos Reservados:</strong> Nos reservamos todos los derechos de propiedad intelectual, derechos de autor y patentes sobre el código fuente, la arquitectura, los algoritmos, el diseño visual y las bases de datos de la Plataforma.</li>
            <li><strong>Prohibición de Copias e Ingeniería Inversa:</strong> Queda estrictamente prohibido descompilar, realizar ingeniería inversa (reverse engineering), desensamblar, modificar o intentar derivar el código fuente de la Plataforma. Asimismo, está prohibida la creación de trabajos derivados o copias ilegales del software.</li>
            <li><strong>Prohibición de Extracción de Datos (Scraping):</strong> El uso de spiders, robots, crawlers, herramientas de minería de datos o cualquier otro medio automatizado (Web Scraping) para extraer, copiar o monitorear datos de la Plataforma está terminantemente prohibido.</li>
            <li><strong>Seguridad y Phishing:</strong> Queda prohibido utilizar la Plataforma para suplantar identidad, realizar actos de Phishing, distribuir malware, intentar vulnerar las medidas de seguridad del sistema (hacking) o realizar cualquier actividad ilícita cibernética. Cualquier intento de vulneración resultará en la terminación inmediata del servicio y las acciones legales correspondientes.</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem', color: '#0f172a' }}>7. Disponibilidad del Servicio y Soporte</h3>
          <p>Nos esforzamos por mantener una disponibilidad del servicio del 99.9%. Sin embargo, la Plataforma puede estar sujeta a interrupciones temporales por mantenimiento programado, las cuales serán notificadas con anticipación. Se realizan copias de seguridad de la base de datos de forma periódica.</p>
        </div>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 2rem' }}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
