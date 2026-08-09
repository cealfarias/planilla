import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, ArrowRight, Save, User, MapPin, Briefcase } from 'lucide-react';
import './NuevoEmpleado.css'; // O usar estilos inline/globales

import { LISTA_DEPARTAMENTOS, obtenerDistritosPorDepartamento, obtenerMunicipioOficial } from '../utils/el_salvador_territorio';

export default function NuevoEmpleado() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Paso 1: Datos Personales & Contacto
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    dui: '',
    nit: '',
    isss_afiliacion: '',
    nup_afp: '',
    fecha_nacimiento: '',
    genero: 'M',
    estado_familiar: 'Soltero',
    profesion_oficio: '',
    nacionalidad: 'Salvadoreña',
    email_institucional: '',
    telefono: '',

    // Paso 2: Ubicación
    departamento_residencia: '',
    distrito_residencia: '',
    municipio_residencia: '',
    dui_departamento_expedicion: '',
    dui_distrito_expedicion: '',
    dui_municipio_expedicion: '',
    dui_fecha_expedicion: '',

    // Paso 3: Contrato
    tipo_contrato: 'Indefinido',
    cargo: '',
    salario_base: '',
    fecha_inicio: '',
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
    lugar_trabajo_municipio: 'San Salvador Centro',
    lugar_trabajo_departamento: 'San Salvador',
    distrito_celebracion: 'San Salvador'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Lógica para Residencia
      if (name === 'departamento_residencia') {
        updated.distrito_residencia = '';
        updated.municipio_residencia = '';
      } else if (name === 'distrito_residencia') {
        updated.municipio_residencia = obtenerMunicipioOficial(updated.departamento_residencia, value);
      }

      // Lógica para Expedición de DUI
      if (name === 'dui_departamento_expedicion') {
        updated.dui_distrito_expedicion = '';
        updated.dui_municipio_expedicion = '';
      } else if (name === 'dui_distrito_expedicion') {
        updated.dui_municipio_expedicion = obtenerMunicipioOficial(updated.dui_departamento_expedicion, value);
      }

      return updated;
    });
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Crear Empleado
      const empleadoPayload = {
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre || null,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido || null,
        dui: formData.dui,
        nit: formData.nit,
        isss_afiliacion: formData.isss_afiliacion || null,
        nup_afp: formData.nup_afp || null,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        estado_familiar: formData.estado_familiar,
        profesion_oficio: formData.profesion_oficio,
        nacionalidad: formData.nacionalidad,
        email_institucional: formData.email_institucional || null,
        telefono: formData.telefono || null,
        banco_nombre: formData.banco_nombre || null,
        numero_cuenta_bancaria: formData.numero_cuenta_bancaria || null,
        departamento_residencia: formData.departamento_residencia,
        municipio_residencia: formData.municipio_residencia,
        distrito_residencia: formData.distrito_residencia,
        dui_departamento_expedicion: formData.dui_departamento_expedicion,
        dui_municipio_expedicion: formData.dui_municipio_expedicion,
        dui_distrito_expedicion: formData.dui_distrito_expedicion,
        dui_fecha_expedicion: formData.dui_fecha_expedicion,
      };

      const empleado = await api.crearEmpleado(empleadoPayload);

      // 2. Crear Contrato
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

      navigate('/empleados');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-empleado-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/empleados')} className="btn btn-outline" style={{ padding: '0.5rem', marginBottom: '1rem', border: 'none' }}>
          <ArrowLeft size={20} /> Volver
        </button>
        <h1>Alta de Colaborador</h1>
        <p className="text-muted">Asistente de registro y contratación</p>
      </div>

      <div className="wizard-progress">
        <div className={`wizard-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-icon"><User size={18} /></div>
          <span>Personales</span>
        </div>
        <div className="wizard-line"></div>
        <div className={`wizard-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-icon"><MapPin size={18} /></div>
          <span>Ubicación</span>
        </div>
        <div className="wizard-line"></div>
        <div className={`wizard-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-icon"><Briefcase size={18} /></div>
          <span>Contrato</span>
        </div>
      </div>

      <div className="card wizard-card">
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem', color: '#ff4d4f', background: '#fff2f0', padding: '1rem', borderRadius: '4px' }}>{error}</div>}
        
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          
          {step === 1 && (
            <div className="step-content">
              <h3>Datos Personales y Contacto</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label>Primer Nombre *</label>
                  <input type="text" name="primer_nombre" required value={formData.primer_nombre} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Segundo Nombre</label>
                  <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Primer Apellido *</label>
                  <input type="text" name="primer_apellido" required value={formData.primer_apellido} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Segundo Apellido</label>
                  <input type="text" name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>DUI (00000000-0) *</label>
                  <input type="text" name="dui" required value={formData.dui} onChange={handleChange} className="form-input" placeholder="00000000-0" />
                </div>
                <div className="form-group">
                  <label>NIT (0000-000000-000-0) *</label>
                  <input type="text" name="nit" required value={formData.nit} onChange={handleChange} className="form-input" placeholder="0000-000000-000-0" />
                </div>
                <div className="form-group">
                  <label>Teléfono de Contacto *</label>
                  <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange} className="form-input" placeholder="7000-0000" />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico (Opcional)</label>
                  <input type="email" name="email_institucional" value={formData.email_institucional} onChange={handleChange} className="form-input" placeholder="correo@ejemplo.com" />
                </div>
                <div className="form-group">
                  <label>ISSS</label>
                  <input type="text" name="isss_afiliacion" value={formData.isss_afiliacion} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>NUP (AFP)</label>
                  <input type="text" name="nup_afp" value={formData.nup_afp} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input type="date" name="fecha_nacimiento" required value={formData.fecha_nacimiento} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Género *</label>
                  <select name="genero" value={formData.genero} onChange={handleChange} className="form-input">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado Familiar *</label>
                  <select name="estado_familiar" value={formData.estado_familiar} onChange={handleChange} className="form-input">
                    <option value="Soltero">Soltero/a</option>
                    <option value="Casado">Casado/a</option>
                    <option value="Divorciado">Divorciado/a</option>
                    <option value="Viudo">Viudo/a</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Profesión u Oficio *</label>
                  <input type="text" name="profesion_oficio" required value={formData.profesion_oficio} onChange={handleChange} className="form-input" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Ubicación y Expedición</h3>
              
              <h4 style={{ margin: '1rem 0 0.5rem' }}>Residencia</h4>
              <div className="grid-3">
                <div className="form-group">
                  <label>Departamento *</label>
                  <select 
                    name="departamento_residencia" 
                    required 
                    value={formData.departamento_residencia} 
                    onChange={handleChange} 
                    className="form-input"
                  >
                    <option value="">-- Seleccionar --</option>
                    {LISTA_DEPARTAMENTOS.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Distrito *</label>
                  <select 
                    name="distrito_residencia" 
                    required 
                    disabled={!formData.departamento_residencia} 
                    value={formData.distrito_residencia} 
                    onChange={handleChange} 
                    className="form-input"
                  >
                    <option value="">-- Seleccionar --</option>
                    {obtenerDistritosPorDepartamento(formData.departamento_residencia).map(dis => (
                      <option key={dis} value={dis}>{dis}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Municipio *</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>✓ Auto (Ley 762)</span>
                  </label>
                  <input 
                    type="text" 
                    name="municipio_residencia" 
                    readOnly 
                    required 
                    placeholder="Auto-calculado..." 
                    value={formData.municipio_residencia} 
                    className="form-input" 
                    style={{ background: '#f1f5f9', cursor: 'not-allowed', fontWeight: '600', color: '#0f172a' }} 
                  />
                </div>
              </div>

              <h4 style={{ margin: '1.5rem 0 0.5rem' }}>Expedición de DUI</h4>
              <div className="grid-3">
                <div className="form-group">
                  <label>Departamento *</label>
                  <select 
                    name="dui_departamento_expedicion" 
                    required 
                    value={formData.dui_departamento_expedicion} 
                    onChange={handleChange} 
                    className="form-input"
                  >
                    <option value="">-- Seleccionar --</option>
                    {LISTA_DEPARTAMENTOS.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Distrito *</label>
                  <select 
                    name="dui_distrito_expedicion" 
                    required 
                    disabled={!formData.dui_departamento_expedicion} 
                    value={formData.dui_distrito_expedicion} 
                    onChange={handleChange} 
                    className="form-input"
                  >
                    <option value="">-- Seleccionar --</option>
                    {obtenerDistritosPorDepartamento(formData.dui_departamento_expedicion).map(dis => (
                      <option key={dis} value={dis}>{dis}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Municipio *</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>✓ Auto (Ley 762)</span>
                  </label>
                  <input 
                    type="text" 
                    name="dui_municipio_expedicion" 
                    readOnly 
                    required 
                    placeholder="Auto-calculado..." 
                    value={formData.dui_municipio_expedicion} 
                    className="form-input" 
                    style={{ background: '#f1f5f9', cursor: 'not-allowed', fontWeight: '600', color: '#0f172a' }} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: '300px', marginTop: '1rem' }}>
                <label>Fecha Expedición DUI *</label>
                <input type="date" name="dui_fecha_expedicion" required value={formData.dui_fecha_expedicion} onChange={handleChange} className="form-input" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Datos del Contrato</h3>
              <div className="grid-2">
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

              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                🏦 Información Bancaria para Pago / Transferencias
              </h4>
              <div className="grid-2">
                <div className="form-group">
                  <label>Banco Depositante</label>
                  <select name="banco_nombre" value={formData.banco_nombre || ''} onChange={handleChange} className="form-input">
                    <option value="Banco Agrícola">Banco Agrícola</option>
                    <option value="BAC Credomatic">BAC Credomatic</option>
                    <option value="Banco Cuscatlán">Banco Cuscatlán</option>
                    <option value="Banco Davivienda">Banco Davivienda</option>
                    <option value="Banco Promerica">Banco Promerica</option>
                    <option value="Banco Azul">Banco Azul</option>
                    <option value="Banco CITI">Banco CITI</option>
                    <option value="Chivo Wallet">Chivo Wallet</option>
                    <option value="Pago en Efectivo / Cheque">Pago en Efectivo / Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Número de Cuenta Bancaria</label>
                  <input 
                    type="text" 
                    name="numero_cuenta_bancaria" 
                    placeholder="Ej. 003001234567" 
                    value={formData.numero_cuenta_bancaria || ''} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
              </div>
            </div>
          )}

          <div className="wizard-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} /> Anterior
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Siguiente <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#28a745' }}>
                {loading ? 'Guardando...' : <><Save size={16} /> Contratar Colaborador</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
