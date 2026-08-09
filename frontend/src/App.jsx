import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import NuevoEmpleado from './pages/NuevoEmpleado';
import Planillas from './pages/Planillas';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import CookieBanner from './components/CookieBanner';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1234567890-mockclientid.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CookieBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      
      {/* Rutas protegidas que usarán el Layout con Sidebar */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/empleados/nuevo" element={<NuevoEmpleado />} />
        <Route path="/planillas" element={<Planillas />} />
        <Route path="/configuracion" element={<div className="card">Módulo de Configuración</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
