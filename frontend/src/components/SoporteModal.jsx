import React, { useState, useEffect } from 'react';
import { 
  X, MessageSquare, Plus, Send, Headphones, Clock, CheckCircle2, 
  AlertCircle, ShieldCheck, User, Building, CornerDownRight, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export default function SoporteModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'nuevo'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  
  // Form para nuevo ticket
  const [nuevoForm, setNuevoForm] = useState({
    asunto: '',
    categoria: 'Soporte Técnico',
    prioridad: 'Media',
    mensaje_inicial: ''
  });

  // Mensaje en chat activo
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarTickets();
    }
  }, [isOpen]);

  const cargarTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getTicketsSoporte();
      setTickets(data || []);
      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      } else if (data && selectedTicket) {
        const actualizado = data.find(t => t.id === selectedTicket.id);
        if (actualizado) setSelectedTicket(actualizado);
      }
    } catch (err) {
      console.error("Error cargando tickets de soporte:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    if (!nuevoForm.asunto.trim() || !nuevoForm.mensaje_inicial.trim()) return;

    try {
      setLoading(true);
      const creado = await api.crearTicketSoporte(nuevoForm);
      setNuevoForm({ asunto: '', categoria: 'Soporte Técnico', prioridad: 'Media', mensaje_inicial: '' });
      await cargarTickets();
      setSelectedTicket(creado);
      setActiveTab('inbox');
    } catch (err) {
      alert("Error al enviar mensaje a soporte: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !selectedTicket) return;

    try {
      setSendingMsg(true);
      const msg = await api.enviarMensajeTicket(selectedTicket.id, nuevoMensaje);
      setNuevoMensaje('');
      await cargarTickets();
    } catch (err) {
      alert("Error enviando mensaje: " + err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!selectedTicket) return;
    try {
      await api.cambiarEstadoTicket(selectedTicket.id, nuevoEstado);
      await cargarTickets();
    } catch (err) {
      alert("Error al actualizar estado: " + err.message);
    }
  };

  if (!isOpen) return null;

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'RESUELTO':
        return <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle2 size={12} /> Resuelto</span>;
      case 'EN_PROCESO':
        return <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12} /> En Proceso</span>;
      default:
        return <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><AlertCircle size={12} /> Abierto</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        height: '85vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#0F172A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E293B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ backgroundColor: '#2563EB', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <Headphones size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Centro de Soporte Técnico & Mensajería Directa</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>Comunícate directamente con el propietario y el equipo de soporte técnico.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={cargarTickets}
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94A3B8', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
              title="Refrescar mensajes"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Content Container */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Sidebar Left Navigation / Ticket List */}
          <div style={{ width: '320px', borderRight: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setActiveTab('inbox')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeTab === 'inbox' ? '#2563EB' : '#E2E8F0',
                  color: activeTab === 'inbox' ? 'white' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <MessageSquare size={14} /> Inbox ({tickets.length})
              </button>
              <button
                onClick={() => setActiveTab('nuevo')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeTab === 'nuevo' ? '#16A34A' : '#E2E8F0',
                  color: activeTab === 'nuevo' ? 'white' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <Plus size={14} /> Nuevo Ticket
              </button>
            </div>

            {/* List of Tickets */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {tickets.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                  No tienes mensajes o tickets registrados. Haz clic en <strong>Nuevo Ticket</strong> para iniciar una consulta.
                </div>
              ) : (
                tickets.map(ticket => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setActiveTab('inbox');
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '0.4rem',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#EFF6FF' : 'white',
                        border: isSelected ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '600' }}>#{ticket.id} • {ticket.categoria}</span>
                        {getEstadoBadge(ticket.estado)}
                      </div>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#1E293B', fontWeight: 'bold' }}>
                        {ticket.asunto}
                      </h5>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🏢 {ticket.nombre_empresa}</span>
                        <span>{new Date(ticket.fecha_actualizacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Main Chat / Form View Right */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            
            {activeTab === 'nuevo' ? (
              <form onSubmit={handleCrearTicket} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                <h4 style={{ margin: 0, color: '#1E293B', fontSize: '1.1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  ✉️ Enviar Nuevo Mensaje al Propietario / Soporte Técnico
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                      Categoría de Consulta *
                    </label>
                    <select
                      value={nuevoForm.categoria}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="Soporte Técnico">Soporte Técnico / Error en el sistema</option>
                      <option value="Consultoría Laboral">Consultoría Laboral El Salvador</option>
                      <option value="Facturación / Licencia">Facturación & Cambio de Licencia</option>
                      <option value="Sugerencia">Sugerencia de nueva funcionalidad</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                      Nivel de Prioridad
                    </label>
                    <select
                      value={nuevoForm.prioridad}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="Baja">Baja (Consulta general)</option>
                      <option value="Media">Media (Atención normal)</option>
                      <option value="Alta">Alta (Dificultad de operación)</option>
                      <option value="Urgente">Urgente (Bloqueo crítico)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                    Asunto del Mensaje *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Consulta sobre cálculo de aguinaldos o error en PDF"
                    value={nuevoForm.asunto}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, asunto: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#475569' }}>
                    Mensaje Detallado *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Describe en detalle tu inquietud o requerimiento para el equipo técnico..."
                    value={nuevoForm.mensaje_inicial}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, mensaje_inicial: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inbox')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#16A34A', color: 'white', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Send size={15} /> Enviar Ticket a Soporte
                  </button>
                </div>
              </form>
            ) : selectedTicket ? (
              <>
                {/* Header Ticket Activo */}
                <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A', fontWeight: 'bold' }}>
                        {selectedTicket.asunto}
                      </h4>
                      {getEstadoBadge(selectedTicket.estado)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Organización: <strong>{selectedTicket.nombre_empresa}</strong> | Usuario: <strong>{selectedTicket.nombre_usuario}</strong> | Prioridad: <strong>{selectedTicket.prioridad}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {selectedTicket.estado !== 'RESUELTO' && (
                      <button
                        onClick={() => handleCambiarEstado('RESUELTO')}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Marcar como Resuelto
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Messages Chat */}
                <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#F1F5F9' }}>
                  {selectedTicket.mensajes?.map(msg => {
                    const esStaff = msg.es_propietario;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: esStaff ? 'flex-start' : 'flex-end',
                          maxWidth: '75%',
                          backgroundColor: esStaff ? '#0F172A' : '#2563EB',
                          color: 'white',
                          borderRadius: esStaff ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                          padding: '0.85rem 1rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '1rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: esStaff ? '#F59E0B' : '#93C5FD', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {esStaff ? <ShieldCheck size={12} /> : <User size={12} />}
                            {esStaff ? 'PROPIETARIO / SOPORTE TÉCNICO' : msg.nombre_remitente}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                            {new Date(msg.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                          {msg.contenido}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Send Input Chat */}
                <form onSubmit={handleEnviarMensaje} style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #E2E8F0', backgroundColor: 'white', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    required
                    placeholder="Escribe una respuesta para el ticket de soporte..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg}
                    style={{ padding: '0.6rem 1.25rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Send size={15} /> Responder
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                <Headphones size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Selecciona un mensaje del Inbox o crea un Nuevo Ticket.</p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
