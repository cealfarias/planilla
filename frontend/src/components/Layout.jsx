import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building size={24} className="logo-icon" />
            <span>SaaS Planilla</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/empleados" className={`nav-link ${location.pathname === '/empleados' ? 'active' : ''}`}>
            <Users size={20} />
            <span>Empleados</span>
          </Link>
          <Link to="/configuracion" className={`nav-link ${location.pathname === '/configuracion' ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
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
        <header className="topbar">
          <h2 className="page-title">
            {location.pathname === '/' ? 'Dashboard' : 
             location.pathname === '/empleados' ? 'Gestión de Empleados' : 'Configuración'}
          </h2>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
