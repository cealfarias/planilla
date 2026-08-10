import React from 'react';
import { 
  X, Grid, Scale, BookOpen, Building2, CreditCard, PackageCheck, 
  Zap, Landmark, Trophy, ExternalLink, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function EcosistemaAppsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const aplicaciones = [
    {
      id: 'planilla',
      nombre: 'SaaS Planilla & RRHH El Salvador',
      categoria: 'Recursos Humanos & Nómina',
      icono: <CreditCard size={28} color="#3B82F6" />,
      gradiente: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
      descripcion: 'Cálculos de nómina, ISSS, AFP, ISR, Aguinaldos y Vacaciones con estricto apego al Código de Trabajo de El Salvador.',
      estado: 'ACTIVO',
      estadoColor: '#16A34A',
      destacado: true
    },
    {
      id: 'legaltech',
      nombre: 'Legal Tech El Salvador',
      categoria: 'Derecho & Gestión Jurídica',
      icono: <Scale size={28} color="#F59E0B" />,
      gradiente: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)',
      descripcion: 'Plataforma integral para abogados y despachos jurídicos: gestión de expedientes laborales, contratos inteligentes y litigios.',
      estado: 'EN LANZAMIENTO',
      estadoColor: '#D97706'
    },
    {
      id: 'contabilidad',
      nombre: 'Contabilidad General & Financiera',
      categoria: 'Finanzas & Libros IVA',
      icono: <BookOpen size={28} color="#10B981" />,
      gradiente: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
      descripcion: 'Catálogo de cuentas normado por NIIF PYMES, partidas automáticas por doble entrada, estados financieros y libros de IVA.',
      estado: 'PRÓXIMAMENTE',
      estadoColor: '#3B82F6'
    },
    {
      id: 'activo_fijo',
      nombre: 'Gestión de Activo Fijo',
      categoria: 'Patrimonio & Auditoría',
      icono: <Building2 size={28} color="#8B5CF6" />,
      gradiente: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)',
      descripcion: 'Control detallado de bienes, cálculo automático de depreciaciones fiscales y financieras, revalúos y códigos QR.',
      estado: 'PRÓXIMAMENTE',
      estadoColor: '#8B5CF6'
    },
    {
      id: 'facturacion_inventarios',
      nombre: 'Facturación & Control de Inventarios',
      categoria: 'Comercio & Puntos de Venta',
      icono: <PackageCheck size={28} color="#EC4899" />,
      gradiente: 'linear-gradient(135deg, #831843 0%, #EC4899 100%)',
      descripcion: 'Punto de venta (POS), kárdex físico y valorado, gestión de proveedores, cotizaciones y control de existencias.',
      estado: 'PRÓXIMAMENTE',
      estadoColor: '#EC4899'
    },
    {
      id: 'dte_facturacion',
      nombre: 'Facturación Electrónica DTE (MH)',
      categoria: 'Tributación & Hacienda',
      icono: <Zap size={28} color="#EF4444" />,
      gradiente: 'linear-gradient(135deg, #7F1D1D 0%, #EF4444 100%)',
      descripcion: 'Emisión y firma electrónica de Documentos Tributarios Electrónicos (DTE) integrados directamente con el Ministerio de Hacienda.',
      estado: 'EN DESARROLLO',
      estadoColor: '#EF4444'
    },
    {
      id: 'cooperativas',
      nombre: 'Administración de Cooperativas de Ahorro y Crédito',
      categoria: 'Sector Financiero & Coops',
      icono: <Landmark size={28} color="#14B8A6" />,
      gradiente: 'linear-gradient(135deg, #134E4A 0%, #14B8A6 100%)',
      descripcion: 'Gestión completa de asociados, cuentas de aportaciones, depósitos a plazo fijo, cartera de créditos y cálculo de intereses.',
      estado: 'PRÓXIMAMENTE',
      estadoColor: '#14B8A6'
    },
    {
      id: 'ajedrez_cerebral',
      nombre: 'Ajedrez Mental & Foco Cerebral',
      categoria: 'Neuro-Entrenamiento & Concentración',
      icono: <Trophy size={28} color="#FBBF24" />,
      gradiente: 'linear-gradient(135deg, #312E81 0%, #6366F1 100%)',
      descripcion: 'Plataforma cognitiva táctica basada en el ajedrez para potenciar la agilidad mental, toma de decisiones y concentración ejecutiva.',
      estado: 'PRÓXIMAMENTE',
      estadoColor: '#6366F1'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        maxWidth: '1080px',
        width: '100%',
        maxHeight: '92vh',
        backgroundColor: '#0F172A',
        color: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #1E293B'
      }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 2rem',
          backgroundColor: '#1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#2563EB', padding: '0.55rem', borderRadius: '10px', display: 'flex' }}>
              <Grid size={24} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                  Ecosistema de Aplicaciones & Soluciones SaaS
                </h3>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#78350F', fontWeight: 'bold', padding: '0.15rem 0.6rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Sparkles size={11} /> SUITE EMPRESARIAL
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Explora el conjunto completo de herramientas tecnológicas desarrolladas para empresas en El Salvador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body: Grid de Tarjetas de Aplicaciones */}
        <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1, backgroundColor: '#0F172A' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {aplicaciones.map((app) => (
              <div
                key={app.id}
                style={{
                  backgroundColor: '#1E293B',
                  borderRadius: '14px',
                  padding: '1.35rem',
                  border: app.destacado ? '2px solid #3B82F6' : '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: app.destacado ? '0 10px 25px -5px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Fondo sutil de gradiente */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: app.gradiente
                }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div style={{ padding: '0.6rem', borderRadius: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', display: 'flex' }}>
                      {app.icono}
                    </div>
                    
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      backgroundColor: app.destacado ? '#DCFCE7' : '#334155',
                      color: app.destacado ? '#15803D' : '#CBD5E1',
                      border: `1px solid ${app.estadoColor}`
                    }}>
                      {app.estado}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {app.categoria}
                  </span>

                  <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>
                    {app.nombre}
                  </h4>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                    {app.descripcion}
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {app.destacado ? (
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={15} /> Aplicación Actual en Uso
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Próxima Web Oficial
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (!app.destacado) {
                        alert(`🚀 La aplicación "${app.nombre}" estará disponible en su propio sitio web oficial muy pronto. ¡Mantente atento a nuestros lanzamientos!`);
                      }
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      border: 'none',
                      backgroundColor: app.destacado ? '#2563EB' : '#334155',
                      color: 'white',
                      cursor: app.destacado ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {app.destacado ? 'En Sesión' : 'Ver Avance'} <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Footer Banner */}
        <div style={{
          padding: '0.85rem 2rem',
          backgroundColor: '#1E293B',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#94A3B8'
        }}>
          <span>💡 <strong>Ecosistema SaaS Salvador:</strong> Todas las aplicaciones comparten la misma infraestructura de seguridad y soporte.</span>
          <button
            onClick={onClose}
            style={{ padding: '0.4rem 1rem', backgroundColor: '#0F172A', color: 'white', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.78rem' }}
          >
            Cerrar Ecosistema
          </button>
        </div>

      </div>
    </div>
  );
}
