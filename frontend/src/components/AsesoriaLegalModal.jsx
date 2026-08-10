import React, { useState } from 'react';
import { 
  X, Scale, ShieldCheck, FileText, UserCheck, PhoneCall, 
  Send, CheckCircle2, Award, Clock, DollarSign, ExternalLink, AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export default function AsesoriaLegalModal({ isOpen, onClose }) {
  const [paso, setPaso] = useState('servicios'); // 'servicios' | 'formulario'
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [form, setForm] = useState({
    asunto: '',
    abogado_bufete: 'Bufete Laboral El Salvador (Abogados Certificados CSJ)',
    caso_detalle: '',
    telefono_contacto: '',
    urgencia: 'Alta'
  });
  const [loading, setLoading] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);

  const paquetesLegales = [
    {
      id: 'consulta_expresa',
      titulo: 'Consulta Legal Expresa',
      honorarios: '$25.00',
      periodo: 'por dictamen',
      descripcion: 'Opinión jurídica emitida por abogado certificado sobre despido, contratos o cálculo de indemnización.',
      caracteristicas: [
        'Respuesta por escrito en menos de 24 horas',
        'Revisión previa de boletas y contratos',
        'Fundamento técnico en el Código de Trabajo'
      ],
      destacado: false
    },
    {
      id: 'inspeccion_mtps',
      titulo: 'Defensa en Inspección MTPS',
      honorarios: '$150.00',
      periodo: 'por audiencia',
      descripcion: 'Acompañamiento y defensa técnica en citatorios o inspecciones del Ministerio de Trabajo de El Salvador.',
      caracteristicas: [
        'Representación por Abogado Autorizado por la CSJ',
        'Elaboración de alegatos y pliegos descargos',
        'Prevención de multas y sanciones laborales'
      ],
      destacado: true
    },
    {
      id: 'auditoria_laboral',
      titulo: 'Auditoría Laboral Preventiva',
      honorarios: '$250.00',
      periodo: 'por evaluación',
      descripcion: 'Diagnóstico legal completo de expedientes, contratos, reglamento interno y planillas de la empresa.',
      caracteristicas: [
        'Dictamen de cumplimiento fiscal y laboral',
        'Regularización de contratos y prestaciones',
        'Certificado de Cumplimiento Laboral'
      ],
      destacado: false
    },
    {
      id: 'defensa_juzgados',
      titulo: 'Patrocinio Judicial Laboral',
      honorarios: '$450.00',
      periodo: 'por proceso',
      descripcion: 'Defensa integral en demandas ante los Juzgados de lo Laboral de San Salvador, Santa Ana y San Miguel.',
      caracteristicas: [
        'Representación legal completa en juicio',
        'Contestación de demandas y prueba documental',
        'Negociación de acuerdos conciliatorios'
      ],
      destacado: false
    }
  ];

  const handleSeleccionarServicio = (pkg) => {
    setServicioSeleccionado(pkg);
    setForm({
      ...form,
      asunto: `Solicitud de ${pkg.titulo} (${pkg.honorarios})`
    });
    setPaso('formulario');
  };

  const handleEnviarSolicitud = async (e) => {
    e.preventDefault();
    if (!form.caso_detalle.trim() || !form.telefono_contacto.trim()) return;

    try {
      setLoading(true);
      await api.crearTicketSoporte({
        asunto: `⚖️ SERVICIO LEGAL: ${form.asunto}`,
        categoria: 'Consultoría Laboral',
        prioridad: form.urgencia,
        mensaje_inicial: `SOLICITUD DE ASESORÍA LEGAL LABORAL CON ABOGADOS CERTIFICADOS\n\n` +
          `Servicio: ${servicioSeleccionado?.titulo || form.asunto}\n` +
          `Honorarios Estimados: ${servicioSeleccionado?.honorarios || 'A cotizar'}\n` +
          `Teléfono / WhatsApp de Contacto: ${form.telefono_contacto}\n` +
          `Prioridad: ${form.urgencia}\n\n` +
          `DETALLE DEL CASO LABORAL:\n${form.caso_detalle}`
      });
      setEnviadoExito(true);
    } catch (err) {
      alert("Error al enviar la solicitud legal: " + err.message);
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
      backdropFilter: 'blur(6px)',
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
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
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
            <div style={{ backgroundColor: '#B45309', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <Scale size={24} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                  Asesoría Legal Laboral & Servicios Jurídicos
                </h3>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#F59E0B', color: '#78350F', fontWeight: 'bold', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                  ABOGADOS CSJ EL SALVADOR
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Respaldo técnico por abogados autorizados por la Corte Suprema de Justicia de la República de El Salvador.
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

        {/* Content Area */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
          
          {enviadoExito ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.35rem' }}>¡Solicitud Legal Enviada con Éxito!</h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#475569', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto', fontSize: '0.9rem' }}>
                Tu caso ha sido asignado a nuestro bufete de **Abogados Laboralistas Certificados**. Un especialista se comunicará contigo vía WhatsApp o teléfono al <strong>{form.telefono_contacto}</strong> para la evaluación de tu expediente.
              </p>
              <button
                onClick={() => {
                  setEnviadoExito(false);
                  setPaso('servicios');
                  onClose();
                }}
                style={{ backgroundColor: '#2563EB', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Volver al Panel Principal
              </button>
            </div>
          ) : paso === 'servicios' ? (
            <>
              {/* Banner de Garantía Profesional */}
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <UserCheck size={32} color="#D97706" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#92400E', fontWeight: 'bold' }}>
                    ⚖️ Firma Legal & Bufete Asociado de El Salvador
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#B45309' }}>
                    Todos los dictámenes y defensas son ejecutados por profesionales del derecho colegiados y autorizados por la CSJ con amplia trayectoria en el Código de Trabajo y mediación laboral.
                  </p>
                </div>
              </div>

              {/* Grid de Paquetes de Honorarios */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
                {paquetesLegales.map(pkg => (
                  <div
                    key={pkg.id}
                    style={{
                      backgroundColor: 'white',
                      border: pkg.destacado ? '2px solid #D97706' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: pkg.destacado ? '0 8px 20px rgba(217, 119, 6, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {pkg.destacado && (
                      <span style={{
                        position: 'absolute',
                        top: '-11px',
                        right: '16px',
                        backgroundColor: '#D97706',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px'
                      }}>
                        MÁS SOLICITADO
                      </span>
                    )}

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 'bold' }}>{pkg.titulo}</h4>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#D97706' }}>{pkg.honorarios}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>{pkg.periodo}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                        {pkg.descripcion}
                      </p>

                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {pkg.caracteristicas.map((c, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
                            <CheckCircle2 size={14} color="#16A34A" /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSeleccionarServicio(pkg)}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: pkg.destacado ? '#D97706' : '#0F172A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      Solicitar Asesoría ({pkg.honorarios})
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleEnviarSolicitud} style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <Scale size={20} color="#D97706" />
                <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1.1rem' }}>
                  Solicitud de Servicio: {servicioSeleccionado?.titulo}
                </h4>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                  Servicio Requerido & Honorarios
                </label>
                <input
                  type="text"
                  disabled
                  value={`${servicioSeleccionado?.titulo} - Honorarios: ${servicioSeleccionado?.honorarios}`}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9', fontSize: '0.85rem', fontWeight: 'bold', color: '#0F172A' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                  Teléfono / WhatsApp Directo de Contacto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +503 7000-0000 / 2200-0000"
                  value={form.telefono_contacto}
                  onChange={(e) => setForm({ ...form, telefono_contacto: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                  Urgencia del Caso Laboral
                </label>
                <select
                  value={form.urgencia}
                  onChange={(e) => setForm({ ...form, urgencia: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                >
                  <option value="Alta">Urgencia Alta (Citatorio o Audiencia en menos de 48 horas)</option>
                  <option value="Media">Urgencia Media (Consulta o revisión de expediente)</option>
                  <option value="Baja">Preventiva (Auditoría regular)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                  Descripción Detallada del Caso o Citatorio MTPS *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Explica brevemente los hechos del caso: fechas de despido, montos disputados o pliego de la inspección laboral..."
                  value={form.caso_detalle}
                  onChange={(e) => setForm({ ...form, caso_detalle: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPaso('servicios')}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Volver a Paquetes
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#D97706', color: 'white', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)' }}
                >
                  <Send size={15} /> Confirmar & Enviar Caso a Abogado
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
