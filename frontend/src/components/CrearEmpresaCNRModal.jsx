import React, { useState } from 'react';
import { X, Building, ShieldCheck, ExternalLink, Scale, FileText, CheckCircle2, Award, Info, Sparkles, Globe } from 'lucide-react';

export default function CrearEmpresaCNRModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('guia'); // 'guia' | 'portal_cnr'

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1040px',
        width: '100%',
        maxHeight: '94vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#0F172A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E293B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#D97706', padding: '0.55rem', borderRadius: '10px', display: 'flex' }}>
              <Scale size={24} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Ventanilla Única: Constitución & Registro de Empresas (CNR El Salvador)
                </h3>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#78350F', fontWeight: 'bold', padding: '0.15rem 0.6rem', borderRadius: '999px' }}>
                  OFICIAL CNR 🇸🇻
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Trámite de formalización legal en el Centro Nacional de Registros (creaempresa.cnr.gob.sv).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <button
            onClick={() => setActiveTab('guia')}
            style={{
              flex: 1,
              padding: '0.85rem',
              border: 'none',
              borderBottom: activeTab === 'guia' ? '3px solid #D97706' : '3px solid transparent',
              backgroundColor: activeTab === 'guia' ? 'white' : 'transparent',
              color: activeTab === 'guia' ? '#D97706' : '#64748B',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <FileText size={16} /> 📋 Pasos de Constitución Legal de Empresa
          </button>

          <button
            onClick={() => setActiveTab('portal_cnr')}
            style={{
              flex: 1,
              padding: '0.85rem',
              border: 'none',
              borderBottom: activeTab === 'portal_cnr' ? '3px solid #D97706' : '3px solid transparent',
              backgroundColor: activeTab === 'portal_cnr' ? 'white' : 'transparent',
              color: activeTab === 'portal_cnr' ? '#D97706' : '#64748B',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Globe size={16} /> 🏛️ Portal Interactivo CreaEmpresa CNR
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, backgroundColor: 'white' }}>
          
          {activeTab === 'guia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#FEF3C7', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #FDE68A', color: '#78350F' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={18} /> Formalización Legal de Sociedades y Comerciantes Individuales en El Salvador
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.45' }}>
                  A través del sistema <strong>CreaEmpresa CNR</strong> del Centro Nacional de Registros, constituyes legalmente tu sociedad (S.A. de C.V., S. de R.L.) o Comerciante Individual con inscripción en Hacienda, Registro de Comercio, ISSS y Ministerio de Trabajo.
                </p>
              </div>

              {/* Grid 4 Pasos Legales */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <h5 style={{ margin: '0 0 0.35rem 0', color: '#1E3A8A', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    1. Elaboración de Escritura de Constitución
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                    Redacción y protocolización de la Escritura de Constitución de Sociedad por Notario Salvadoreño con un capital social mínimo de $2,000.00 (mínimo de pago del 5% = $100.00).
                  </p>
                </div>

                <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <h5 style={{ margin: '0 0 0.35rem 0', color: '#15803D', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    2. Registro de Comercio (CNR)
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                    Inscripción de la Escritura de Sociedad, Registro de Matrícula de Comercio y depósito de Balance Inicial en el Registro de Comercio del CNR.
                  </p>
                </div>

                <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <h5 style={{ margin: '0 0 0.35rem 0', color: '#D97706', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    3. Obtención de NIT & NRC (Ministerio de Hacienda)
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                    Tramitación del Número de Identificación Tributaria (NIT) y Número de Registro de Contribuyente (NRC IVA) en la Dirección General de Impuestos Internos.
                  </p>
                </div>

                <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <h5 style={{ margin: '0 0 0.35rem 0', color: '#7C3AED', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    4. Inscripción Patronal ISSS, AFP & Trabajo
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                    Inscripción de la empresa como Patrono en el ISSS OIR, AFP Crecer/Confia y Registro del Establecimiento en el Ministerio de Trabajo.
                  </p>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button
                  onClick={() => window.open('https://creaempresa.cnr.gob.sv/ServiciosOL/creaEmpresa.htm', '_blank')}
                  style={{
                    padding: '0.75rem 1.75rem',
                    backgroundColor: '#D97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
                  }}
                >
                  <Globe size={18} /> Ir al Portal Oficial CreaEmpresa CNR (creaempresa.cnr.gob.sv/ServiciosOL/creaEmpresa.htm) <ExternalLink size={16} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'portal_cnr' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '520px', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={16} color="#16A34A" /> Enlace Oficial del Gobierno de El Salvador: <strong>creaempresa.cnr.gob.sv/ServiciosOL/creaEmpresa.htm</strong>
                </span>

                <a
                  href="https://creaempresa.cnr.gob.sv/ServiciosOL/creaEmpresa.htm"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Abrir en pestaña completa <ExternalLink size={12} />
                </a>
              </div>

              <iframe
                src="https://creaempresa.cnr.gob.sv/ServiciosOL/creaEmpresa.htm"
                title="CreaEmpresa CNR El Salvador"
                style={{ width: '100%', height: '100%', border: '1px solid #CBD5E1', borderRadius: '10px' }}
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1rem 1.75rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.55rem 1.35rem', backgroundColor: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.825rem', cursor: 'pointer' }}
          >
            Cerrar Ventanilla CNR
          </button>
        </div>

      </div>
    </div>
  );
}
