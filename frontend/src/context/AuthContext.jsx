import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

// Tiempo límite de inactividad: 15 minutos (900,000 ms)
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Solo activar si hay un usuario autenticado
    const token = localStorage.getItem('token');
    if (token) {
      timerRef.current = setTimeout(() => {
        alert("⚠️ Su sesión ha sido suspendida automáticamente por 15 minutos de inactividad por razones de seguridad.");
        logout();
      }, INACTIVITY_LIMIT_MS);
    }
  };

  useEffect(() => {
    // Verificar si existe token al cargar la app
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ username: 'admin_planilla' });
      resetInactivityTimer();
    }
    setLoading(false);

    // Eventos para detectar actividad del usuario
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        resetInactivityTimer();
      }
    };

    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    resetInactivityTimer();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
