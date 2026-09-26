import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const LOADING_STEPS = [
  { title: "Verificando credenciales...", sub: "Iniciando protocolo de seguridad SSL 256-Bit" },
  { title: "Conectando con el Servidor...", sub: "Estableciendo sesión segura de alta velocidad" },
  { title: "Sincronizando expedientes de Planillas...", sub: "Cargando empleados, contratos y deducciones de ley" },
  { title: "¡Autenticación exitosa! Entrando al Dashboard...", sub: "Abriendo el portal principal de RRHH" }
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Si ya existe sesión, redirigir inmediatamente a /dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token || user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading) {
      setLoadingStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIdx(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(username, password);
      login({ username: username }, data.access_token);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Modal Interactivo de Acceso Exitoso / Carga */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.88)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: '#0d1527',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            padding: '2.5rem 2rem 1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.2)',
            textAlign: 'center',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Top Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: '0.35rem 1.1rem',
              fontSize: '0.78rem',
              color: '#94a3b8',
              fontWeight: '600',
              marginBottom: '2.25rem'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981'
              }} />
              <span>Servidor Render • Conexión Segura</span>
            </div>

            {/* Glowing Ring & Shield Icon with Orbiting Badge */}
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              margin: '0 auto 2.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                padding: '4px',
                background: 'conic-gradient(from 0deg, #a855f7, #6366f1, #10b981, #a855f7)',
                animation: 'spin 2.5s linear infinite',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #fff calc(100% - 3px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #fff calc(100% - 3px))'
              }} />

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.45)',
                position: 'relative',
                zIndex: 2
              }}>
                <ShieldCheck style={{ width: '34px', height: '34px', color: '#ffffff' }} />
              </div>

              {/* Orbiting Arrow Badge */}
              <div style={{
                position: 'absolute',
                right: '-2px',
                bottom: '12px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                border: '2px solid #0d1527',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                zIndex: 3
              }}>
                ↘
              </div>
            </div>

            {/* Dynamic Step Title and Subtitle */}
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '0.5rem',
              lineHeight: 1.3,
              letterSpacing: '-0.02em'
            }}>
              {LOADING_STEPS[loadingStepIdx].title}
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
              marginBottom: '2.25rem',
              lineHeight: 1.4
            }}>
              {LOADING_STEPS[loadingStepIdx].sub}
            </p>

            {/* Animated Glowing Progress Bar */}
            <div style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}>
              <div style={{
                height: '100%',
                width: `${((loadingStepIdx + 1) / LOADING_STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 50%, #10b981 100%)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease-in-out',
                boxShadow: '0 0 14px #6366f1'
              }} />
            </div>

            {/* Footer Line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1', fontWeight: '600' }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                Planillas & RRHH SaaS
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>v2.4 • Render Cloud</span>
            </div>
          </div>
        </div>
      )}

      <div className="login-wrapper">
        {/* Lado izquierdo (Solo visible en desktop) */}
        <div className="login-left">
          <div className="login-left-content">
            <h1>Administración Planilla de Sueldos</h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.5 }}>
              La solución definitiva para gestionar el recurso más valioso de tu empresa: tu gente.
            </p>
            <ul className="login-benefits">
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <span>Gestión centralizada de empleados activos e inactivos</span>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <span>Cálculo automático de planillas y retenciones legales (ISSS, AFP, ISR)</span>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <span>Emisión de boletas de pago y archivos oficiales en 1-clic</span>
              </li>
              <li className="benefit-item">
                <div className="benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <span>Cumplimiento estricto del Código de Trabajo de El Salvador</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lado derecho (Formulario) */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-placeholder">🏢</div>
              <h2>Bienvenido</h2>
              <p className="text-muted">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="login-error">{error}</div>}
              
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: admin_planilla"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required 
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem' }}>
                Iniciar Sesión
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                <hr style={{ flex: 1, borderTop: '1px solid #e2e8f0', margin: 0 }} />
                <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.875rem' }}>O continuar con</span>
                <hr style={{ flex: 1, borderTop: '1px solid #e2e8f0', margin: 0 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '44px' }}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setLoading(true);
                      setError(null);
                      const data = await api.loginWithGoogle(credentialResponse.credential);
                      login({ username: data.username, email: data.email }, data.access_token);
                      setTimeout(() => {
                        navigate('/dashboard', { replace: true });
                      }, 2000);
                    } catch (err) {
                      setError(err.message || 'Falló la autenticación con Google');
                      setLoading(false);
                    }
                  }}
                  onError={() => {
                    setError('Falló la autenticación con Google');
                  }}
                  theme="outline"
                  size="large"
                  width="350"
                  text="continue_with"
                  locale="es"
                  shape="rectangular"
                />
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <Link to="/registro" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                ¿Administras tus propios empleados? <br/><strong style={{ color: 'var(--primary)', display: 'inline-block', marginTop: '0.5rem' }}>Registra tu Empresa aquí</strong>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
