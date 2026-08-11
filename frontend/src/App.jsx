import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import NuevoEmpleado from './pages/NuevoEmpleado';
import Planillas from './pages/Planillas';
import Configuracion from './pages/Configuracion';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import CookieBanner from './components/CookieBanner';

import { GoogleOAuthProvider } from '@react-oauth/google';

import LandingPortal from './pages/LandingPortal';
import AsesoriaCreacionEmpresa from './pages/AsesoriaCreacionEmpresa';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "564147336188-a3jci35rfq609v8d7sbopsd3aeuec93c.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CookieBanner />
      <Routes>
        <Route path="/portal" element={<LandingPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      
      {/* Rutas protegidas que usarán el Layout con Sidebar */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/empleados/nuevo" element={<NuevoEmpleado />} />
        <Route path="/planillas" element={<Planillas />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/crear-empresa" element={<AsesoriaCreacionEmpresa />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
