import React from 'react';
import { Users, Building2, Briefcase, DollarSign } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="welcome-banner card">
        <h3>¡Bienvenido al Panel de Administración!</h3>
        <p className="text-muted">Aquí tienes un resumen de la actividad de tu empresa.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card card">
          <div className="metric-icon bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Empleados Activos</span>
            <span className="metric-value">0</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon bg-green-100 text-green-600">
            <Building2 size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Departamentos</span>
            <span className="metric-value">0</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon bg-purple-100 text-purple-600">
            <Briefcase size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Cargos Registrados</span>
            <span className="metric-value">0</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon bg-yellow-100 text-yellow-600">
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Última Planilla</span>
            <span className="metric-value">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
