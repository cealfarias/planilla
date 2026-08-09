import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { notificarVacacionWhatsApp, notificarVacacionEmail } from '../utils/notificaciones';
import { X, Calendar, Send, Mail, CheckCircle2, AlertTriangle, Scale, Save, Info } from 'lucide-react';

export default function ProgramacionVacacionesModal({ isOpen, onClose }) {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [programacion, setProgramacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarProgramacion(anio);
    }
  }, [isOpen, anio]);

  const cargarProgramacion = async (year) => {
    try {
      setLoading(true);
      const data = await api.getProgramacionVacaciones(year);
      setProgramacion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (empleadoId, newDate) => {
    setProgramacion(prev => prev.map(item => {
      if (item.empleado_id === empleadoId) {
        return { ...item, fecha_inicio_programada: newDate };
      }
      return item;
    }));
  };

  const handleGuardarItem = async (item) => {
    try {
      setSavingId(item.empleado_id);
      await api.guardarProgramacionVacaciones({
        empleado_id: item.empleado_id,
        anio_ejercicio: anio,
        fecha_inicio_programada: item.fecha_inicio_programada,
        observaciones: "Programación anual realizada por RRHH"
      });
      setFeedbackMsg(`✓ Vacación de ${item.nombre_empleado} programada correctamente.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      cargarProgramacion(anio);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <Calendar size={22} /> Programación Anual de Vacaciones (Código de Trabajo SV)
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
              Asigna y notifica las salidas de vacaciones conforme a los Arts. 177, 178, 182 y 183 del C.T.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Legal Info Banner */}
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#475569' }}>
          <div>
            <strong>⚖️ Art. 178 C.T.:</strong> Mínimo 200 días trabajados.
          </div>
          <div>
            <strong>⚖️ Art. 182 C.T.:</strong> Preaviso obligatorio de 30 días antes.
          </div>
          <div>
            <strong>⚖️ Art. 183 C.T.:</strong> Goce obligatorio dentro de 4 meses tras adquirir el derecho.
          </div>
          <div>
            <strong>⚖️ Art. 177 C.T.:</strong> 15 días continuos + 30% recargo salarial.
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
            {feedbackMsg}
          </div>
        )}

        {/* Controls */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Año de Ejercicio:</label>
            <select 
              value={anio} 
              onChange={e => setAnio(parseInt(e.target.value))} 
              className="form-control" 
              style={{ width: '120px' }}
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando {programacion.length} colaborador(es) activo(s)
          </span>
        </div>

        {/* Table Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem 1.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando agenda de vacaciones...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Colaborador</th>
                  <th style={{ padding: '0.75rem' }}>Elegibilidad (Art. 178)</th>
                  <th style={{ padding: '0.75rem' }}>Derecho Adquirido</th>
                  <th style={{ padding: '0.75rem' }}>Límite Goce (Art. 183)</th>
                  <th style={{ padding: '0.75rem' }}>Fecha Salida Asignada</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Preaviso & Notificación (Art. 182)</th>
                </tr>
              </thead>
              <tbody>
                {programacion.map(item => {
                  const fechaSalida = new Date(item.fecha_inicio_programada);
                  const fechaFin = new Date(fechaSalida);
                  fechaFin.setDate(fechaSalida.getDate() + 15);

                  const fechaSalidaStr = item.fecha_inicio_programada;
                  const fechaFinStr = fechaFin.toISOString().split('T')[0];

                  return (
                    <tr key={item.empleado_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                        {item.nombre_empleado}
                      </td>
                      
                      <td style={{ padding: '0.75rem' }}>
                        {item.cumple_200_dias ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                            ✓ Elegible ({item.dias_trabajados_acumulados} días)
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                            ⚠️ No cumple (&lt;200 días)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        {item.fecha_derecho}
                      </td>

                      <td style={{ padding: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
                        {item.fecha_limite_goce}
                      </td>

                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="date" 
                            className="form-control" 
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} 
                            value={item.fecha_inicio_programada} 
                            onChange={e => handleDateChange(item.empleado_id, e.target.value)} 
                          />
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={savingId === item.empleado_id}
                            onClick={() => handleGuardarItem(item)}
                            title="Guardar Fecha Programada"
                          >
                            <Save size={14} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#25d366', borderColor: '#25d366', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => notificarVacacionWhatsApp(item, fechaSalidaStr, fechaFinStr)}
                            title="Notificar Preaviso de 30 Días por WhatsApp"
                          >
                            <Send size={14} /> WhatsApp
                          </button>

                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => notificarVacacionEmail(item, fechaSalidaStr, fechaFinStr)}
                            title="Notificar Preaviso de 30 Días por Correo"
                          >
                            <Mail size={14} /> Correo
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
