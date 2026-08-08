import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, DollarSign, AlertCircle, CheckCircle, Calculator } from 'lucide-react';

export default function FinanzasModal({ empleado, onClose }) {
  const [activeTab, setActiveTab] = useState('descuentos'); // 'novedades' o 'descuentos'
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [tipoPrestamo, setTipoPrestamo] = useState('Interno');
  const [montoTotal, setMontoTotal] = useState('');
  const [cuotaPeriodica, setCuotaPeriodica] = useState('');

  // Salario info
  const contratoActivo = empleado.contratos?.find(c => c.es_activo);
  const salarioNominal = contratoActivo ? parseFloat(contratoActivo.salario_base) : 0;
  const limiteLegal = salarioNominal * 0.20;

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const data = await api.getPrestamosEmpleado(empleado.id);
      setPrestamos(data);
    } catch (err) {
      setError("No se pudieron cargar los préstamos actuales.");
    } finally {
      setLoading(false);
    }
  };

  const cuotaActualTotal = prestamos.reduce((sum, p) => sum + parseFloat(p.cuota_periodica), 0);
  const nuevaCuota = parseFloat(cuotaPeriodica) || 0;
  const sumaProyectada = cuotaActualTotal + nuevaCuota;
  const excedeLimite = tipoPrestamo !== 'Embargo Judicial' && sumaProyectada > limiteLegal;

  const handleSubmitDescuento = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (excedeLimite) {
      setError(`La cuota excede el límite legal del 20% ($${limiteLegal.toFixed(2)}).`);
      return;
    }

    try {
      setSubmitting(true);
      await api.crearPrestamoEmpleado({
        empleado_id: empleado.id,
        tipo_prestamo: tipoPrestamo,
        monto_total: parseFloat(montoTotal),
        saldo_pendiente: parseFloat(montoTotal),
        cuota_periodica: parseFloat(cuotaPeriodica),
        estado: "Activo"
      });
      setSuccess("Descuento programado correctamente.");
      setMontoTotal('');
      setCuotaPeriodica('');
      fetchPrestamos(); // Recargar tabla
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={24} className="text-blue-600" />
          Finanzas de Empleado
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          {empleado.primer_nombre} {empleado.primer_apellido} - Salario Base: ${salarioNominal.toFixed(2)}
        </p>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <button 
            style={{ 
              padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'descuentos' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'descuentos' ? '#2563eb' : 'var(--text-muted)',
              fontWeight: activeTab === 'descuentos' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('descuentos')}
          >
            Préstamos y Descuentos Fijos
          </button>
          <button 
            style={{ 
              padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'novedades' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'novedades' ? '#2563eb' : 'var(--text-muted)',
              fontWeight: activeTab === 'novedades' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('novedades')}
          >
            Novedades Ocasionales
          </button>
        </div>

        {activeTab === 'descuentos' && (
          <div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <Calculator className="text-blue-600" size={24} />
              <div style={{ flex: 1, fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Límite Legal 20% (Art. 136):</span>
                  <strong>${limiteLegal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#dc2626' }}>
                  <span>Cuotas Activas:</span>
                  <strong>-${cuotaActualTotal.toFixed(2)}</strong>
                </div>
                <div style={{ borderTop: '1px solid #cbd5e1', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Disponible para cuotas:</span>
                  <span style={{ color: (limiteLegal - cuotaActualTotal) < 0 ? '#dc2626' : '#16a34a' }}>
                    ${(limiteLegal - cuotaActualTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {error && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}
            {success && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontSize: '0.875rem' }}>{success}</div>}

            <form onSubmit={handleSubmitDescuento} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo de Descuento</label>
                  <select className="form-control" value={tipoPrestamo} onChange={e => setTipoPrestamo(e.target.value)}>
                    <option value="Interno">Préstamo Interno</option>
                    <option value="Bancario">Préstamo Bancario</option>
                    <option value="Anticipo">Anticipo Salarial</option>
                    <option value="Embargo Judicial">Embargo Judicial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monto Total ($)</label>
                  <input type="number" step="0.01" min="0.01" className="form-control" required value={montoTotal} onChange={e => setMontoTotal(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Cuota por Planilla ($)</label>
                <input 
                  type="number" step="0.01" min="0.01" 
                  className="form-control" required 
                  value={cuotaPeriodica} onChange={e => setCuotaPeriodica(e.target.value)} 
                  style={{ borderColor: excedeLimite ? '#dc2626' : '' }}
                />
                {excedeLimite && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <AlertCircle size={14} /> La cuota excede el 20% legal (Excepto Embargos).
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-outline">Cerrar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || excedeLimite || !salarioNominal}>
                  {submitting ? 'Guardando...' : 'Programar Descuento'}
                </button>
              </div>
            </form>

            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Descuentos Activos</h4>
            {loading ? <p>Cargando...</p> : (
              prestamos.length === 0 ? <p className="text-muted" style={{ fontSize: '0.875rem' }}>No hay descuentos programados.</p> :
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Tipo</th>
                    <th style={{ padding: '0.5rem' }}>Monto Total</th>
                    <th style={{ padding: '0.5rem' }}>Saldo Pendiente</th>
                    <th style={{ padding: '0.5rem' }}>Cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem' }}>{p.tipo_prestamo}</td>
                      <td style={{ padding: '0.5rem' }}>${p.monto_total}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>${p.saldo_pendiente}</td>
                      <td style={{ padding: '0.5rem', color: '#dc2626' }}>-${p.cuota_periodica}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'novedades' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Módulo de Horas Extras e Inasistencias en construcción.</p>
            <p style={{ fontSize: '0.875rem' }}>Estará disponible en el siguiente parche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
