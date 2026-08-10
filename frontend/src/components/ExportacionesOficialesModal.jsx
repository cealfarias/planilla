import React, { useState } from 'react';
import { 
  X, FileText, Download, Building, Landmark, Zap, ShieldCheck, 
  DollarSign, CheckCircle2, Lock, Sparkles, Send, FileSpreadsheet, Scale
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExportacionesOficialesModal({ isOpen, onClose, periodoId, codigoPeriodo, empleados = [] }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('isss_afp'); // 'isss_afp' | 'bancos' | 'f910' | 'finiquito'
  const [bancoSeleccionado, setBancoSeleccionado] = useState('BANCO_AGRICOLA');
  const [anioF910, setAnioF910] = useState(2026);
  const [loading, setLoading] = useState(false);

  // Formulario Liquidación
  const [liqData, setLiqData] = useState({
    empleado_id: empleados.length > 0 ? empleados[0].id : 1,
    motivo: 'Despido Injustificado',
    fecha_salida: new Date().toISOString().split('T')[0],
    salario_mensual: 600.00,
    anios_servicio: 2.5
  });

  const isOwner = user?.email?.toLowerCase() === 'cealfarias@gmail.com' ||
                  user?.username?.toLowerCase() === 'cealfarias' ||
                  user?.username?.toLowerCase() === 'cesararias' ||
                  user?.username?.toLowerCase() === 'propietario';

  const isPremium = isOwner || localStorage.getItem('licencia_tipo') === 'premium';

  if (!isOpen) return null;

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadISSS = async () => {
    try {
      setLoading(true);
      const blob = await api.downloadISSS(periodoId);
      downloadBlob(blob, `Planilla_ISSS_${codigoPeriodo || 'OIR'}.txt`);
    } catch (err) {
      alert("Error descargando archivo ISSS: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAFP = async () => {
    try {
      setLoading(true);
      const blob = await api.downloadAFP(periodoId);
      downloadBlob(blob, `Planilla_AFP_${codigoPeriodo || 'CONFIA_CRECER'}.csv`);
    } catch (err) {
      alert("Error descargando archivo AFP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBanco = async () => {
    try {
      setLoading(true);
      const blob = await api.downloadPagoMasivo(periodoId, bancoSeleccionado);
      const ext = bancoSeleccionado === 'BANCO_AGRICOLA' ? 'txt' : 'csv';
      downloadBlob(blob, `Pago_Masivo_${bancoSeleccionado}_${codigoPeriodo || 'BANCO'}.${ext}`);
    } catch (err) {
      alert("Error descargando archivo bancario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadF910 = async () => {
    try {
      setLoading(true);
      const blob = await api.downloadF910(anioF910);
      downloadBlob(blob, `Informe_F910_Hacienda_${anioF910}.csv`);
    } catch (err) {
      alert("Error descargando F-910: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarFiniquito = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const blob = await api.calcularFiniquitoPDF(liqData);
      downloadBlob(blob, `Finiquito_Laboral_Empleado_${liqData.empleado_id}.pdf`);
    } catch (err) {
      alert("Error generando finiquito: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '980px',
        width: '100%',
        maxHeight: '90vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#0F172A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E293B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#2563EB', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
              <FileSpreadsheet size={24} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Centro de Exportaciones Oficiales & Reportes Avanzados
                </h3>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#78350F', fontWeight: 'bold', padding: '0.15rem 0.6rem', borderRadius: '999px' }}>
                  EL SALVADOR 🇸🇻
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Genera en 1 clic tus declaraciones para ISSS, AFP, Pagos Masivos Bancarios, F-910 Hacienda y Finiquitos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Banner de Licencia / Monetización */}
        <div style={{
          padding: '0.75rem 1.75rem',
          backgroundColor: isPremium ? '#F0FDF4' : '#FFFBEB',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: isPremium ? '#15803D' : '#B45309', fontWeight: 'bold' }}>
            {isPremium ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            {isPremium 
              ? '✨ Módulo Avanzado Habilitado (Incluido en Licencia Pro / Acceso Propietario).' 
              : '⭐ Módulo de Exportaciones Oficiales ($10.00/mes). Habilita descargas ilimitadas de ISSS, AFP, Bancos y F-910.'}
          </div>

          {!isPremium && (
            <button
              onClick={() => alert("Para activar el Módulo de Exportaciones Oficiales ($10.00/mes), realiza tu transferencia vía Transfer365 Davivienda (69893101 - Cesar Arias) y notifícala desde el botón de Pago.")}
              style={{
                padding: '0.3rem 0.75rem',
                backgroundColor: '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Activar Módulo por $10.00/mes
            </button>
          )}
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          {[
            { id: 'isss_afp', title: '📄 ISSS & AFP Oficial', icon: <FileText size={14} /> },
            { id: 'bancos', title: '🏦 Pago Masivo Bancos', icon: <Landmark size={14} /> },
            { id: 'f910', title: '📊 Informe F-910 Hacienda', icon: <Zap size={14} /> },
            { id: 'finiquito', title: '📑 Finiquito Art. 58 C.T.', icon: <Scale size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                padding: '0.85rem 0.5rem',
                border: 'none',
                borderBottom: activeTab === t.id ? '3px solid #2563EB' : '3px solid transparent',
                backgroundColor: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? '#2563EB' : '#64748B',
                fontWeight: 'bold',
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              {t.icon} {t.title}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, backgroundColor: 'white' }}>
          
          {/* TAB 1: ISSS & AFP */}
          {activeTab === 'isss_afp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1rem', fontWeight: 'bold' }}>
                Archivos Oficiales para Declaraciones de Ley ({codigoPeriodo || 'NÓMINA'})
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.4rem 0', color: '#1E40AF', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={16} /> Planilla Única ISSS (OIR TXT)
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                      Genera el archivo delimitado por tubos (`|`) requerido para cargar las cotizaciones patronales y laborales directamente en la plataforma OIR del Instituto Salvadoreño del Seguro Social.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadISSS}
                    disabled={loading}
                    style={{ marginTop: '1rem', padding: '0.6rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Download size={15} /> Descargar TXT Oficial ISSS
                  </button>
                </div>

                <div style={{ padding: '1.25rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.4rem 0', color: '#15803D', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileSpreadsheet size={16} /> Cotizaciones AFP (Crecer / Confia CSV)
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                      Genera el archivo CSV con la estructura exacta de NUP, cotizaciones laborales (7.25%) y patronales (8.75%) para subir sin digitación en AFP Crecer y AFP Confia.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadAFP}
                    disabled={loading}
                    style={{ marginTop: '1rem', padding: '0.6rem', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Download size={15} /> Descargar CSV AFP (Crecer/Confia)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGO MASIVO BANCOS */}
          {activeTab === 'bancos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1rem', fontWeight: 'bold' }}>
                Archivo de Pago Masivo Empresarial para Bancos
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Selecciona tu entidad bancaria corporativa para generar el archivo plano de transferencias masivas de sueldos:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>
                    Banco Corporativo Depositante *
                  </label>
                  <select
                    value={bancoSeleccionado}
                    onChange={(e) => setBancoSeleccionado(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 'bold', color: '#0F172A' }}
                  >
                    <option value="BANCO_AGRICOLA">Banco Agrícola (Formato Telebanca TXT)</option>
                    <option value="BANCO_DAVIVIENDA">Banco Davivienda (Formato Davibox CSV)</option>
                    <option value="BAC_CREDOMATIC">BAC Credomatic (Formato BAC en Línea)</option>
                    <option value="BANCO_CUSCATLAN">Banco Cuscatlán (Formato Portal Corporativo)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={handleDownloadBanco}
                    disabled={loading}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Download size={16} /> Descargar Archivo Masivo {bancoSeleccionado.replace('_', ' ')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFORME F-910 HACIENDA */}
          {activeTab === 'f910' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1rem', fontWeight: 'bold' }}>
                Informe Anual F-910 de Retenciones ISR (Ministerio de Hacienda)
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: '1.45' }}>
                Genera el resumen de devengados anuales y retenciones de Impuesto sobre la Renta (ISR) exigido por la Dirección General de Impuestos Internos (DGII) en enero de cada año fiscal.
              </p>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                <div style={{ width: '180px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#334155' }}>
                    Año Fiscal a Declarar:
                  </label>
                  <select
                    value={anioF910}
                    onChange={(e) => setAnioF910(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    <option value={2026}>Año Fiscal 2026</option>
                    <option value={2025}>Año Fiscal 2025</option>
                    <option value={2024}>Año Fiscal 2024</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    onClick={handleDownloadF910}
                    disabled={loading}
                    style={{ padding: '0.65rem 1.25rem', backgroundColor: '#D97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Download size={16} /> Descargar Informe F-910 Hacienda (CSV)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINIQUITO LABORAL ART. 58 C.T. */}
          {activeTab === 'finiquito' && (
            <form onSubmit={handleGenerarFiniquito} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1rem', fontWeight: 'bold' }}>
                Calculadora de Indemnización, Liquidación & Generador de Finiquito PDF
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#334155' }}>
                    Empleado a Liquidar *
                  </label>
                  <select
                    value={liqData.empleado_id}
                    onChange={(e) => setLiqData({ ...liqData, empleado_id: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  >
                    {empleados.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.primer_nombre} {emp.primer_apellido} (DUI: {emp.dui})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#334155' }}>
                    Causal de Salida *
                  </label>
                  <select
                    value={liqData.motivo}
                    onChange={(e) => setLiqData({ ...liqData, motivo: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  >
                    <option value="Despido Injustificado">Despido Injustificado (Aplica Art. 58 C.T. 100%)</option>
                    <option value="Renuncia Voluntaria">Renuncia Voluntaria (Prestaciones Proporcionales)</option>
                    <option value="Finalización de Contrato">Finalización de Contrato a Plazo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#334155' }}>
                    Salario Mensual (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={liqData.salario_mensual}
                    onChange={(e) => setLiqData({ ...liqData, salario_mensual: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#334155' }}>
                    Años de Servicio Laborados *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={liqData.anios_servicio}
                    onChange={(e) => setLiqData({ ...liqData, anios_servicio: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <Download size={15} /> Generar Finiquito PDF
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
