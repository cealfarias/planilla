import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProgramacionVacacionesModal from '../components/ProgramacionVacacionesModal';
import { notificarBoletaWhatsApp, notificarBoletaEmail } from '../utils/notificaciones';
import { CreditCard, CheckCircle, AlertTriangle, Calculator, FileText, Download, Calendar, Send, Mail } from 'lucide-react';

export default function Planillas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showVacacionesModal, setShowVacacionesModal] = useState(false);

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

  const handleEliminarPlanilla = async (periodoId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta planilla abierta? Podrás volver a generarla desde cero.")) return;
    try {
      await api.eliminarPlanilla(periodoId);
      fetchPlanillas();
    } catch (err) {
      alert(err.message);
    }
  };

  const [editInfo, setEditInfo] = useState(null);

  const handleRecalcularPlanilla = (p) => {
    setFormData({
      codigo_periodo: p.codigo_periodo,
      tipo_planilla: p.tipo_planilla,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
    });
    setEditInfo(`Período ${p.codigo_periodo} (${p.tipo_planilla}) cargado en el formulario. Modifica si lo deseas y haz clic en 'Generar Planilla' para recalcular.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si la planilla ya existe registrada
    const planillaExistente = planillas.find(p => p.codigo_periodo.trim().toUpperCase() === formData.codigo_periodo.trim().toUpperCase());

    if (planillaExistente) {
      if (planillaExistente.estado === 'Cerrada') {
        alert(`🔒 La planilla con el código "${formData.codigo_periodo}" ya se encuentra CERRADA y no puede ser recalculada ni modificada.`);
        return;
      }

      const confirmar = window.confirm(
        `⚠️ ¡ADVERTENCIA DE SOBREESCRITURA DE NÓMINA!\n\nLa planilla con código "${formData.codigo_periodo}" ya fue generada previamente y está ABIERTA.\n\nSi continúas, los cálculos anteriores se eliminarán y se recalcularán salarios, retenciones de ley y amortizaciones desde cero. No hay manera de deshacer esta acción.\n\n¿Deseas sobreescribir y recalcular la planilla "${formData.codigo_periodo}"?`
      );
      if (!confirmar) return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);
    setEditInfo(null);
    
    try {
      const result = await api.procesarPlanilla(formData);
      setSuccessData(result);
      fetchPlanillas();
    } catch (err) {
      if (err.message && err.message.includes('fetch')) {
        setError("El servidor en la nube se está reactivando. Por favor, reintenta dar clic en 'Generar Planilla' en unos segundos.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (periodoId, type) => {
    try {
      const blob = await api.downloadPDF(periodoId, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${periodoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  const calcularPeriodoPorTipo = (tipo) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const lastDayOfMonth = new Date(year, today.getMonth() + 1, 0).getDate();

    if (tipo === 'Quincenal') {
      const day = today.getDate();
      if (day <= 15) {
        return {
          codigo_periodo: `Q1-${year}-${month}`,
          fecha_inicio: `${year}-${month}-01`,
          fecha_fin: `${year}-${month}-15`
        };
      } else {
        return {
          codigo_periodo: `Q2-${year}-${month}`,
          fecha_inicio: `${year}-${month}-16`,
          fecha_fin: `${year}-${month}-${String(lastDayOfMonth).padStart(2, '0')}`
        };
      }
    } else if (tipo === 'Aguinaldo') {
      return {
        codigo_periodo: `AGUINALDO-${year}`,
        fecha_inicio: `${year}-12-12`,
        fecha_fin: `${year}-12-20`
      };
    } else if (tipo === 'Vacaciones') {
      const fechaFinVac = new Date(today);
      fechaFinVac.setDate(today.getDate() + 15);
      const finMonth = String(fechaFinVac.getMonth() + 1).padStart(2, '0');
      const finDay = String(fechaFinVac.getDate()).padStart(2, '0');
      return {
        codigo_periodo: `VAC-${year}-${month}`,
        fecha_inicio: `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`,
        fecha_fin: `${fechaFinVac.getFullYear()}-${finMonth}-${finDay}`
      };
    } else {
      // Mensual
      return {
        codigo_periodo: `MENSUAL-${year}-${month}`,
        fecha_inicio: `${year}-${month}-01`,
        fecha_fin: `${year}-${month}-${String(lastDayOfMonth).padStart(2, '0')}`
      };
    }
  };

  const handleTipoPlanillaChange = (e) => {
    const nuevoTipo = e.target.value;
    const datosPeriodo = calcularPeriodoPorTipo(nuevoTipo);
    setFormData({
      ...formData,
      tipo_planilla: nuevoTipo,
      ...datosPeriodo
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>Motor de Planillas</h2>
          <p className="text-muted">Procesa la nómina de todos los colaboradores activos y genera boletas de pago.</p>
        </div>

        <button 
          type="button" 
          onClick={() => setShowVacacionesModal(true)} 
          className="btn btn-outline" 
          style={{ borderColor: '#2563eb', color: '#2563eb', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Calendar size={18} /> 📅 Programar Vacaciones del Año (Art. 182)
        </button>
      </div>

      <ProgramacionVacacionesModal 
        isOpen={showVacacionesModal} 
        onClose={() => setShowVacacionesModal(false)} 
      />

      {editInfo && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} />
          {editInfo}
        </div>
      )}

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
                onChange={handleTipoPlanillaChange}
              >
                <option value="Mensual">Ordinaria Mensual</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Aguinaldo">Aguinaldo</option>
                <option value="Vacaciones">Vacaciones</option>
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
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Notificar Recibo</th>
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
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                            <button 
                              type="button" 
                              onClick={() => notificarBoletaWhatsApp(item, formData.codigo_periodo, item.liquido_recibir)}
                              className="btn btn-outline"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: '#25d366', borderColor: '#25d366' }}
                              title="Notificar Recibo por WhatsApp"
                            >
                              <Send size={12} /> WhatsApp
                            </button>
                            <button 
                              type="button" 
                              onClick={() => notificarBoletaEmail(item, formData.codigo_periodo, item.liquido_recibir)}
                              className="btn btn-outline"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: '#2563eb', borderColor: '#2563eb' }}
                              title="Notificar Recibo por Correo"
                            >
                              <Mail size={12} /> Correo
                            </button>
                          </div>
                        </td>
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
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline"
                        title="Descargar Planilla General (PDF)"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#1e3a8a', borderColor: '#1e3a8a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => handleDownloadPDF(p.id, 'reporte')}
                      >
                        <FileText size={14} /> Planilla
                      </button>
                      
                      <button 
                        className="btn btn-outline"
                        title="Descargar Boletas de Pago (PDF)"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#4c1d95', borderColor: '#4c1d95', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => handleDownloadPDF(p.id, 'boletas')}
                      >
                        <Download size={14} /> Boletas
                      </button>

                      {p.estado === 'Abierta' ? (
                        <>
                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleRecalcularPlanilla(p)}
                            title="Cargar datos para Recalcular / Re-procesar"
                          >
                            🔄 Editar / Recalcular
                          </button>

                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleEliminarPlanilla(p.id)}
                            title="Eliminar este período de planilla"
                          >
                            🗑️ Eliminar
                          </button>

                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleCerrarPlanilla(p.id)}
                            title="Cerrar planilla definitivamente"
                          >
                            🔒 Cerrar
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-outline" disabled style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', opacity: 0.5 }}>
                          🔒 Cerrada
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
