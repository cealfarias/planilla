import React, { useState } from 'react';
import { X, Search, FileText, Download, Trash2, Lock, Edit3 } from 'lucide-react';

export default function HistorialPlanillasModal({ 
  isOpen, 
  onClose, 
  planillas, 
  onSelectPlanilla, 
  onCerrarPlanilla, 
  onEliminarPlanilla,
  onDownloadPDF 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const planillasFiltradas = planillas.filter(p => 
    p.codigo_periodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipo_planilla.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      zIndex: 1000,
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #1e3a8a, #2563eb)',
          color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📜 Historial de Planillas Registradas
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Buscar por código de período o tipo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {planillasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p>No se encontraron planillas registradas.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Código Período</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Tipo</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Fechas</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planillasFiltradas.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 'bold' }}>{p.codigo_periodo}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>{p.tipo_planilla}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>{p.fecha_inicio} al {p.fecha_fin}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: p.estado === 'Abierta' ? '#DBEAFE' : '#F1F5F9',
                        color: p.estado === 'Abierta' ? '#1D4ED8' : '#475569'
                      }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => { onSelectPlanilla(p); onClose(); }}
                          title="Cargar esta planilla para visualizar / editar en la pantalla principal"
                        >
                          <Edit3 size={13} /> Cargar / Editar
                        </button>

                        <button 
                          className="btn btn-outline"
                          title="Descargar Planilla General (PDF)"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#1e3a8a', borderColor: '#1e3a8a', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => onDownloadPDF(p.id, 'reporte')}
                        >
                          <FileText size={13} /> Planilla
                        </button>
                        
                        <button 
                          className="btn btn-outline"
                          title="Descargar Boletas de Pago (PDF)"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#4c1d95', borderColor: '#4c1d95', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => onDownloadPDF(p.id, 'boletas')}
                        >
                          <Download size={13} /> Boletas
                        </button>

                        {p.estado === 'Abierta' ? (
                          <>
                            <button 
                              className="btn btn-outline" 
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                              onClick={() => onEliminarPlanilla(p.id)}
                              title="Eliminar este período de planilla"
                            >
                              <Trash2 size={13} /> Eliminar
                            </button>

                            <button 
                              className="btn btn-outline" 
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                              onClick={() => onCerrarPlanilla(p.id)}
                              title="Cerrar planilla definitivamente"
                            >
                              <Lock size={13} /> Cerrar
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', opacity: 0.6 }}>
                            🔒 Cerrada
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
