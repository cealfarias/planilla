import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProgramacionVacacionesModal from '../components/ProgramacionVacacionesModal';
import HistorialPlanillasModal from '../components/HistorialPlanillasModal';
import FinanzasModal from '../components/FinanzasModal';
import PartidaContableModal from '../components/PartidaContableModal';
import ToastContainer from '../components/ToastContainer';
import { notificarBoletaWhatsApp, notificarBoletaEmail } from '../utils/notificaciones';
import { CreditCard, CheckCircle, AlertTriangle, Calculator, FileText, Download, Calendar, Send, Mail, History, RefreshCw, DollarSign, BookOpen } from 'lucide-react';

export default function Planillas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVacacionesModal, setShowVacacionesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPartidaModal, setShowPartidaModal] = useState(false);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState(null);
  const [selectedPeriodoCodigo, setSelectedPeriodoCodigo] = useState('');
  const [selectedEmpleadoFinanzas, setSelectedEmpleadoFinanzas] = useState(null);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [formData, setFormData] = useState({
    codigo_periodo: `MENSUAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    tipo_planilla: 'Mensual',
    fecha_inicio: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    fecha_fin: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-30`,
  });

  const [successData, setSuccessData] = useState(null);
  const [planillas, setPlanillas] = useState([]);
  const [loadingPlanillas, setLoadingPlanillas] = useState(true);
  const [activePlanillaInfo, setActivePlanillaInfo] = useState(null);

  useEffect(() => {
    fetchPlanillas();
  }, []);

  const fetchPlanillas = async () => {
    try {
      setLoadingPlanillas(true);
      const data = await api.getPlanillas();
      setPlanillas(data);

      // Si existe una planilla ABIERTA (estado 'Abierta'), la aperturamos/cargamos automáticamente
      if (data && data.length > 0) {
        const planillaAbierta = data.find(p => p.estado === 'Abierta');
        if (planillaAbierta) {
          cargarPlanillaSilenciosa(planillaAbierta);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlanillas(false);
    }
  };

  const cargarPlanillaSilenciosa = async (p) => {
    const datosPlanilla = {
      codigo_periodo: p.codigo_periodo,
      tipo_planilla: p.tipo_planilla,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
    };

    setFormData(datosPlanilla);
    setActivePlanillaInfo(p);

    try {
      setLoading(true);
      const result = await api.procesarPlanilla(datosPlanilla);
      setSuccessData(result);
    } catch (err) {
      console.error("Error al aperturar automática planilla abierta:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    let prefix = 'MENSUAL';
    let fInicio = `${year}-${month}-01`;
    let fFin = `${year}-${month}-30`;

    if (tipo === 'Quincenal') {
      prefix = 'Q1';
      fFin = `${year}-${month}-15`;
    } else if (tipo === 'Aguinaldo') {
      prefix = 'AGUINALDO';
      fInicio = `${year}-12-01`;
      fFin = `${year}-12-20`;
    } else if (tipo === 'Vacaciones') {
      prefix = 'VAC';
      const fIn = new Date();
      const fOut = new Date();
      fOut.setDate(fIn.getDate() + 15);
      fInicio = fIn.toISOString().split('T')[0];
      fFin = fOut.toISOString().split('T')[0];
    }

    setFormData({
      codigo_periodo: `${prefix}-${year}-${month}`,
      tipo_planilla: tipo,
      fecha_inicio: fInicio,
      fecha_fin: fFin,
    });
  };

  const handleCerrarPlanilla = async (periodoId) => {
    if (!window.confirm("¿Estás seguro de cerrar esta planilla? Una vez cerrada, no se podrán realizar más deducciones ni modificaciones.")) return;
    try {
      await api.cerrarPlanilla(periodoId);
      addToast("🔒 La planilla ha sido CERRADA definitivamente.", "info");
      fetchPlanillas();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleEliminarPlanilla = async (periodoId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta planilla abierta? Podrás volver a generarla desde cero.")) return;
    try {
      await api.eliminarPlanilla(periodoId);
      addToast("🗑️ Planilla eliminada exitosamente.", "info");
      if (successData && successData.periodo?.id === periodoId) {
        setSuccessData(null);
        setActivePlanillaInfo(null);
      }
      fetchPlanillas();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleSelectPlanillaDeHistorial = async (p) => {
    const datosPlanilla = {
      codigo_periodo: p.codigo_periodo,
      tipo_planilla: p.tipo_planilla,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
    };

    setFormData(datosPlanilla);
    setActivePlanillaInfo(p);
    addToast(`✏️ Planilla "${p.codigo_periodo}" cargada para edición / recálculo.`, "info");

    try {
      setLoading(true);
      setError(null);
      const result = await api.procesarPlanilla(datosPlanilla);
      setSuccessData(result);
      addToast(`✨ Planilla "${p.codigo_periodo}" actualizada en pantalla.`, "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirFinanzasEmpleado = (item) => {
    const nombres = item.nombre_completo.split(' ');
    const pNombre = nombres[0] || '';
    const pApellido = nombres.slice(1).join(' ') || '';

    setSelectedEmpleadoFinanzas({
      id: item.empleado_id,
      primer_nombre: pNombre,
      primer_apellido: pApellido,
      salario_base: item.salario_base
    });
  };

  const handleCerrarFinanzasModal = async () => {
    setSelectedEmpleadoFinanzas(null);
    // Recalcular silenciosamente para reflejar nuevas horas extras o préstamos al instante
    try {
      setLoading(true);
      const result = await api.procesarPlanilla(formData);
      setSuccessData(result);
      addToast("✨ Nómina recalculada automáticamente con las nuevas novedades de finanzas.", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const planillaExistente = planillas.find(p => p.codigo_periodo.trim().toUpperCase() === formData.codigo_periodo.trim().toUpperCase());

    if (planillaExistente) {
      if (planillaExistente.estado === 'Cerrada') {
        addToast(`🔒 La planilla "${formData.codigo_periodo}" ya está CERRADA y no puede ser modificada.`, "error");
        return;
      }

      const confirmar = window.confirm(
        `⚠️ ¡ADVERTENCIA DE SOBREESCRITURA DE NÓMINA!\n\nLa planilla "${formData.codigo_periodo}" ya existe y está ABIERTA.\n\nSi continúas, se recalcularán los salarios, retenciones de ley y préstamos desde cero.\n\n¿Deseas sobreescribir y recalcular la planilla "${formData.codigo_periodo}"?`
      );
      if (!confirmar) return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);
    
    try {
      const result = await api.procesarPlanilla(formData);
      setSuccessData(result);
      setActivePlanillaInfo({
        codigo_periodo: formData.codigo_periodo,
        tipo_planilla: formData.tipo_planilla
      });
      addToast(`✨ ¡Planilla "${formData.codigo_periodo}" procesada exitosamente!`, "success");
      fetchPlanillas();
    } catch (err) {
      if (err.message && err.message.includes('fetch')) {
        const errorMsg = "El servidor en la nube se está reactivando. Por favor, reintenta en 5 segundos.";
        setError(errorMsg);
        addToast(errorMsg, "error");
      } else {
        setError(err.message);
        addToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (periodoId, type, empleadoId = null, nombreEmpleado = '') => {
    try {
      const msg = empleadoId ? `📄 Generando boleta individual de ${nombreEmpleado}...` : "📄 Generando archivo PDF...";
      addToast(msg, "info");
      const blob = await api.downloadPDF(periodoId, type, empleadoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = nombreEmpleado ? nombreEmpleado.trim().replace(/\s+/g, '_') : '';
      a.download = empleadoId ? `Boleta_${cleanName}_${periodoId}.pdf` : `${type}_${periodoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast("📥 Descarga de PDF completada.", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification Floating Banner Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* HEADER COMPACT FORM CARD (1-2 ROWS MAX) */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={22} className="text-blue-600" />
              Motor de Planillas
              {activePlanillaInfo && (
                <span style={{ fontSize: '0.85rem', background: '#DBEAFE', color: '#1D4ED8', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '600' }}>
                  Visualizando: {activePlanillaInfo.codigo_periodo}
                </span>
              )}
            </h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Procesa la nómina de todos los colaboradores activos y genera boletas de pago.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => setShowHistoryModal(true)} 
              className="btn btn-outline" 
              style={{ borderColor: '#1e3a8a', color: '#1e3a8a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <History size={16} /> 📜 Historial de Planillas ({planillas.length})
            </button>

            <button 
              type="button" 
              onClick={() => setShowVacacionesModal(true)} 
              className="btn btn-outline" 
              style={{ borderColor: '#2563eb', color: '#2563eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <Calendar size={16} /> 📅 Programar Vacaciones (Art. 182)
            </button>
          </div>
        </div>

        {/* COMPACT FORM (1 FLEX ROW) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
              Código Período *
            </label>
            <input 
              type="text" 
              value={formData.codigo_periodo} 
              onChange={e => setFormData({ ...formData, codigo_periodo: e.target.value })} 
              required 
              className="form-input" 
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
              Tipo de Planilla *
            </label>
            <select 
              value={formData.tipo_planilla} 
              onChange={handleTipoChange} 
              className="form-input" 
              style={{ width: '100%' }}
            >
              <option value="Mensual">Ordinaria Mensual</option>
              <option value="Quincenal">Quincenal</option>
              <option value="Aguinaldo">Aguinaldo</option>
              <option value="Vacaciones">Vacaciones</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
              Fecha Inicio *
            </label>
            <input 
              type="date" 
              value={formData.fecha_inicio} 
              onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} 
              required 
              className="form-input" 
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
              Fecha Fin *
            </label>
            <input 
              type="date" 
              value={formData.fecha_fin} 
              onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })} 
              required 
              className="form-input" 
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary" 
              style={{ padding: '0.65rem 1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
              {loading ? 'Procesando...' : '⚡ Generar / Recalcular Planilla'}
            </button>
          </div>
        </form>
      </div>

      {/* ERROR BANNER IF ANY */}
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '1rem 1.25rem', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Error al Procesar
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {/* MODALS */}
      <ProgramacionVacacionesModal 
        isOpen={showVacacionesModal} 
        onClose={() => setShowVacacionesModal(false)} 
      />

      <HistorialPlanillasModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        planillas={planillas}
        onSelectPlanilla={handleSelectPlanillaDeHistorial}
        onCerrarPlanilla={handleCerrarPlanilla}
        onEliminarPlanilla={handleEliminarPlanilla}
        onDownloadPDF={handleDownloadPDF}
      />

      {selectedEmpleadoFinanzas && (
        <FinanzasModal 
          empleado={selectedEmpleadoFinanzas}
          onClose={handleCerrarFinanzasModal}
        />
      )}

      {/* MAIN VIEW: TABLA DE PLANILLA PROCESADA / DETALLES DE BOLETAS */}
      {successData ? (
        <div className="card" style={{ padding: '1.5rem', border: '2px solid #86EFAC', background: '#F0FDF4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={28} style={{ color: '#16A34A' }} />
              <div>
                <h3 style={{ margin: 0, color: '#15803D', fontSize: '1.2rem' }}>
                  ¡Planilla Procesada Exitosamente! ({formData.codigo_periodo})
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#166534' }}>
                  Período del {formData.fecha_inicio} al {formData.fecha_fin}
                </span>
              </div>
            </div>

            {(() => {
              const currentPeriodoId = successData.periodo?.id || activePlanillaInfo?.id || (planillas.find(p => p.codigo_periodo === formData.codigo_periodo)?.id);

              return (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#166534', fontWeight: 'bold' }}>Boletas Generadas</span>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#15803D' }}>
                        {successData.estadisticas?.boletas_generadas || successData.desglose?.length || 0}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#166534', fontWeight: 'bold' }}>Total Líquido a Pagar</span>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#15803D' }}>
                        ${(successData.estadisticas?.total_liquido_pagar || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {currentPeriodoId && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(currentPeriodoId, 'boletas')}
                        className="btn"
                        style={{ backgroundColor: '#15803D', color: 'white', border: 'none', padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', borderRadius: '6px', cursor: 'pointer' }}
                        title="Descargar PDF con todas las boletas de pago de esta nómina"
                      >
                        <FileText size={15} /> Descargar Boletas PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(currentPeriodoId, 'reporte')}
                        className="btn btn-outline"
                        style={{ borderColor: '#15803D', color: '#15803D', padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', borderRadius: '6px', cursor: 'pointer' }}
                        title="Descargar PDF del Reporte General Consolidado"
                      >
                        <Download size={15} /> Reporte General PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPeriodoId(currentPeriodoId);
                          setSelectedPeriodoCodigo(activePlanillaInfo?.codigo_periodo || formData.codigo_periodo);
                          setShowPartidaModal(true);
                        }}
                        className="btn"
                        style={{ backgroundColor: '#0F172A', color: 'white', border: 'none', padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)' }}
                        title="Generar Asiento / Partida Contable por Doble Entrada"
                      >
                        <BookOpen size={15} /> 📊 Partida Contable
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* TABLA DE BOLETAS GENERADAS */}
          {(() => {
            const isVacaciones = formData.tipo_planilla === 'Vacaciones' || (activePlanillaInfo && (activePlanillaInfo.tipo_planilla === 'Vacaciones' || activePlanillaInfo.tipo_planilla === 'VACACIONES'));
            const isAguinaldo = formData.tipo_planilla === 'Aguinaldo' || (activePlanillaInfo && (activePlanillaInfo.tipo_planilla === 'Aguinaldo' || activePlanillaInfo.tipo_planilla === 'AGUINALDO'));
            const currentPeriodoId = successData.periodo?.id || activePlanillaInfo?.id || (planillas.find(p => p.codigo_periodo === formData.codigo_periodo)?.id);

            return (
              <>
                {isVacaciones && (
                  <div style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1E40AF',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.45'
                  }}>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      <FileText size={16} /> Base Legal Aplicada - Planilla de Vacaciones (Código de Trabajo de El Salvador):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      <li><strong>Art. 177 C.T.:</strong> Todo trabajador tiene derecho a 15 días de vacación remunerada anual con un <strong>30% de recargo ordinario legal</strong> ($Salario\, 15\, días \times 30\%$).</li>
                      <li><strong>Art. 178 y 187 C.T.:</strong> La remuneración cubre el descanso continuo. Al coexistir con la planilla ordinaria quincenal/mensual, el recargo del 30% se otorga como prima íntegra de ley sin deducción duplicada de ISSS y AFP.</li>
                    </ul>
                  </div>
                )}

                {isAguinaldo && (
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    color: '#92400E',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.45'
                  }}>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      <FileText size={16} /> Base Legal Aplicada - Planilla de Aguinaldo (Código de Trabajo & Ley de Impuesto sobre la Renta):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      <li><strong>Art. 196 y 197 C.T.:</strong> Prima de gratificación anual por antigüedad: <strong>15 días</strong> (1 a &lt;3 años), <strong>19 días</strong> (3 a &lt;10 años) o <strong>21 días</strong> (10+ años de servicio). Proporcional si &lt;1 año (Art. 198 C.T.).</li>
                      <li><strong>Art. 200 C.T.:</strong> Período legal de pago obligatorio entre el <strong>12 y el 20 de diciembre</strong> de cada año.</li>
                      <li><strong>Art. 202 C.T. y Decreto ISR:</strong> Exento al 100% de cotizaciones <strong>ISSS y AFP</strong>. Exento del Impuesto sobre la Renta (ISR) hasta <strong>2 Salarios Mínimos ($730.00)</strong>.</li>
                    </ul>
                  </div>
                )}

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #BBF7D0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#DCFCE7', borderBottom: '1px solid #BBF7D0', textAlign: 'left', color: '#14532D' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Empleado</th>
                      {isVacaciones ? (
                        <>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Salario Nominal Mensual</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Salario 15 Días (Vacación)</th>
                          <th style={{ padding: '0.75rem 0.5rem', color: '#15803D', fontWeight: 'bold' }}>Prima Vacación (30%)</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Total Desc.</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Líquido a Pagar</th>
                        </>
                      ) : isAguinaldo ? (
                        <>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Salario Nominal Mensual</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Antigüedad Laboral</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Días Aguinaldo</th>
                          <th style={{ padding: '0.75rem 0.5rem', color: '#B45309', fontWeight: 'bold' }}>Monto Aguinaldo</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Renta (Exceso &gt; $730)</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Líquido a Pagar</th>
                        </>
                      ) : (
                        <>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Nominal</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Renta</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>ISSS</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>AFP</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Préstamos</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Total Desc.</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Líquido</th>
                        </>
                      )}
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Acciones & Notificaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successData.desglose?.map((item, idx) => {
                      const salarioMensual = item.salario_mensual || item.salario_base;
                      const salario15dias = item.salario_quincena || (salarioMensual / 2);
                      const prima30 = item.prima_vacaciones || item.salario_base;

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F0FDF4' }}>
                          <td style={{ padding: '0.65rem 0.5rem', fontWeight: 'bold', color: '#1e293b' }}>{item.nombre_completo}</td>
                          
                          {isVacaciones ? (
                            <>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#475569' }}>${salarioMensual.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#475569' }}>${salario15dias.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 'bold', color: '#15803D' }}>${prima30.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#64748b' }}>$0.00</td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 'bold', color: '#16a34a' }}>${prima30.toFixed(2)}</td>
                            </>
                          ) : isAguinaldo ? (
                            <>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#475569' }}>${salarioMensual.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#475569' }}>{item.antiguedad_texto || '1.0 años'}</td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: '500' }}>{item.dias_aguinaldo || 15} días</td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 'bold', color: '#B45309' }}>${item.salario_base.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: item.renta > 0 ? '#dc2626' : '#64748b' }}>${item.renta.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 'bold', color: '#16a34a' }}>${item.liquido_recibir.toFixed(2)}</td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding: '0.65rem 0.5rem' }}>${item.salario_base.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#dc2626' }}>${item.renta.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#dc2626' }}>${item.isss.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#dc2626' }}>${item.afp.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#dc2626' }}>${item.prestamos.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', color: '#dc2626', fontWeight: '500' }}>${item.total_descuentos.toFixed(2)}</td>
                              <td style={{ padding: '0.65rem 0.5rem', fontWeight: 'bold', color: '#16a34a' }}>${item.liquido_recibir.toFixed(2)}</td>
                            </>
                          )}
                          
                          <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {currentPeriodoId && (
                                <button 
                                  type="button" 
                                  onClick={() => handleDownloadPDF(currentPeriodoId, 'boletas', item.empleado_id, item.nombre_completo)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#15803D', borderColor: '#86EFAC', backgroundColor: '#F0FDF4', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}
                                  title={`Descargar la Boleta de Pago en PDF de ${item.nombre_completo}`}
                                >
                                  <FileText size={13} /> Boleta PDF
                                </button>
                              )}
                              <button 
                                type="button" 
                                onClick={() => handleAbrirFinanzasEmpleado(item)}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#0284c7', borderColor: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}
                                title="Registrar Horas Extras, Tardanzas o Préstamos para este colaborador"
                              >
                                <DollarSign size={13} /> Finanzas
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  notificarBoletaWhatsApp(item, formData.codigo_periodo, item.liquido_recibir);
                                  addToast(`📱 WhatsApp abierto para ${item.nombre_completo}`, "info");
                                }}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#25d366', borderColor: '#25d366', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                title="Enviar Boleta por WhatsApp"
                              >
                                <Send size={12} /> WhatsApp
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  notificarBoletaEmail(item, formData.codigo_periodo, item.liquido_recibir);
                                  addToast(`✉️ Correo configurado para ${item.nombre_completo}`, "info");
                                }}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                title="Enviar Boleta por Correo"
                              >
                                <Mail size={12} /> Correo
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', color: 'var(--text-muted)', textAlign: 'center' }}>
          <CreditCard size={56} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Sin Planilla en Pantalla</h3>
          <p style={{ margin: 0, maxWidth: '480px', fontSize: '0.9rem' }}>
            Ingresa las fechas arriba y presiona <strong>⚡ Generar Planilla</strong> o abre el <strong>📜 Historial de Planillas</strong> para cargar una nómina existente.
          </p>
        </div>
      )}

      {/* Modal de Asiento / Partida Contable por Doble Entrada */}
      <PartidaContableModal
        isOpen={showPartidaModal}
        onClose={() => setShowPartidaModal(false)}
        periodoId={selectedPeriodoId}
        codigoPeriodo={selectedPeriodoCodigo}
      />
    </div>
  );
}
