import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InterstitialAdModal({ isOpen, onClose, onUpgrade }) {
  const [counter, setCounter] = useState(3);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCounter(3);
      setCanClose(false);
      const timer = setInterval(() => {
        setCounter(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header Bar */}
        <div style={{
          backgroundColor: '#0F172A',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Publicidad Freeware (Transición de Página)
          </span>

          {canClose ? (
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              Continuar a la aplicación <ArrowRight size={14} />
            </button>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#CBD5E1', backgroundColor: '#334155', padding: '0.25rem 0.65rem', borderRadius: '4px' }}>
              El anuncio se puede cerrar en <strong>{counter}s</strong>...
            </span>
          )}
        </div>

        {/* Ad Body Content */}
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={32} color="white" />
          </div>

          <span style={{
            fontSize: '0.7rem',
            background: '#F59E0B',
            color: '#78350F',
            fontWeight: 'bold',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            textTransform: 'uppercase'
          }}>
            Patrocinador Oficial
          </span>

          <h3 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '1.4rem', color: '#F8FAFC' }}>
            ¡Pásate a la Licencia Pro Enterprise!
          </h3>

          <p style={{ margin: '0 0 1.25rem 0', color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Estás usando la versión <strong>Freeware Gratuita</strong> con anuncios de patrocinadores y marca de agua. Actualiza a la versión Premium para disfrutar de una experiencia limpia y profesional.
          </p>

          <div style={{
            backgroundColor: '#0F172A',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'left',
            marginBottom: '1.5rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#E2E8F0' }}>
              <CheckCircle2 size={16} color="#22C55E" /> <strong>Eliminación del 100% de Anuncios y Banners</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#E2E8F0' }}>
              <CheckCircle2 size={16} color="#22C55E" /> <strong>PDFs de Boletas sin Marca de Agua</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#E2E8F0' }}>
              <CheckCircle2 size={16} color="#22C55E" /> <strong>Colaboradores Ilimitados & Soporte 24/7</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              style={{
                backgroundColor: '#16A34A',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
              }}
            >
              <Shield size={18} /> Actualizar a Premium ($29.99/mes)
            </button>

            {canClose && (
              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  border: '1px solid #475569',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar Anuncio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
