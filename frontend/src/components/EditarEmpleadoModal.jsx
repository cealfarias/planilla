import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { X, User, Camera, Building, CreditCard, Save } from 'lucide-react';

export default function EditarEmpleadoModal({ empleado, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    primer_nombre: empleado.primer_nombre || '',
    segundo_nombre: empleado.segundo_nombre || '',
    primer_apellido: empleado.primer_apellido || '',
    segundo_apellido: empleado.segundo_apellido || '',
    telefono: empleado.telefono || '',
    email_institucional: empleado.email_institucional || '',
    departamento_residencia: empleado.departamento_residencia || '',
    municipio_residencia: empleado.municipio_residencia || '',
    distrito_residencia: empleado.distrito_residencia || '',
    banco_nombre: empleado.banco_nombre || '',
    numero_cuenta_bancaria: empleado.numero_cuenta_bancaria || '',
    foto_url_base64: empleado.foto_url_base64 || ''
  });

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe pesar más de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setFormData(prev => ({ ...prev, foto_url_base64: evt.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.actualizarEmpleado(empleado.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al actualizar la información del colaborador.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = formData.primer_nombre ? formData.primer_nombre.charAt(0) : '';
    const last = formData.primer_apellido ? formData.primer_apellido.charAt(0) : '';
    return (first + last).toUpperCase() || 'EM';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1.5rem', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)', borderRadius: '12px', width: '100%', maxWidth: '650px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(to right, #1e3a8a, #2563eb)', color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} /> Perfil y Editar Colaborador
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
            <X size={24} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* FOTO SECCION */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              {formData.foto_url_base64 ? (
                <img 
                  src={formData.foto_url_base64} 
                  alt="Foto Colaborador" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              ) : (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 'bold', border: '3px solid #2563eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                  {getInitials()}
                </div>
              )}

              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  backgroundColor: '#2563eb', color: 'white', border: '2px solid white',
                  borderRadius: '50%', width: '28px', height: '28px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
                title="Cambiar fotografía"
              >
                <Camera size={14} />
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFotoUpload} />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: 'var(--text-main)' }}>Fotografía de Perfil</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Se mostrará en la lista del directorio y en la boleta de pago. Haz clic en la cámara para subir imagen (Máx 2MB).
              </p>
              {formData.foto_url_base64 && (
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, foto_url_base64: '' }))}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginTop: '0.4rem', textDecoration: 'underline' }}
                >
                  Eliminar foto actual
                </button>
              )}
            </div>
          </div>

          {/* DATOS PERSONALES */}
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.9rem', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Nombres y Apellidos
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Primer Nombre *</label>
              <input 
                type="text" required className="form-input" style={{ width: '100%' }}
                value={formData.primer_nombre} onChange={e => setFormData({ ...formData, primer_nombre: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Segundo Nombre</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }}
                value={formData.segundo_nombre} onChange={e => setFormData({ ...formData, segundo_nombre: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Primer Apellido *</label>
              <input 
                type="text" required className="form-input" style={{ width: '100%' }}
                value={formData.primer_apellido} onChange={e => setFormData({ ...formData, primer_apellido: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Segundo Apellido</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }}
                value={formData.segundo_apellido} onChange={e => setFormData({ ...formData, segundo_apellido: e.target.value })}
              />
            </div>
          </div>

          {/* CONTACTO Y DIRECCIÓN */}
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.9rem', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contacto & Residencia
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Teléfono Móvil</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }} placeholder="Ej. 7890-1234"
                value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Correo Institucional</label>
              <input 
                type="email" className="form-input" style={{ width: '100%' }} placeholder="colaborador@empresa.com"
                value={formData.email_institucional} onChange={e => setFormData({ ...formData, email_institucional: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Departamento Residencia</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }}
                value={formData.departamento_residencia} onChange={e => setFormData({ ...formData, departamento_residencia: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Municipio / Distrito</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }}
                value={formData.distrito_residencia} onChange={e => setFormData({ ...formData, distrito_residencia: e.target.value })}
              />
            </div>
          </div>

          {/* DATOS BANCARIOS */}
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.9rem', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building size={16} /> Datos Bancarios para Depósito de Planilla
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Banco Institucional</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }} placeholder="Ej. Banco Agrícola, BAC, Cuscatlán"
                value={formData.banco_nombre} onChange={e => setFormData({ ...formData, banco_nombre: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Número de Cuenta Bancaria</label>
              <input 
                type="text" className="form-input" style={{ width: '100%' }} placeholder="000-000-00-000000"
                value={formData.numero_cuenta_bancaria} onChange={e => setFormData({ ...formData, numero_cuenta_bancaria: e.target.value })}
              />
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
