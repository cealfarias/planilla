import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Share2 } from 'lucide-react';
import './Login.css';

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empresa_nombre: '',
    empresa_nit: '',
    admin_username: '',
    admin_email: '',
    admin_password: '',
    aceptar_publicidad: false
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.registro(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shareText = "¡Acabo de registrar mi empresa en Planilla SaaS! Gestiona tus RRHH fácilmente.";
  const shareUrl = "https://planilla-l2y7.onrender.com"; // O la URL de tu frontend en producción
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card card" style={{ textAlign: 'center' }}>
          <div className="logo-placeholder" style={{ color: 'var(--accent)' }}>✅</div>
          <h2>¡Empresa Registrada!</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Tu espacio de trabajo ha sido creado con éxito. Redirigiendo al inicio de sesión...
          </p>
          
          <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Share2 size={18} /> ¡Invita a otros empresarios!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" 
                 style={{ padding: '0.5rem 1rem', background: '#25D366', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
                WhatsApp
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" 
                 style={{ padding: '0.5rem 1rem', background: '#0088cc', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <div className="logo-placeholder">🚀</div>
          <h2>Crear nueva Empresa</h2>
          <p className="text-muted">Ingresa los datos para crear tu espacio de trabajo</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Nombre Empresa</label>
              <input type="text" name="empresa_nombre" className="form-input" required value={formData.empresa_nombre} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">NIT</label>
              <input type="text" name="empresa_nit" className="form-input" required placeholder="0614-..." value={formData.empresa_nit} onChange={handleChange} />
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

          <div className="form-group">
            <label className="form-label">Usuario Administrador</label>
            <input type="text" name="admin_username" className="form-input" required value={formData.admin_username} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" name="admin_email" className="form-input" required value={formData.admin_email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" name="admin_password" className="form-input" required minLength={6} value={formData.admin_password} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" name="aceptar_publicidad" id="marketing" checked={formData.aceptar_publicidad} onChange={handleChange} />
            <label htmlFor="marketing" className="text-muted" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
              Acepto recibir correos con ofertas y novedades de la plataforma.
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creando espacio de trabajo...' : 'Registrar Empresa'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" className="text-muted" style={{ textDecoration: 'none' }}>
            ¿Ya tienes una cuenta? <strong>Inicia Sesión</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
