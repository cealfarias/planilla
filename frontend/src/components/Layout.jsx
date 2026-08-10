import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Building, CreditCard, ChevronLeft, ChevronRight, Menu, Crown, Sparkles, Headphones, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AdBanner from './AdBanner';
import InterstitialAdModal from './InterstitialAdModal';
import SoporteModal from './SoporteModal';
import AsesoriaLegalModal from './AsesoriaLegalModal';
import PasarelaPagoModal from './PasarelaPagoModal';
import './Layout.css';

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [empresa, setEmpresa] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const [licenciaTipo, setLicenciaTipo] = useState(() => {
    return localStorage.getItem('licencia_tipo') || 'freeware';
  });

  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showSoporteModal, setShowSoporteModal] = useState(false);
  const [showAsesoriaLegalModal, setShowAsesoriaLegalModal] = useState(false);
  const [showPasarelaModal, setShowPasarelaModal] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    fetchEmpresa();

    const handleLicenciaChange = () => {
      setLicenciaTipo(localStorage.getItem('licencia_tipo') || 'freeware');
    };
    window.addEventListener('licencia_change', handleLicenciaChange);
    return () => window.removeEventListener('licencia_change', handleLicenciaChange);
  }, []);

  // Interceptar navegación para mostrar anuncios intersticiales de transición en versión Freeware
  useEffect(() => {
    if (location.pathname !== prevPath) {
      setPrevPath(location.pathname);
      const currentLicencia = localStorage.getItem('licencia_tipo') || 'freeware';
      if (currentLicencia === 'freeware') {
        setShowInterstitial(true);
      }
    }
  }, [location.pathname, prevPath]);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const fetchEmpresa = async () => {
    try {
      const data = await api.getEmpresa();
      if (data) {
        setEmpresa(data);
        document.title = `${data.nombre} | SaaS Planilla El Salvador`;
      }
    } catch (err) {
      console.error("Error cargando empresa:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpgradeToPremium = () => {
    localStorage.setItem('licencia_tipo', 'premium');
    setLicenciaTipo('premium');
    window.dispatchEvent(new Event('licencia_change'));
  };

  const isPremium = licenciaTipo === 'premium';

  return (
    <div className="layout-container">
      {/* Modal de Anuncio Intersticial para versión Freeware */}
      <InterstitialAdModal
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        onUpgrade={handleUpgradeToPremium}
      />

      {/* Modal de Centro de Soporte Técnico e Inbox Interno */}
      <SoporteModal
        isOpen={showSoporteModal}
        onClose={() => setShowSoporteModal(false)}
      />

      {/* Modal de Asesoría Legal Laboral con Abogados Certificados CSJ */}
      <AsesoriaLegalModal
        isOpen={showAsesoriaLegalModal}
        onClose={() => setShowAsesoriaLegalModal(false)}
      />

      {/* Pasarela de Pago Interna (Transfer365 Davivienda 69893101 CesarArias) */}
      <PasarelaPagoModal
        isOpen={showPasarelaModal}
        onClose={() => setShowPasarelaModal(false)}
      />

      {/* Trial Banner */}
      <div style={{
        background: isPremium ? 'linear-gradient(to right, #0F172A, #1E1B4B)' : 'linear-gradient(to right, #1e3a8a, #4c1d95)',
        color: 'white',
        padding: '0.65rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        zIndex: 50,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isPremium ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', fontWeight: 'bold' }}>
              <Crown size={15} /> Licencia Pro Enterprise Activa (Cero Anuncios & Soporte 24/7)
            </span>
          ) : (
            <span>
              Licencia Actual: <strong style={{ fontWeight: '700', color: '#60A5FA' }}>Freeware Gratuita</strong> (Con Anuncios). Tu prueba Premium expira en <strong>14 días</strong>.
            </span>
          )}
        </div>
        
        {!isPremium && (
          <button 
            onClick={() => setShowPasarelaModal(true)}
            style={{
              background: 'white',
              color: '#0f172a',
              border: 'none',
              padding: '0.3rem 0.85rem',
              borderRadius: '4px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Crown size={13} color="#D97706" /> Quitar Anuncios / Pago ($29.99/mes)
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="sidebar-logo">
              <Building size={24} className="logo-icon" />
              <div className="hide-on-collapse" style={{ display: 'flex', flexDirection: 'column' }}>
                <span>SaaS Planilla</span>
                {empresa && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                    {empresa.nombre}
                  </span>
                )}
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={toggleSidebar} 
              className="btn-toggle-sidebar"
              title={collapsed ? "Expandir Menú" : "Minimizar Menú"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/dashboard" title="Dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <LayoutDashboard size={20} />
              <span className="hide-on-collapse">Dashboard</span>
            </NavLink>
            <NavLink to="/empleados" title="Colaboradores" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Users size={20} />
              <span className="hide-on-collapse">Colaboradores</span>
            </NavLink>
            <NavLink to="/planillas" title="Planillas" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <CreditCard size={20} />
              <span className="hide-on-collapse">Planillas</span>
            </NavLink>
            <NavLink to="/configuracion" title="Configuración" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Settings size={20} />
              <span className="hide-on-collapse">Configuración</span>
            </NavLink>
            <button
              type="button"
              onClick={() => setShowSoporteModal(true)}
              title="Soporte Técnico & Inbox Interno"
              className="nav-link"
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Headphones size={20} style={{ color: '#3B82F6' }} />
              <span className="hide-on-collapse">Soporte Técnico</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAsesoriaLegalModal(true)}
              title="Asesoría Legal Laboral (Abogados Certificados CSJ)"
              className="nav-link"
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Scale size={20} style={{ color: '#D97706' }} />
              <span className="hide-on-collapse" style={{ color: '#D97706', fontWeight: '600' }}>Asesoría Legal (CSJ)</span>
            </button>
          </nav>

          {!collapsed && !isPremium && (
            <div style={{ padding: '0 1rem' }}>
              <AdBanner type="sidebar" isPremium={isPremium} />
            </div>
          )}

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="avatar">{user?.username?.charAt(0).toUpperCase()}</div>
              <div className="user-details hide-on-collapse">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{isPremium ? 'Plan Pro Enterprise' : 'Plan Freeware'}</span>
              </div>
            </div>
            <button className="btn-logout hide-on-collapse" onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                type="button"
                onClick={toggleSidebar}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={collapsed ? "Expandir Menú Lateral" : "Minimizar Menú Lateral"}
              >
                <Menu size={18} />
              </button>

              <h2 className="page-title" style={{ margin: 0 }}>
                {location.pathname === '/dashboard' || location.pathname === '/' ? 'Dashboard' : 
                 location.pathname.startsWith('/empleados') ? 'Gestión de Colaboradores' : 
                 location.pathname.startsWith('/planillas') ? 'Planillas' : 'Configuración'}
              </h2>
              
              {empresa && (
                <div style={{ 
                  background: isPremium ? 'linear-gradient(135deg, #B45309 0%, #D97706 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', 
                  color: 'white', 
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '999px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  {isPremium ? <Crown size={15} /> : <Building size={15} />} 🏢 Empresa: {empresa.nombre}
                </div>
              )}
            </div>
          </header>
          <div className="content-area">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
