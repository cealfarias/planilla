import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, FileText, Scale, Zap, Shield, Sparkles, 
  ArrowRight, CheckCircle2, Lock, UserPlus, LogIn, Laptop, Globe, 
  ChevronRight, Award, BarChart3, HelpCircle, Layers, Grid, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'registro'

  const appsEcosistema = [
    {
      id: 'planilla',
      nombre: 'SaaS Planilla & RRHH',
      badge: 'POPULAR & OPERATIVO',
      badgeColor: '#16A34A',
      descripcion: 'Gestión de nóminas, cálculo automático de ISSS OIR, AFP Crecer/Confia, retenciones ISR y Finiquitos Art. 58 C.T.',
      icon: <Users size={28} color="#2563EB" />,
      url: 'https://planilla.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)'
    },
    {
      id: 'contabilidad',
      nombre: 'Contabilidad General NIIF',
      badge: 'INTEGRADO',
      badgeColor: '#2563EB',
      descripcion: 'Libros de compras/ventas IVA, partidas contables por doble entrada, balances de comprobación y estado de resultados.',
      icon: <BarChart3 size={28} color="#059669" />,
      url: 'https://contabilidad.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)'
    },
    {
      id: 'legal',
      nombre: 'Legal Tech El Salvador (CSJ)',
      badge: 'CERTIFICADO',
      badgeColor: '#D97706',
      descripcion: 'Asesoría legal laboral en vivo con abogados certificados CSJ, elaboración de contratos de trabajo y minutas legales.',
      icon: <Scale size={28} color="#D97706" />,
      url: 'https://legal.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)'
    },
    {
      id: 'dte',
      nombre: 'DTE Facturación Electrónica MH',
      badge: 'OFICIAL MH',
      badgeColor: '#7C3AED',
      descripcion: 'Emisión directa de Comprobantes de Crédito Fiscal (CCF), Facturas de Consumidor Final y Notas de Crédito firmadas.',
      icon: <Zap size={28} color="#7C3AED" />,
      url: 'https://dte.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)'
    },
    {
      id: 'activofijo',
      nombre: 'Gestión de Activos Fijos',
      badge: 'EMPRESARIAL',
      badgeColor: '#0284C7',
      descripcion: 'Control físico de bienes, depreciaciones acumuladas mensuales, etiquetas de código de barras y resguardos.',
      icon: <Building2 size={28} color="#0284C7" />,
      url: 'https://activofijo.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 100%)'
    },
    {
      id: 'inventario',
      nombre: 'Facturación e Inventarios (POS)',
      badge: 'PUNTO DE VENTA',
      badgeColor: '#EA580C',
      descripcion: 'Control de existencias Kardex, punto de venta multicaja, catálogo de productos y alertas de stock mínimo.',
      icon: <Layers size={28} color="#EA580C" />,
      url: 'https://inventario.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)'
    },
    {
      id: 'cooperativas',
      nombre: 'Administración de Cooperativas',
      badge: 'FINANCIERO',
      badgeColor: '#475569',
      descripcion: 'Gestión de asociados en cooperativas de ahorro y crédito, aportaciones mensuales, préstamos e intereses.',
      icon: <CreditCard size={28} color="#475569" />,
      url: 'https://cooperativas.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #1E293B 0%, #475569 100%)'
    },
    {
      id: 'ajedrez',
      nombre: 'Ajedrez & Entrenamiento Cerebral',
      badge: 'NEURO-PRODUCTIVIDAD',
      badgeColor: '#DC2626',
      descripcion: 'Ejercicios de concentración estratégica, análisis táctico de jugadas y agilidad mental para ejecutivos y líderes.',
      icon: <Award size={28} color="#DC2626" />,
      url: 'https://ajedrez.demiempresa.online',
      internalRoute: '/dashboard',
      gradient: 'linear-gradient(135deg, #7F1D1D 0%, #EF4444 100%)'
    }
  ];

  const handleEntrarApp = (app) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      navigate(app.internalRoute);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* TOP HEADER PORTAL */}
      <header style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid #1E293B',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ backgroundColor: '#2563EB', padding: '0.65rem', borderRadius: '12px', display: 'flex', boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)' }}>
            <Globe size={26} color="white" />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 'bold', letterSpacing: '-0.5px', color: 'white' }}>
              demiempresa<span style={{ color: '#60A5FA' }}>.online</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.725rem', color: '#94A3B8', fontWeight: '500' }}>
              La Suite Empresarial Integrada de El Salvador
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#E2E8F0', backgroundColor: '#1E293B', padding: '0.4rem 0.85rem', borderRadius: '999px', border: '1px solid #334155' }}>
                👤 <strong>{user.username}</strong> (Cuenta Única SSO Activa)
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Ir a Dashboard
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setAuthMode('login'); navigate('/login'); }}
                style={{ padding: '0.55rem 1.25rem', backgroundColor: 'transparent', color: '#E2E8F0', border: '1px solid #475569', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogIn size={16} /> Iniciar Sesión
              </button>
              <button
                onClick={() => { setAuthMode('registro'); navigate('/registro'); }}
                style={{ padding: '0.55rem 1.35rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
              >
                <UserPlus size={16} /> Crear Cuenta Única (SSO)
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, #1E3A8A 0%, #0F172A 70%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)', padding: '0.35rem 1rem', borderRadius: '999px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            🇸🇻 LA SUITE DIGITAL INTEGRADA PARA EMPRESAS EN EL SALVADOR
          </span>

          <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '1.25rem 0 1rem 0', lineHeight: '1.15', color: 'white' }}>
            Un Solo Usuario para Controlar <br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Todas las Aplicaciones de Tu Negocio
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94A3B8', maxWidth: '720px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
            Accede de forma unificada a las 8 plataformas empresariales clave: Nóminas y RRHH, Contabilidad NIIF, Facturación Electrónica DTE, Legal Tech y Gestión de Activos.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/registro')}
              style={{
                padding: '0.85rem 2rem',
                backgroundColor: '#16A34A',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.5)'
              }}
            >
              🚀 Comenzar Gratis Ahora <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* SHOWCASE GRID DE LAS 8 APLICACIONES */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>
            Las 8 Aplicaciones del Ecosistema demiempresa.online
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Regístrate una sola vez y navega libremente entre todos los módulos corporativos:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {appsEcosistema.map(app => (
            <div
              key={app.id}
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ backgroundColor: '#0F172A', padding: '0.75rem', borderRadius: '12px', border: '1px solid #334155' }}>
                    {app.icon}
                  </div>
                  <span style={{ fontSize: '0.65rem', backgroundColor: app.badgeColor, color: 'white', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold' }}>
                    {app.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>
                  {app.nombre}
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: '1.5', margin: 0 }}>
                  {app.descripcion}
                </p>
              </div>

              <div style={{ marginTop: '1.75rem', pt: '1rem', borderTop: '1px solid #334155' }}>
                <button
                  onClick={() => handleEntrarApp(app)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: app.gradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  Entrar a {app.nombre.split(' ')[0]} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#090D16', borderTop: '1px solid #1E293B', padding: '2.5rem 2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>
          © 2026 <strong>demiempresa.online</strong> • Plataforma SaaS Empresarial de El Salvador. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
