import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Building, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Layout.css';

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    try {
      const data = await api.getEmpresa();
      if (data) setEmpresa(data);
    } catch (err) {
      console.error("Error cargando empresa:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Trial Banner */}
      <div style={{
        background: 'linear-gradient(to right, #1e3a8a, #4c1d95)',
        color: 'white',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        zIndex: 50,
        position: 'relative'
      }}>
        <div>
          Tu prueba expira en <strong style={{ fontWeight: '700' }}>14 días</strong>. Agrega un método de pago para asegurar el servicio ininterrumpido.
        </div>
        <button style={{
          background: 'white',
          color: '#0f172a',
          border: 'none',
          padding: '0.35rem 1rem',
          borderRadius: '4px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}>
          Agregar Tarjeta
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building size={24} className="logo-icon" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>SaaS Planilla</span>
              {empresa && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                  {empresa.nombre}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/empleados" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Users size={20} />
            <span>Colaboradores</span>
          </NavLink>
          <NavLink to="/planillas" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <CreditCard size={20} />
            <span>Planillas</span>
          </NavLink>
          <NavLink to="/configuracion" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Settings size={20} />
            <span>Configuración</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 className="page-title" style={{ margin: 0 }}>
              {location.pathname === '/dashboard' || location.pathname === '/' ? 'Dashboard' : 
               location.pathname.startsWith('/empleados') ? 'Gestión de Colaboradores' : 
               location.pathname.startsWith('/planillas') ? 'Planillas' : 'Configuración'}
            </h2>
            
            {empresa && (
              <div style={{ 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', 
                color: 'white', 
                padding: '0.35rem 0.85rem', 
                borderRadius: '999px', 
                fontSize: '0.85rem', 
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}>
                <Building size={15} /> 🏢 Empresa: {empresa.nombre}
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
