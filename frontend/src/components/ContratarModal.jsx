import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Save, Briefcase } from 'lucide-react';

export default function ContratarModal({ empleado, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    tipo_contrato: 'Indefinido',
    cargo: '',
    salario_base: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    horas_semanales: '44',
    dias_jornada: 'Lunes a Viernes',
    hora_inicio: '08:00',
    hora_fin: '17:00',
    pausa_alimenticia_inicio: '12:00',
    pausa_alimenticia_fin: '13:00',
    medio_pago: 'Transferencia Bancaria',
    lugar_pago: 'Oficina Central',
    lugar_trabajo_direccion: 'Oficina Central',
    lugar_trabajo_distrito: 'San Salvador',
    lugar_trabajo_municipio: 'San Salvador',
    lugar_trabajo_departamento: 'San Salvador',
    distrito_celebracion: 'San Salvador'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const contratoPayload = {
        empleado_id: empleado.id,
        tipo_contrato: formData.tipo_contrato,
        cargo: formData.cargo,
        salario_base: parseFloat(formData.salario_base),
        fecha_inicio: formData.fecha_inicio,
        dias_jornada: formData.dias_jornada,
        hora_inicio: formData.hora_inicio + ':00',
        hora_fin: formData.hora_fin + ':00',
        pausa_alimenticia_inicio: formData.pausa_alimenticia_inicio + ':00',
        pausa_alimenticia_fin: formData.pausa_alimenticia_fin + ':00',
        horas_semanales: parseInt(formData.horas_semanales),
        medio_pago: formData.medio_pago,
        lugar_pago: formData.lugar_pago,
        lugar_trabajo_direccion: formData.lugar_trabajo_direccion,
        lugar_trabajo_distrito: formData.lugar_trabajo_distrito,
        lugar_trabajo_municipio: formData.lugar_trabajo_municipio,
        lugar_trabajo_departamento: formData.lugar_trabajo_departamento,
        distrito_celebracion: formData.distrito_celebracion
      };

      await api.crearContrato(empleado.id, contratoPayload);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={24} className="text-primary" />
          Nuevo Contrato
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Empleado: <strong>{empleado.primer_nombre} {empleado.primer_apellido} ({empleado.dui})</strong>
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem', color: '#ff4d4f', background: '#fff2f0', padding: '1rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Cargo / Puesto *</label>
              <input type="text" name="cargo" required value={formData.cargo} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Salario Base (USD) *</label>
              <input type="number" step="0.01" name="salario_base" required value={formData.salario_base} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Fecha Inicio Labores *</label>
              <input type="date" name="fecha_inicio" required value={formData.fecha_inicio} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Tipo de Contrato *</label>
              <select name="tipo_contrato" required value={formData.tipo_contrato} onChange={handleChange} className="form-input">
                <option value="Indefinido">Indefinido</option>
                <option value="Plazo Fijo">Plazo Fijo</option>
                <option value="Servicios Profesionales">Servicios Profesionales</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#28a745' }}>
              {loading ? 'Guardando...' : <><Save size={16} /> Crear Contrato</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
