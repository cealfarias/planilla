import React, { useState } from 'react';
import { api } from '../services/api';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Planillas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    codigo_periodo: `MENSUAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    tipo_planilla: 'Mensual',
    fecha_inicio: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    fecha_fin: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-30`,
  });
  const [successData, setSuccessData] = useState(null);
  const [planillas, setPlanillas] = useState([]);
  const [loadingPlanillas, setLoadingPlanillas] = useState(true);

  useEffect(() => {
    fetchPlanillas();
  }, []);

  const fetchPlanillas = async () => {
    try {
      setLoadingPlanillas(true);
      const data = await api.getPlanillas();
      setPlanillas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlanillas(false);
    }
  };

  const handleCerrarPlanilla = async (periodoId) => {
    if (!window.confirm("¿Estás seguro de cerrar esta planilla? Una vez cerrada, no se podrán realizar más deducciones ni modificaciones.")) return;
    try {
      await api.cerrarPlanilla(periodoId);
      fetchPlanillas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);
    
    try {
      const result = await api.procesarPlanilla(formData);
      setSuccessData(result);
      fetchPlanillas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Motor de Planillas</h2>
        <p className="text-muted">Procesa la nómina de todos los colaboradores activos y genera boletas de pago.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} className="text-blue-600" />
            Nuevo Período de Pago
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Código de Período *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej. MENSUAL-2026-08" 
                required
                value={formData.codigo_periodo}
                onChange={e => setFormData({...formData, codigo_periodo: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Tipo de Planilla *</label>
              <select 
                className="form-control"
                value={formData.tipo_planilla}
                onChange={e => setFormData({...formData, tipo_planilla: e.target.value})}
              >
                <option value="Ordinaria Mensual">Ordinaria Mensual</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Aguinaldo">Aguinaldo</option>
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Fecha Inicio *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required
                  value={formData.fecha_inicio}
                  onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required
                  value={formData.fecha_fin}
                  onChange={e => setFormData({...formData, fecha_fin: e.target.value})}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Procesando Planilla...' : 'Generar Planilla'}
            </button>
          </form>
        </div>

        <div>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem', borderRadius: '8px', color: '#dc2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                <AlertTriangle size={20} />
                Error al Procesar
              </div>
              <p>{error}</p>
            </div>
          )}

          {successData && (
            <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#16a34a', fontWeight: 'bold' }}>
                <CheckCircle size={24} />
                ¡Planilla Procesada Exitosamente!
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Boletas Generadas</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{successData.estadisticas.boletas_generadas}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Total Líquido a Pagar</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                    ${successData.estadisticas.total_liquido_pagar.toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'white', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Empleado</th>
                      <th style={{ padding: '0.5rem' }}>Nominal</th>
                      <th style={{ padding: '0.5rem' }}>Renta</th>
                      <th style={{ padding: '0.5rem' }}>ISSS</th>
                      <th style={{ padding: '0.5rem' }}>AFP</th>
                      <th style={{ padding: '0.5rem' }}>Préstamos</th>
                      <th style={{ padding: '0.5rem' }}>Total Desc.</th>
                      <th style={{ padding: '0.5rem' }}>Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successData.desglose.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: '500' }}>{item.nombre_completo}</td>
                        <td style={{ padding: '0.5rem' }}>${item.salario_base.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', color: '#dc2626' }}>${item.renta.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', color: '#dc2626' }}>${item.isss.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', color: '#dc2626' }}>${item.afp.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', color: '#dc2626' }}>${item.prestamos?.toFixed(2) || '0.00'}</td>
                        <td style={{ padding: '0.5rem', color: '#dc2626' }}>${item.total_descuentos.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#16a34a' }}>${item.liquido_recibir.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!successData && !error && (
             <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--text-muted)' }}>
               <CreditCard size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p>El resumen del procesamiento aparecerá aquí.</p>
             </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} className="text-blue-600" />
          Historial de Planillas
        </h3>

        {loadingPlanillas ? (
          <p>Cargando historial...</p>
        ) : planillas.length === 0 ? (
          <p className="text-muted">Aún no se ha generado ninguna planilla en el sistema.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Código Período</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Tipo</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Fechas</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Estado</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planillas.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{p.codigo_periodo}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{p.tipo_planilla}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{p.fecha_inicio} al {p.fecha_fin}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: p.estado === 'Abierta' ? '#DBEAFE' : '#F1F5F9',
                        color: p.estado === 'Abierta' ? '#1D4ED8' : '#475569'
                      }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      {p.estado === 'Abierta' ? (
                        <button 
                          className="btn btn-outline" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => handleCerrarPlanilla(p.id)}
                        >
                          Cerrar Planilla
                        </button>
                      ) : (
                        <button className="btn btn-outline" disabled style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', opacity: 0.5 }}>
                          Cerrada
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
