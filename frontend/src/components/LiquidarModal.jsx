import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileWarning, AlertTriangle, Calculator, X } from 'lucide-react';

export default function LiquidarModal({ empleado, onClose, onSuccess }) {
  const salarioBase = empleado.contratos?.find(c => c.es_activo)?.salario_base || 0;
  
  const [formData, setFormData] = useState({
    empleado_id: empleado.id,
    fecha_retiro: new Date().toISOString().split('T')[0],
    motivo_salida: 'Despido con Responsabilidad', // Default
    salario_base_calculo: salarioBase,
    dias_laborados_pendientes: 0,
    monto_salario_pendiente: 0,
    monto_vacacion_proporcional: 0,
    monto_aguinaldo_proporcional: 0,
    monto_indemnizacion: 0,
    deducciones_ley: 0,
    total_ingresos_liquidacion: 0,
    total_liquido_pagar: 0,
    estado: 'PAGADA' // Al darle pagar, se procesa automáticamente para el MVP
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-calcular totales cuando cambian los montos parciales
  useEffect(() => {
    // Si cambian los días pendientes, calculamos el salario pendiente base (Salario / 30 * dias)
    const salarioDiario = parseFloat(formData.salario_base_calculo) / 30;
    const nuevoSalarioPendiente = salarioDiario * (parseInt(formData.dias_laborados_pendientes) || 0);
    
    // Sumar todos los ingresos (salario pendiente + vacacion + aguinaldo + indemnizacion)
    // Para simplificar la UI, permitimos que editen salario_pendiente directamente,
    // así que solo lo autocalculamos si el usuario no lo ha tocado, pero mejor lo sumamos.
    
    // Convert to floats for math
    const ingresos = 
      parseFloat(formData.monto_salario_pendiente || 0) + 
      parseFloat(formData.monto_vacacion_proporcional || 0) + 
      parseFloat(formData.monto_aguinaldo_proporcional || 0) + 
      parseFloat(formData.monto_indemnizacion || 0);
      
    const deducciones = parseFloat(formData.deducciones_ley || 0);
    const liquido = ingresos - deducciones;

    setFormData(prev => ({
      ...prev,
      total_ingresos_liquidacion: ingresos.toFixed(2),
      total_liquido_pagar: liquido.toFixed(2)
    }));
  }, [
    formData.monto_salario_pendiente, 
    formData.monto_vacacion_proporcional, 
    formData.monto_aguinaldo_proporcional, 
    formData.monto_indemnizacion, 
    formData.deducciones_ley
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiasChange = (e) => {
    const dias = parseInt(e.target.value) || 0;
    const salarioDiario = parseFloat(formData.salario_base_calculo) / 30;
    const salarioPendiente = (salarioDiario * dias).toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      dias_laborados_pendientes: dias,
      monto_salario_pendiente: salarioPendiente
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("¿Estás seguro de procesar este finiquito? Esta acción marcará al colaborador como INACTIVO permanentemente y cerrará su contrato actual.")) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.liquidarEmpleado(formData);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="modal-content" style={{
        background: 'white', borderRadius: '8px', width: '100%', maxWidth: '700px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
            <FileWarning size={24} />
            Liquidación / Finiquito de Empleado
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Colaborador</p>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{empleado.primer_nombre} {empleado.primer_apellido}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Salario Nominal</p>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>${salarioBase.toFixed(2)}</p>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <AlertTriangle size={18} /> Error al Procesar
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', color: '#92400e', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <strong>Aviso de Cálculo MVP:</strong> En esta versión, el cálculo automático de los días proporcionales de aguinaldo, vacación e indemnización según el Código de Trabajo debe realizarse externamente e ingresarse manualmente en las casillas correspondientes.
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Fecha de Retiro *</label>
                <input type="date" name="fecha_retiro" className="form-control" required value={formData.fecha_retiro} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Motivo de Salida *</label>
                <select name="motivo_salida" className="form-control" required value={formData.motivo_salida} onChange={handleChange}>
                  <option value="Despido con Responsabilidad">Despido con Responsabilidad Patronal</option>
                  <option value="Despido sin Responsabilidad">Despido sin Responsabilidad Patronal</option>
                  <option value="Renuncia Voluntaria">Renuncia Voluntaria</option>
                  <option value="Mutuo Acuerdo">Mutuo Acuerdo</option>
                  <option value="Abandono de Trabajo">Abandono de Trabajo</option>
                  <option value="Finalizacion de Contrato">Finalización de Contrato</option>
                  <option value="Fallecimiento">Fallecimiento</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Cálculo de Ingresos (Devengados)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Días Pendientes de Pago</label>
                  <input type="number" name="dias_laborados_pendientes" className="form-control" min="0" max="31" value={formData.dias_laborados_pendientes} onChange={handleDiasChange} />
                  <small className="text-muted">Se calculará salario proporcional.</small>
                </div>
                <div className="form-group">
                  <label>Salario Pendiente ($)</label>
                  <input type="number" step="0.01" name="monto_salario_pendiente" className="form-control" value={formData.monto_salario_pendiente} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label>Vacación Prop. ($)</label>
                  <input type="number" step="0.01" name="monto_vacacion_proporcional" className="form-control" value={formData.monto_vacacion_proporcional} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Aguinaldo Prop. ($)</label>
                  <input type="number" step="0.01" name="monto_aguinaldo_proporcional" className="form-control" value={formData.monto_aguinaldo_proporcional} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Indemnización ($)</label>
                  <input type="number" step="0.01" name="monto_indemnizacion" className="form-control" value={formData.monto_indemnizacion} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Deducciones y Retenciones</h4>
              <div className="form-group" style={{ maxWidth: '200px' }}>
                <label>Deducciones de Ley / Otros ($)</label>
                <input type="number" step="0.01" name="deducciones_ley" className="form-control" value={formData.deducciones_ley} onChange={handleChange} />
                <small className="text-muted">Descuentos ISR/Préstamos.</small>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Gran Total (Ingresos)</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>${formData.total_ingresos_liquidacion}</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>-</div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Deducciones</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>${formData.deducciones_ley}</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>=</div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Líquido a Pagar</p>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>${formData.total_liquido_pagar}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} disabled={loading}>
                {loading ? 'Procesando Finiquito...' : 'Confirmar Liquidación y Despedir'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
