import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      right: '1rem',
      maxWidth: '450px',
      margin: '0 auto',
      background: '#0f172a',
      color: 'white',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      zIndex: 9999,
      border: '1px solid #1e293b'
    }}>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
        Este sitio utiliza cookies y tecnologías de seguimiento. Puedes aceptarlas para mejorar tu experiencia o ajustar tus configuraciones.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setShow(false)}
          style={{ background: 'transparent', color: '#cbd5e1', border: '1px solid #334155', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', cursor: 'pointer' }}>
          Denegar
        </button>
        <button 
          onClick={handleAccept}
          style={{ background: 'white', color: '#0f172a', border: 'none', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
          Aceptar Todo
        </button>
      </div>
    </div>
  );
}
