import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Users, Plus, DollarSign } from 'lucide-react';
import ContratarModal from '../components/ContratarModal';
import FinanzasModal from '../components/FinanzasModal';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contratarEmpleado, setContratarEmpleado] = useState(null);
  const [finanzasEmpleado, setFinanzasEmpleado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const data = await api.getEmpleados();
        setEmpleados(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="text-blue-600" />
            Directorio de Empleados
          </h3>
          <p className="text-muted">Gestiona el personal activo de la empresa.</p>
        </div>
        <button onClick={() => navigate('/empleados/nuevo')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nuevo Empleado
        </button>
      </div>
      
      {error && <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>Código</th>
              <th style={{ padding: '1rem 0.5rem' }}>Nombre Completo</th>
              <th style={{ padding: '1rem 0.5rem' }}>Cargo</th>
              <th style={{ padding: '1rem 0.5rem' }}>Salario Base</th>
              <th style={{ padding: '1rem 0.5rem' }}>Estado</th>
              <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</td></tr>
            ) : empleados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={32} style={{ opacity: 0.5 }} />
                    <p>No hay empleados registrados en esta empresa.</p>
                  </div>
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{emp.codigo_empleado}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{emp.primer_nombre} {emp.primer_apellido}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    {emp.contratos?.find(c => c.es_activo)?.cargo || 'Sin Asignar'}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    ${(emp.contratos?.find(c => c.es_activo)?.salario_base || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: emp.es_activo ? '#D1FAE5' : '#FEE2E2',
                      color: emp.es_activo ? '#059669' : '#DC2626'
                    }}>
                      {emp.es_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    {emp.contratos?.find(c => c.es_activo) ? (
                      <button 
                        onClick={() => setFinanzasEmpleado(emp)}
                        className="btn btn-outline" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <DollarSign size={14} /> Finanzas
                      </button>
                    ) : (
                      <button 
                        onClick={() => setContratarEmpleado(emp)}
                        className="btn btn-outline" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb' }}
                      >
                        + Contrato
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {contratarEmpleado && (
        <ContratarModal 
          empleado={contratarEmpleado} 
          onClose={() => setContratarEmpleado(null)}
          onSuccess={() => {
            setContratarEmpleado(null);
            setLoading(true);
            api.getEmpleados().then(setEmpleados).finally(() => setLoading(false));
          }}
        />
      )}

      {finanzasEmpleado && (
        <FinanzasModal 
          empleado={finanzasEmpleado} 
          onClose={() => setFinanzasEmpleado(null)}
        />
      )}
    </div>
  );
}
