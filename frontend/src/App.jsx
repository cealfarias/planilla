import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import NuevoEmpleado from './pages/NuevoEmpleado';
import Planillas from './pages/Planillas';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
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
  );
}

export default App;
