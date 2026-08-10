import React, { useState } from 'react';
import { 
  X, CreditCard, Smartphone, CheckCircle2, ShieldCheck, 
  Copy, Check, Send, Building2 
} from 'lucide-react';
import { api } from '../services/api';

export default function PasarelaPagoModal({ isOpen, onClose, monto = 29.99, concepto = 'Suscripción Licencia Pro Enterprise (1 Mes)' }) {
  const [copiadoNum, setCopiadoNum] = useState(false);
  const [numComprobante, setNumComprobante] = useState('');
  const [loading, setLoading] = useState(false);
  const [completado, setCompletado] = useState(false);

  const datosTransfer365 = {
    metodo: 'Transfer365 Móvil / ACH El Salvador',
    movil: '69893101',
    banco: 'Banco Davivienda',
    titular: 'Cesar Arias'
  };

  const handleCopiarMovil = () => {
    navigator.clipboard.writeText(datosTransfer365.movil);
    setCopiadoNum(true);
    setTimeout(() => setCopiadoNum(false), 2000);
  };

  const handleConfirmarPago = async (e) => {
    e.preventDefault();
    if (!numComprobante.trim()) return;

    try {
      setLoading(true);

      // Enviar reporte de pago real con numero de comprobante al inbox del propietario
      await api.crearTicketSoporte({
        asunto: `💳 COMPROBANTE DE PAGO RECLAMADO: $${monto.toFixed(2)} - ${concepto}`,
        categoria: 'Facturación / Licencia',
        prioridad: 'Alta',
        mensaje_inicial: `REPORTE DE PAGO REGISTRADO EN PASARELA INTERNA\n\n` +
          `Concepto: ${concepto}\n` +
          `Monto Pagado: $${monto.toFixed(2)} USD\n` +
          `Método de Pago: Transfer365 Móvil (Banco Davivienda - 69893101)\n` +
          `Número de Comprobante / Referencia Transfer365: ${numComprobante.trim()}\n` +
          `Titular de Cuenta Receptor: Cesar Arias\n\n` +
          `Favor de verificar en la banca en línea Davivienda y validar la activación Pro Enterprise.`
      });

      // Activar licencia Premium localmente
      localStorage.setItem('licencia_tipo', 'premium');
      window.dispatchEvent(new Event('licencia_change'));

      setCompletado(true);
    } catch (err) {
      alert("Error registrando el pago: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '620px',
        width: '100%',
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
            <div style={{ backgroundColor: '#16A34A', padding: '0.4rem 0.6rem', borderRadius: '8px', display: 'flex' }}>
              <CreditCard size={22} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>
                Pasarela de Pago Directa (Transfer365 El Salvador)
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Transferencia inmediata sin comisiones interbancarias.
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

        {/* Resumen del Pedido */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '1rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Concepto</span>
            <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '0.95rem', color: '#0F172A', fontWeight: 'bold' }}>{concepto}</h4>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Total a Pagar</span>
            <div style={{ fontSize: '1.4rem', color: '#16A34A', fontWeight: 'bold' }}>${monto.toFixed(2)} USD</div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '70vh' }}>
          
          {completado ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.35rem' }}>¡Comprobante Registrado & Licencia Activada!</h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.9rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                Tu transferencia ha sido enviada al Propietario para validación. Tu cuenta ahora cuenta con los beneficios de la <strong>Licencia Pro Enterprise (Sin Anuncios)</strong>.
              </p>
              <button
                onClick={() => {
                  setCompletado(false);
                  onClose();
                }}
                style={{ backgroundColor: '#16A34A', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              {/* DATOS DIRECTOS DE TRANSFER365 */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 'bold', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
                  <Smartphone size={20} /> Datos para Transferencia Transfer365 Móvil
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Número Celular Transfer365</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#15803D' }}>{datosTransfer365.movil}</span>
                      <button
                        type="button"
                        onClick={handleCopiarMovil}
                        style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 'bold' }}
                      >
                        {copiadoNum ? <Check size={14} /> : <Copy size={14} />} {copiadoNum ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Banco Receptor</span>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0F172A', marginTop: '0.2rem' }}>{datosTransfer365.banco}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Nombre del Titular</span>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0F172A', marginTop: '0.2rem' }}>{datosTransfer365.titular}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#166534', margin: '0.75rem 0 0 0', lineHeight: '1.4' }}>
                  💡 <strong>Instrucciones:</strong> Ingresa a la banca en línea de tu banco (Davivienda, Agrícola, Cuscatlán, BAC, etc.), selecciona <strong>Transfer365 Móvil</strong>, transfiere <strong>${monto.toFixed(2)} USD</strong> al celular <strong>69893101 (Cesar Arias)</strong> e ingresa el número de comprobante abajo.
                </p>
              </div>

              {/* Formulario de Confirmación de Comprobante */}
              <form onSubmit={handleConfirmarPago} style={{ backgroundColor: '#FAFAFA', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 'bold' }}>
                  Registro de Número de Comprobante Transfer365
                </h5>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                    Número de Comprobante / Referencia Transfer365 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. REF-9840210 / TRX-88931"
                    value={numComprobante}
                    onChange={(e) => setNumComprobante(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ShieldCheck size={16} color="#16A34A" /> Notificación directa al propietario
                  </span>

                  <button
                    type="submit"
                    disabled={loading || !numComprobante.trim()}
                    style={{
                      backgroundColor: '#16A34A',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={16} /> Confirmar & Activar Suscripción (${monto.toFixed(2)})
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
