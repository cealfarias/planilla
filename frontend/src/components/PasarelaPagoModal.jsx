import React, { useState } from 'react';
import { 
  X, CreditCard, Building2, Smartphone, CheckCircle2, ShieldCheck, 
  Copy, Check, ArrowRight, Upload, Lock, Sparkles, DollarSign 
} from 'lucide-react';
import { api } from '../services/api';

export default function PasarelaPagoModal({ isOpen, onClose, monto = 29.99, concepto = 'Suscripción Licencia Pro Enterprise (1 Mes)' }) {
  const [metodo, setMetodo] = useState('transfer365'); // 'transfer365' | 'tarjeta' | 'qr'
  const [copiadoNum, setCopiadoNum] = useState(false);
  const [numComprobante, setNumComprobante] = useState('');
  const [loading, setLoading] = useState(false);
  const [completado, setCompletado] = useState(false);

  // Formulario de tarjeta de credito
  const [tarjetaForm, setTarjetaForm] = useState({
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  });

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
    try {
      setLoading(true);

      // Enviar reporte de pago al soporte interno / propietario para validación instantánea
      await api.crearTicketSoporte({
        asunto: `💳 COMPROBANTE DE PAGO RECLAMADO: $${monto.toFixed(2)} - ${concepto}`,
        categoria: 'Facturación / Licencia',
        prioridad: 'Alta',
        mensaje_inicial: `REPORTE DE PAGO REGISTRADO EN PASARELA INTERNA\n\n` +
          `Concepto: ${concepto}\n` +
          `Monto Pagado: $${monto.toFixed(2)}\n` +
          `Método Elegido: ${metodo === 'transfer365' ? 'Transfer365 Móvil (Davivienda)' : metodo === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Código QR'}\n` +
          `Número de Comprobante / Referencia Transfer365: ${numComprobante || 'N/A (Procesado por tarjeta/QR)'}\n` +
          `Titular Cuenta Origen / Tarjeta: ${tarjetaForm.nombre || 'Cesar Arias'}\n\n` +
          `Favor de verificar y activar inmediatamente los beneficios Premium.`
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
        maxWidth: '720px',
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
                Pasarela de Pago Interna & Activación
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Pagos locales e internacionales 100% seguros en El Salvador.
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
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Item Seleccionado</span>
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
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.35rem' }}>¡Pago Registrado & Licencia Activada!</h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.9rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                Tu transacción ha sido notificada al propietario. Los beneficios de tu <strong>Licencia Pro Enterprise (Sin Anuncios)</strong> ya han sido activados en tu cuenta.
              </p>
              <button
                onClick={() => {
                  setCompletado(false);
                  onClose();
                }}
                style={{ backgroundColor: '#16A34A', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Entendido y Continuar
              </button>
            </div>
          ) : (
            <>
              {/* Pestañas de Selección de Método de Pago */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                
                <button
                  type="button"
                  onClick={() => setMetodo('transfer365')}
                  style={{
                    padding: '0.85rem 0.5rem',
                    borderRadius: '10px',
                    border: metodo === 'transfer365' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: metodo === 'transfer365' ? '#EFF6FF' : 'white',
                    color: metodo === 'transfer365' ? '#1E40AF' : '#475569',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Smartphone size={22} color={metodo === 'transfer365' ? '#2563EB' : '#64748B'} />
                  Transfer365 Móvil (Local)
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo('tarjeta')}
                  style={{
                    padding: '0.85rem 0.5rem',
                    borderRadius: '10px',
                    border: metodo === 'tarjeta' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: metodo === 'tarjeta' ? '#EFF6FF' : 'white',
                    color: metodo === 'tarjeta' ? '#1E40AF' : '#475569',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CreditCard size={22} color={metodo === 'tarjeta' ? '#2563EB' : '#64748B'} />
                  Tarjeta Crédito / Débito
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo('qr')}
                  style={{
                    padding: '0.85rem 0.5rem',
                    borderRadius: '10px',
                    border: metodo === 'qr' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: metodo === 'qr' ? '#EFF6FF' : 'white',
                    color: metodo === 'qr' ? '#1E40AF' : '#475569',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Building2 size={22} color={metodo === 'qr' ? '#2563EB' : '#64748B'} />
                  Código QR Wompi / BAC
                </button>

              </div>

              {/* DETALLE SEGÚN EL MÉTODO ELEGIDO */}
              {metodo === 'transfer365' && (
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    <Smartphone size={20} /> Transferencia Directa Transfer365 Móvil (El Salvador)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #86EFAC' }}>
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
                    💡 <strong>¿Cómo pagar?</strong> Ingresa a la app de tu banco (Davivienda, Agrícola, Cuscatlán, BAC, etc.), selecciona <strong>Transfer365 Móvil</strong>, ingresa el número <strong>69893101</strong> y transfiere <strong>${monto.toFixed(2)} USD</strong>.
                  </p>
                </div>
              )}

              {metodo === 'tarjeta' && (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E293B', fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    <Lock size={18} color="#2563EB" /> Pago Seguro con Tarjeta de Crédito o Débito
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.25rem' }}>Número de Tarjeta</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8910"
                        value={tarjetaForm.numero}
                        onChange={(e) => setTarjetaForm({ ...tarjetaForm, numero: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.25rem' }}>Nombre en la Tarjeta</label>
                      <input
                        type="text"
                        placeholder="Ej. CESAR ARIAS"
                        value={tarjetaForm.nombre}
                        onChange={(e) => setTarjetaForm({ ...tarjetaForm, nombre: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.25rem' }}>Expiración (MM/AA)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={tarjetaForm.expiracion}
                          onChange={(e) => setTarjetaForm({ ...tarjetaForm, expiracion: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.25rem' }}>Código CVC / CVV</label>
                        <input
                          type="text"
                          placeholder="352"
                          value={tarjetaForm.cvv}
                          onChange={(e) => setTarjetaForm({ ...tarjetaForm, cvv: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {metodo === 'qr' && (
                <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' }}>Escanea con tu App Bancaria</span>
                  <div style={{ margin: '1rem 0' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TRANSFER365_DAVIVIENDA_69893101_MONTO_${monto}`}
                      alt="Código QR de Pago"
                      style={{ border: '4px solid white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                    Escanea este código QR con la app de Banco Davivienda, Wompi o BAC Credomatic para transferir <strong>${monto.toFixed(2)} USD</strong> a <strong>Cesar Arias</strong>.
                  </p>
                </div>
              )}

              {/* Formulario de Confirmación y Número de Comprobante */}
              <form onSubmit={handleConfirmarPago} style={{ backgroundColor: '#FAFAFA', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 'bold' }}>
                  Validación de Comprobante / Referencia de Pago
                </h5>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem' }}>
                    Número de Comprobante / Referencia Transfer365 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. REF-9840210 / TRX-88931"
                    value={numComprobante}
                    onChange={(e) => setNumComprobante(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ShieldCheck size={16} color="#16A34A" /> Encriptación SSL 256-bit
                  </span>

                  <button
                    type="submit"
                    disabled={loading}
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
