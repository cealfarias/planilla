import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Users, Plus, DollarSign, FileWarning, Edit } from 'lucide-react';
import ContratarModal from '../components/ContratarModal';
import FinanzasModal from '../components/FinanzasModal';
import LiquidarModal from '../components/LiquidarModal';
import EditarEmpleadoModal from '../components/EditarEmpleadoModal';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contratarEmpleado, setContratarEmpleado] = useState(null);
  const [finanzasEmpleado, setFinanzasEmpleado] = useState(null);
  const [liquidarEmpleado, setLiquidarEmpleado] = useState(null);
  const [editarEmpleado, setEditarEmpleado] = useState(null);
  const navigate = useNavigate();

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const data = await api.getEmpleados();
      setEmpleados(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleActivarEmpleado = async (empleadoId) => {
    if (!window.confirm("¿Deseas reactivar a este colaborador en el sistema?")) return;
    try {
      await api.cambiarEstadoEmpleado(empleadoId, "Activo");
      fetchEmpleados();
    } catch (err) {
      alert(err.message);
    }
  };

  const getInitials = (emp) => {
    const f = emp.primer_nombre ? emp.primer_nombre.charAt(0) : '';
    const l = emp.primer_apellido ? emp.primer_apellido.charAt(0) : '';
    return (f + l).toUpperCase() || 'EM';
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={20} className="text-blue-600" />
            Directorio de Empleados
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Gestiona el personal activo de la empresa.</p>
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
              <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Fotografía</th>
              <th style={{ padding: '0.85rem 0.5rem' }}>Nombre Completo</th>
              <th style={{ padding: '0.85rem 0.5rem' }}>Cargo</th>
              <th style={{ padding: '0.85rem 0.5rem' }}>Salario Base</th>
              <th style={{ padding: '0.85rem 0.5rem' }}>Estado</th>
              <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Acciones</th>
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
                  {/* FOTOGRAFIA EN LUGAR DE CODIGO */}
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                    {emp.foto_url_base64 || emp.foto_perfil ? (
                      <img 
                        src={emp.foto_url_base64 || emp.foto_perfil} 
                        alt={`${emp.primer_nombre} ${emp.primer_apellido}`} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb', margin: '0 auto', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: 'bold', border: '2px solid #2563eb',
                        margin: '0 auto'
                      }}>
                        {getInitials(emp)}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: '600' }}>
                    {emp.primer_nombre} {emp.segundo_nombre || ''} {emp.primer_apellido} {emp.segundo_apellido || ''}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    {emp.contratos?.find(c => c.es_activo)?.cargo || 'Sin Asignar'}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: '500' }}>
                    ${(emp.contratos?.find(c => c.es_activo)?.salario_base || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: emp.estado === 'Activo' ? '#D1FAE5' : '#FEE2E2',
                      color: emp.estado === 'Activo' ? '#059669' : '#DC2626'
                    }}>
                      {emp.estado === 'Activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setEditarEmpleado(emp)}
                        className="btn btn-outline" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                        title="Editar Perfil y Fotografía"
                      >
                        <Edit size={13} /> Editar
                      </button>

                      {emp.estado === 'Inactivo' ? (
                        <button 
                          onClick={() => handleActivarEmpleado(emp.id)}
                          className="btn btn-outline" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#16a34a', borderColor: '#16a34a' }}
                        >
                          Reactivar
                        </button>
                      ) : emp.contratos?.find(c => c.es_activo) ? (
                        <>
                          <button 
                            onClick={() => setFinanzasEmpleado(emp)}
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <DollarSign size={13} /> Finanzas
                          </button>
                          <button 
                            onClick={() => setLiquidarEmpleado(emp)}
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <FileWarning size={13} /> Liquidar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setContratarEmpleado(emp)}
                          className="btn btn-outline" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb' }}
                        >
                          + Contrato
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editarEmpleado && (
        <EditarEmpleadoModal
          empleado={editarEmpleado}
          onClose={() => setEditarEmpleado(null)}
          onSuccess={() => {
            setEditarEmpleado(null);
            fetchEmpleados();
          }}
        />
      )}

      {contratarEmpleado && (
        <ContratarModal 
          empleado={contratarEmpleado} 
          onClose={() => setContratarEmpleado(null)}
          onSuccess={() => {
            setContratarEmpleado(null);
            fetchEmpleados();
          }}
        />
      )}

      {finanzasEmpleado && (
        <FinanzasModal 
          empleado={finanzasEmpleado} 
          onClose={() => setFinanzasEmpleado(null)}
        />
      )}

      {liquidarEmpleado && (
        <LiquidarModal 
          empleado={liquidarEmpleado} 
          onClose={() => setLiquidarEmpleado(null)}
          onSuccess={() => {
            setLiquidarEmpleado(null);
            fetchEmpleados();
          }}
        />
      )}
    </div>
  );
}
