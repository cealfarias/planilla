import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Save, Building2, UploadCloud, CheckCircle } from 'lucide-react';

export default function Configuracion() {
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    nrc: '',
    direccion: '',
    telefono: '',
    logo_base64: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const cargarEmpresa = async () => {
    try {
      setLoading(true);
      const data = await api.getEmpresa();
      setFormData({
        nombre: data.nombre || '',
        nit: data.nit || '',
        nrc: data.nrc || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        logo_base64: data.logo_base64 || '',
        politica_indemnizacion: data.politica_indemnizacion || 'Acumulada'
      });
    } catch (err) {
      setError('Error al cargar la información de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("El logo no debe pesar más de 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await api.updateEmpresa(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Cargando configuración...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <Building2 size={24} style={{ color: 'var(--primary)' }} />
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Configuración de la Empresa</h2>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#ecfdf5', color: '#10b981', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle size={20} /> Los cambios se han guardado correctamente.
      </div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Datos Principales */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre de Empresa</label>
              <input type="text" name="nombre" className="form-input" required value={formData.nombre} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">NIT</label>
              <input type="text" name="nit" className="form-input" required value={formData.nit} onChange={handleChange} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">NRC (Opcional)</label>
              <input type="text" name="nrc" className="form-input" value={formData.nrc} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Teléfono (Opcional)</label>
              <input type="text" name="telefono" className="form-input" value={formData.telefono} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dirección (Opcional)</label>
            <textarea name="direccion" className="form-input" rows="2" value={formData.direccion} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginTop: '1rem', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <label className="form-label" style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.35rem', display: 'block' }}>
              ⚖️ Política de Indemnización Legal de la Empresa (Art. 58 y Ley de Renuncia)
            </label>
            <select 
              name="politica_indemnizacion" 
              className="form-input" 
              value={formData.politica_indemnizacion} 
              onChange={handleChange}
              style={{ fontWeight: '600', color: '#1e3a8a' }}
            >
              <option value="Acumulada">Acumulada (Calculada por antigüedad total acumulada desde la contratación)</option>
              <option value="Anual">Anual (Indemnización abonada/cancelada cada fin de año fiscal)</option>
            </select>
            <small style={{ display: 'block', color: '#1e40af', marginTop: '0.4rem', fontSize: '0.8rem' }}>
              {formData.politica_indemnizacion === 'Anual' 
                ? "📌 En política ANUAL, al liquidar un colaborador se indemnizan únicamente los meses y días laborados en el año fiscal en curso (desde el 1 de enero)."
                : "📌 En política ACUMULADA, la indemnización se calcula acumulando la totalidad de los años y días servidos desde la fecha inicial de su contrato."
              }
            </small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {/* Zona de Logo */}
        <div>
          <label className="form-label">Logo de la Empresa</label>
          <div 
            style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: '0.5rem', 
              padding: '1.5rem', 
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.logo_base64 ? (
              <img src={formData.logo_base64} alt="Logo" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>
                <UploadCloud size={48} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '0.5rem' }} />
                <span>Haz clic para subir un logotipo</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            Recomendado: PNG o JPG transparente, máx 2MB.
          </p>
          
          {formData.logo_base64 && (
            <button 
              type="button" 
              onClick={() => setFormData({...formData, logo_base64: ''})} 
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Quitar Logo
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
