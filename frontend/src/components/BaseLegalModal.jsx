import React from 'react';
import { X, Scale, BookOpen } from 'lucide-react';

export default function BaseLegalModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '100%', maxWidth: '650px',
        maxHeight: '85vh', overflowY: 'auto', padding: '1.75rem', position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
          <Scale size={26} style={{ color: '#2563eb' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Base Legal y Fundamentos MTPS</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Código de Trabajo de la República de El Salvador</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: '#334155' }}>
          
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} /> Art. 51 Ordinal 1° - Descuento por Tardanzas
            </h4>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              El patrono tiene derecho a descontar del salario del trabajador la suma equivalente al tiempo <strong>estrictamente no trabajado</strong> por causa de tardanzas o ausencias injustificadas. Quedan prohibidas las sanciones económicas fijas o multas arbitrarias superiores al tiempo no laborado (Art. 128).
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} /> Art. 129 y 132 - Pérdida del 7° Día (Descanso Semanal)
            </h4>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Todo trabajador tiene derecho a 1 día de descanso semanal remunerado. Sin embargo, el <strong>Art. 132</strong> establece que si un trabajador falta sin justa causa un día completo <em>o si acumula faltas/tardanzas parciales en la misma semana que equivalgan a una jornada completa (8 horas)</em>, <strong>perderá el pago correspondiente a su Séptimo Día</strong>.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} /> Art. 161, 168 y 169 - Horas Extras Diurnas y Nocturnas
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5 }}>
              <li><strong>Jornada Diurna (06:00 AM - 07:00 PM):</strong> La hora extraordinaria se paga con un <strong>100% de recargo</strong> (Factor 2.0x salario hora).</li>
              <li><strong>Jornada Nocturna (07:00 PM - 06:00 AM):</strong> La hora extraordinaria se paga con un <strong>125% de recargo</strong> (Factor 2.25x salario hora).</li>
            </ul>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #d97706' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} /> Art. 192 - Días de Asueto / Festivos Laborados
            </h4>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Los trabajadores que de común acuerdo laboren en un día de asueto o fiesta nacional tendrán derecho a un recargo del <strong>100% adicional sobre el salario de la jornada ordinaria</strong> (cobro doble del día).
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'right', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
