import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Briefcase, DollarSign, CheckCircle2, ShieldAlert, 
  Crown, Sparkles, Award, FileText, Zap, ExternalLink, ShieldCheck, ArrowUpRight, Scale
} from 'lucide-react';
import { api } from '../services/api';
import AdBanner from '../components/AdBanner';
import AsesoriaLegalModal from '../components/AsesoriaLegalModal';
import PasarelaPagoModal from '../components/PasarelaPagoModal';
import './Dashboard.css';

export default function Dashboard() {
  const [empresa, setEmpresa] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [planillas, setPlanillas] = useState([]);
  const [licenciaTipo, setLicenciaTipo] = useState(() => {
    return localStorage.getItem('licencia_tipo') || 'freeware';
  });
  const [loading, setLoading] = useState(true);
  const [showAsesoriaModal, setShowAsesoriaModal] = useState(false);
  const [showPasarelaModal, setShowPasarelaModal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [empData, empList, planList] = await Promise.all([
        api.getEmpresa().catch(() => null),
        api.getEmpleados().catch(() => []),
        api.getPlanillas().catch(() => [])
      ]);
      setEmpresa(empData);
      setEmpleados(empList || []);
      setPlanillas(planList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cambiarLicencia = (nuevaLicencia) => {
    setLicenciaTipo(nuevaLicencia);
    localStorage.setItem('licencia_tipo', nuevaLicencia);
    // Disparar evento para que Layout actualice el estado global si es necesario
    window.dispatchEvent(new Event('licencia_change'));
  };

  const isPremium = licenciaTipo === 'premium';
  const empleadosActivos = empleados.filter(e => e.estado === 'Activo' || !e.estado).length;
  const ultimaPlanilla = planillas[0];

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* WELCOME BANNER & ACTIVE LICENSE CARD */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        background: isPremium 
          ? 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)' 
          : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                ¡Bienvenido, {empresa?.nombre || 'Administrador'}!
              </h2>
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: isPremium ? '#F59E0B' : '#3B82F6',
                color: isPremium ? '#78350F' : 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                {isPremium ? <Crown size={13} /> : <Sparkles size={13} />}
                {isPremium ? 'LICENCIA PRO ENTERPRISE (SIN ANUNCIOS)' : 'LICENCIA FREEWARE (VERSIÓN GRATUITA)'}
              </span>
            </div>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>
              Plataforma Integral de Gestión de Nóminas y Recursos Humanos de El Salvador.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isPremium ? (
              <button
                onClick={() => setShowPasarelaModal(true)}
                style={{
                  backgroundColor: '#16A34A',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
                }}
              >
                <Crown size={16} /> Pagar & Actualizar a Premium ($29.99/mes)
              </button>
            ) : (
              <button
                onClick={() => cambiarLicencia('freeware')}
                style={{
                  backgroundColor: '#334155',
                  color: '#CBD5E1',
                  border: '1px solid #475569',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Simular Modo Freeware
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="metrics-grid">
        <div className="metric-card card">
          <div className="metric-icon bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Empleados Activos</span>
            <span className="metric-value">{empleadosActivos}</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon bg-green-100 text-green-600">
            <Building2 size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Planillas Procesadas</span>
            <span className="metric-value">{planillas.length}</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon bg-purple-100 text-purple-600">
            <Briefcase size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Estado del Sistema</span>
            <span className="metric-value" style={{ fontSize: '1rem', color: '#16A34A', fontWeight: 'bold' }}>100% Operativo</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon bg-yellow-100 text-yellow-600">
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Última Nómina</span>
            <span className="metric-value">
              {ultimaPlanilla ? `$${(ultimaPlanilla.total_liquido || 0).toFixed(2)}` : '$0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* BANNER ADSENSE SI ES FREEWARE */}
      {!isPremium && <AdBanner type="leaderboard" isPremium={isPremium} />}

      {/* INFORMACIÓN RELEVANTE & VENTAJAS COMPETITIVAS */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Zap size={22} className="text-blue-600" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
            Ventajas Clave y Características del Sistema SaaS
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563EB', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} /> Cumplimiento Laboral El Salvador
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.45' }}>
              Aplica rigurosamente las tablas vigentes del <strong>Código de Trabajo (C.T.)</strong>: ISR con tramos legales, ISSS (3.00%), AFP (7.25%), límite de deducción del 20% en préstamos (Art. 136 C.T.) y exención de $730.00 en Aguinaldos (Art. 202 C.T.).
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <Award size={18} /> Múltiples Modalidades de Nómina
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.45' }}>
              Genera y recalcula en un solo clic planillas **Quincenales, Mensuales, Vacaciones (30% recargo ley Art. 177), Aguinaldos anuales (Art. 196-198)** y cálculo automático de **Liquidaciones por Despido o Renuncia**.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9333EA', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <FileText size={18} /> Reportes PDF & Notificaciones Omicanal
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.45' }}>
              Exportación instantánea de Boletas de Pago individuales y Reportes Consolidados en PDF con firma de recibido, notificaciones directas por **WhatsApp** y envío por correo electrónico.
            </p>
          </div>
        </div>

        {/* BANNER DESTACADO DE ASESORÍA LEGAL LABORAL CON ABOGADOS CSJ */}
        <div style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1px solid #F59E0B',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#D97706', padding: '0.6rem', borderRadius: '8px', display: 'flex', color: 'white' }}>
              <Scale size={26} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#78350F', fontSize: '1.05rem', fontWeight: 'bold' }}>
                ⚖️ Asesoría Legal Laboral & Servicios Jurídicos (Abogados Certificados CSJ)
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#92400E' }}>
                Defensa en inspecciones del MTPS, dictámenes expresos y patrocinios laborales por abogados autorizados en El Salvador.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAsesoriaModal(true)}
            style={{
              backgroundColor: '#B45309',
              color: 'white',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)'
            }}
          >
            <Scale size={16} /> Consultar Honorarios & Servicios Legales
          </button>
        </div>

        <AsesoriaLegalModal
          isOpen={showAsesoriaModal}
          onClose={() => setShowAsesoriaModal(false)}
        />
      </div>

      {/* SECCIÓN DE COMPARACIÓN DE LICENCIAS & PLANES DISPONIBLES */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1E40AF', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Planes de Suscripción Disponibles
          </span>
          <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.35rem', color: 'var(--text-main)' }}>
            Elige la Licencia que Mejor se Adapte a tu Empresa
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Licencia activa actual de tu organización: <strong style={{ color: isPremium ? '#D97706' : '#2563EB' }}>{isPremium ? 'PRO ENTERPRISE' : 'FREEWARE (GRATUITA)'}</strong>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* TARJETA PLAN FREEWARE */}
          <div style={{
            border: isPremium ? '1px solid #E2E8F0' : '2px solid #3B82F6',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: isPremium ? '#FAFAFA' : '#F0F9FF',
            position: 'relative'
          }}>
            {!isPremium && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                backgroundColor: '#3B82F6',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px'
              }}>
                PLAN ACTUAL
              </span>
            )}
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1E293B' }}>Freeware / Estándar</h4>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0F172A', margin: '0.5rem 0' }}>
              $0.00 <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 'normal' }}>/ para siempre</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>Ideal para pequeñas empresas o negocios en etapa inicial.</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#3B82F6" /> Procesamiento completo de planillas y boletas
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#3B82F6" /> Notificaciones WhatsApp y Correo
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
                <ShieldAlert size={16} color="#F59E0B" /> Incluye anuncios publicitarios (Google AdSense)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
                <ShieldAlert size={16} color="#F59E0B" /> Transiciones con anuncios intersticiales
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
                <ShieldAlert size={16} color="#F59E0B" /> Boletas PDF con marca de agua freeware
              </li>
            </ul>

            {!isPremium ? (
              <button disabled style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #93C5FD', backgroundColor: '#DBEAFE', color: '#1E40AF', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Licencia Activa
              </button>
            ) : (
              <button onClick={() => cambiarLicencia('freeware')} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>
                Cambiar a Freeware
              </button>
            )}
          </div>

          {/* TARJETA PLAN PRO ENTERPRISE */}
          <div style={{
            border: isPremium ? '2px solid #F59E0B' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: isPremium ? '#FEFCE8' : 'white',
            boxShadow: isPremium ? '0 8px 25px rgba(245, 158, 11, 0.15)' : 'none',
            position: 'relative'
          }}>
            {isPremium && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                backgroundColor: '#F59E0B',
                color: '#78350F',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px'
              }}>
                PLAN ACTUAL
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B45309' }}>
              <Crown size={20} />
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#92400E' }}>Pro Enterprise / Premium</h4>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#78350F', margin: '0.5rem 0' }}>
              $29.99 <span style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 'normal' }}>/ mes</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#B45309', marginBottom: '1rem' }}>Para empresas que exigen máxima eficiencia y cero distracciones.</p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350F', fontWeight: '500' }}>
                <CheckCircle2 size={16} color="#16A34A" /> <strong>CERO Anuncios ni Banners publicitarios</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350F', fontWeight: '500' }}>
                <CheckCircle2 size={16} color="#16A34A" /> <strong>Boletas PDF sin marca de agua y logo personalizado</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350F' }}>
                <CheckCircle2 size={16} color="#16A34A" /> Colaboradores e historial ilimitado
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350F' }}>
                <CheckCircle2 size={16} color="#16A34A" /> Firma electrónica avanzada de boletas
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350F' }}>
                <CheckCircle2 size={16} color="#16A34A" /> Soporte legal y técnico prioritario 24/7
              </li>
            </ul>

            {isPremium ? (
              <button disabled style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: 'none', backgroundColor: '#F59E0B', color: '#78350F', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Licencia Premium Activa
              </button>
            ) : (
              <button onClick={() => setShowPasarelaModal(true)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: 'none', backgroundColor: '#16A34A', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
                Pagar & Activar Licencia Pro Enterprise ($29.99)
              </button>
            )}
          </div>

        </div>
      </div>

      <PasarelaPagoModal
        isOpen={showPasarelaModal}
        onClose={() => setShowPasarelaModal(false)}
      />

    </div>
  );
}
