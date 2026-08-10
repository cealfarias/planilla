import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function AdBanner({ type = 'leaderboard', isPremium = false }) {
  if (isPremium) return null;

  if (type === 'leaderboard') {
    return (
      <div style={{
        margin: '1rem 0',
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        border: '1px dashed #93C5FD',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '0.65rem',
            background: '#2563EB',
            color: 'white',
            padding: '0.15rem 0.4rem',
            borderRadius: '3px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            ANUNCIO GOOGLE ADSENSE
          </span>
          <div style={{ fontSize: '0.85rem', color: '#1E40AF', fontWeight: '500' }}>
            🚀 <strong>Servicios Contables & Asesoría Fiscal en El Salvador:</strong> Auditorías, declaraciones de IVA y Pago a Cuenta con 20% desc.
          </div>
        </div>

        <a
          href="https://adsense.google.com"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '0.75rem',
            color: '#1D4ED8',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            textDecoration: 'none',
            background: 'white',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #BFDBFE'
          }}
        >
          Saber más <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div style={{
        padding: '1rem',
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: '8px',
        margin: '1rem 0',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '0.6rem', color: '#D97706', fontWeight: 'bold', textTransform: 'uppercase' }}>Patrocinador Oficial</span>
        <h4 style={{ margin: '0.35rem 0', fontSize: '0.9rem', color: '#92400E' }}>Firma Digital & Sellos de Agua</h4>
        <p style={{ fontSize: '0.75rem', color: '#B45309', margin: '0 0 0.75rem 0' }}>Firma tus boletas de pago electrónicamente con validez legal.</p>
        <button style={{
          background: '#D97706',
          color: 'white',
          border: 'none',
          padding: '0.35rem 0.75rem',
          fontSize: '0.75rem',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Probar Gratis
        </button>
      </div>
    );
  }

  return null;
}
