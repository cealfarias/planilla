import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, CheckCircle2, AlertCircle, Share2, Send, 
  Printer, DollarSign, Building2, Smartphone, CreditCard, RefreshCw, FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function PartidaContableModal({ isOpen, onClose, periodoId, codigoPeriodo }) {
  const [formaPago, setFormaPago] = useState('TRANSFERENCIA');
  const [partidaData, setPartidaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [telefonoContador, setTelefonoContador] = useState('');
  const [notificadoOk, setNotificadoOk] = useState(false);

  useEffect(() => {
    if (isOpen && periodoId) {
      cargarPartida();
    }
  }, [isOpen, periodoId, formaPago]);

  const cargarPartida = async () => {
    try {
      setLoading(true);
      const data = await api.getPartidaContable(periodoId, formaPago);
      setPartidaData(data);
    } catch (err) {
      console.error("Error cargando partida contable:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificarContador = async () => {
    try {
      setLoading(true);
      const res = await api.notificarContador(periodoId, telefonoContador);
      setNotificadoOk(true);
      
      // Abrir WhatsApp en pestaña nueva si se generó el enlace
      if (res.whatsapp_url) {
        window.open(res.whatsapp_url, '_blank');
      }
      setTimeout(() => setNotificadoOk(false), 4000);
    } catch (err) {
      alert("Error al enviar notificación al contador: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        maxWidth: '920px',
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
            <div style={{ backgroundColor: '#2563EB', padding: '0.45rem', borderRadius: '8px', display: 'flex' }}>
              <BookOpen size={22} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>
                  Asiento / Partida Contable por Doble Entrada
                </h3>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 'bold', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
                  {codigoPeriodo || 'PLANILLA'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Clasificación por Departamentos (Administración, Ventas, Costos) y principio de partida doble.
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

        {/* Bar Selector de Forma de Pago */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '1rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Seleccionar Forma de Pago de la Nómina:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
              <button
                type="button"
                onClick={() => setFormaPago('TRANSFERENCIA')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  border: formaPago === 'TRANSFERENCIA' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  backgroundColor: formaPago === 'TRANSFERENCIA' ? '#EFF6FF' : 'white',
                  color: formaPago === 'TRANSFERENCIA' ? '#1E40AF' : '#475569',
                  cursor: 'pointer'
                }}
              >
                🏦 Transferencia (Banco Davivienda)
              </button>

              <button
                type="button"
                onClick={() => setFormaPago('EFECTIVO')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  border: formaPago === 'EFECTIVO' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                  backgroundColor: formaPago === 'EFECTIVO' ? '#F0FDF4' : 'white',
                  color: formaPago === 'EFECTIVO' ? '#15803D' : '#475569',
                  cursor: 'pointer'
                }}
              >
                💵 Efectivo (Caja General)
              </button>

              <button
                type="button"
                onClick={() => setFormaPago('CHEQUE')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  border: formaPago === 'CHEQUE' ? '2px solid #D97706' : '1px solid #CBD5E1',
                  backgroundColor: formaPago === 'CHEQUE' ? '#FFFBEB' : 'white',
                  color: formaPago === 'CHEQUE' ? '#B45309' : '#475569',
                  cursor: 'pointer'
                }}
              >
                📑 Cheque Bancario
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 'bold' }}>Estado de Cuadre:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold', color: partidaData?.cuadrado ? '#16A34A' : '#DC2626' }}>
              {partidaData?.cuadrado ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {partidaData?.cuadrado ? 'Sumas Iguales Cuadradas ($DEBE = $HABER)' : 'Descuadre Detectado'}
            </div>
          </div>
        </div>

        {/* Content Body: Tabla de Partida Contable */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: 'white' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Generando partida contable agrupada por departamento...</p>
            </div>
          ) : partidaData ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0F172A', color: 'white', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Cuenta</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Nombre de la Cuenta Contable</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Debe (Cargos)</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Haber (Abonos)</th>
                  </tr>
                </thead>
                <tbody>
                  {partidaData.lineas.map((linea, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? 'white' : '#F8FAFC' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 'bold', color: '#334155' }}>{linea.codigo_cuenta}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#0F172A' }}>{linea.nombre_cuenta}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 'bold', color: linea.debe > 0 ? '#1E40AF' : '#94A3B8' }}>
                        {linea.debe > 0 ? `$${linea.debe.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 'bold', color: linea.haber > 0 ? '#15803D' : '#94A3B8' }}>
                        {linea.haber > 0 ? `$${linea.haber.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#F1F5F9', borderTop: '2px solid #0F172A', fontWeight: 'bold' }}>
                    <td colSpan={2} style={{ padding: '0.85rem 1rem', textTransform: 'uppercase', color: '#0F172A' }}>
                      SUMAS IGUALES (PRINCIPIO DE DOBLE ENTRADA)
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '1rem', color: '#1E40AF' }}>
                      ${partidaData.total_debe.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '1rem', color: '#15803D' }}>
                      ${partidaData.total_haber.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Notificación al Contador y WhatsApp */}
              <div style={{ marginTop: '1.5rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1.25rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  📲 Notificar Partida Contable al Contador
                </h5>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Teléfono WhatsApp del Contador (+503 7000-0000)"
                    value={telefonoContador}
                    onChange={(e) => setTelefonoContador(e.target.value)}
                    style={{ flex: 1, minWidth: '220px', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />

                  <button
                    onClick={handleNotificarContador}
                    disabled={loading}
                    style={{
                      padding: '0.6rem 1.25rem',
                      backgroundColor: '#16A34A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <Send size={15} /> Notificar Inbox & Enviar WhatsApp
                  </button>

                  <button
                    onClick={() => window.print()}
                    style={{
                      padding: '0.6rem 1rem',
                      backgroundColor: '#0F172A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Printer size={15} /> Imprimir / PDF
                  </button>
                </div>

                {notificadoOk && (
                  <div style={{ marginTop: '0.75rem', color: '#15803D', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> ¡Notificación registrada en el Inbox del Contador y enlace a WhatsApp generado!
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
              No se pudo cargar la partida contable.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
