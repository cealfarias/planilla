import React, { useState } from 'react';
import { api } from '../services/api';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Planillas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    codigo_periodo: `MENSUAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    tipo_planilla: 'Mensual',
    fecha_inicio: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    fecha_fin: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-30`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProcesar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.procesarPlanilla(formData);
      setSuccess(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planillas-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>Motor de Planillas</h1>
        <p className="text-muted">Procesa la nómina de todos los colaboradores activos y genera boletas de pago.</p>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} className="text-primary" />
            Nuevo Período de Pago
          </h3>
          <form onSubmit={handleProcesar}>
            <div className="form-group">
              <label>Código de Período *</label>
              <input type="text" name="codigo_periodo" className="form-input" required value={formData.codigo_periodo} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Tipo de Planilla *</label>
              <select name="tipo_planilla" className="form-input" value={formData.tipo_planilla} onChange={handleChange}>
                <option value="Mensual">Ordinaria Mensual</option>
                <option value="Quincenal">Ordinaria Quincenal</option>
                <option value="Aguinaldo">Aguinaldo</option>
                <option value="Vacaciones">Vacaciones</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha Inicio *</label>
                <input type="date" name="fecha_inicio" className="form-input" required value={formData.fecha_inicio} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha Fin *</label>
                <input type="date" name="fecha_fin" className="form-input" required value={formData.fecha_fin} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem', background: 'var(--primary)' }}>
              {loading ? 'Procesando Cálculos...' : 'Generar Planilla'}
            </button>
          </form>
        </div>

        <div>
          {error && (
            <div className="card" style={{ background: '#fff2f0', borderColor: '#ffccc7', color: '#cf1322' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> Error al Procesar
              </h4>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="card" style={{ background: '#f6ffed', borderColor: '#b7eb8f', color: '#389e0d' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle size={18} /> Planilla Procesada Exitosamente
              </h4>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
                <p><strong>Período:</strong> {success.periodo.codigo_periodo}</p>
                <p><strong>Empleados Procesados:</strong> {success.estadisticas.boletas_generadas}</p>
                <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Total a Pagar (Líquido): ${success.estadisticas.total_liquido_pagar.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          
          {!success && !error && (
             <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--text-muted)' }}>
               <CreditCard size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p>El resumen del procesamiento aparecerá aquí.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
