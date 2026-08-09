import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileWarning, AlertTriangle, Calculator, X, Sparkles, Scale, Building } from 'lucide-react';

export default function LiquidarModal({ empleado, onClose, onSuccess }) {
  const contratoActivo = empleado.contratos?.find(c => c.es_activo);
  const salarioBase = contratoActivo ? parseFloat(contratoActivo.salario_base) : (parseFloat(empleado.salario_base) || 0);
  const fechaInicioContrato = contratoActivo?.fecha_inicio || empleado.fecha_creacion || '2025-01-01';

  const [empresa, setEmpresa] = useState(null);
  const [lastPlanilla, setLastPlanilla] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);

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
    estado: 'PAGADA'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calcNotice, setCalcNotice] = useState('');

  useEffect(() => {
    cargarDatosCalculo();
  }, []);

  const cargarDatosCalculo = async () => {
    try {
      setLoadingInit(true);
      const [empData, planillasData] = await Promise.all([
        api.getEmpresa().catch(() => null),
        api.getPlanillas().catch(() => [])
      ]);

      if (empData) setEmpresa(empData);
      
      if (planillasData && planillasData.length > 0) {
        // Ordenar planillas por fecha_fin desc
        const sorted = [...planillasData].sort((a, b) => new Date(b.fecha_fin) - new Date(a.fecha_fin));
        setLastPlanilla(sorted[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInit(false);
    }
  };

  // Ejecutar el motor de cálculo legal cada vez que cambia fecha_retiro, motivo_salida, empresa o lastPlanilla
  useEffect(() => {
    if (!loadingInit) {
      calcularLiquidacionLegal();
    }
  }, [formData.fecha_retiro, formData.motivo_salida, empresa, lastPlanilla, loadingInit]);

  const calcularLiquidacionLegal = () => {
    const fRetiro = new Date(formData.fecha_retiro);
    const fInicio = new Date(fechaInicioContrato);

    if (isNaN(fRetiro.getTime()) || isNaN(fInicio.getTime())) return;

    // 1. Antigüedad en Días y Años Totales
    const diffTime = fRetiro - fInicio;
    const antiguedadDias = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const antiguedadAnios = antiguedadDias / 365.25;

    // 2. Días pendientes de pago (desde última planilla o inicio de mes)
    let diasPendientes = 0;
    if (lastPlanilla && lastPlanilla.fecha_fin) {
      const fUltima = new Date(lastPlanilla.fecha_fin);
      if (fRetiro > fUltima) {
        diasPendientes = Math.floor((fRetiro - fUltima) / (1000 * 60 * 60 * 24));
      }
    } else {
      // Si no hay planilla, días del mes en curso hasta fecha de retiro
      diasPendientes = fRetiro.getDate();
    }
    diasPendientes = Math.min(30, Math.max(0, diasPendientes));

    const salarioDiario = salarioBase / 30;
    const montoSalarioPendiente = salarioDiario * diasPendientes;

    // 3. Vacación Proporcional (15 días + 30% recargo = 19.5 días por año)
    // Días acumulados en el último ciclo de aniversario
    const ultimoAniversario = new Date(fRetiro.getFullYear(), fInicio.getMonth(), fInicio.getDate());
    if (ultimoAniversario > fRetiro) {
      ultimoAniversario.setFullYear(fRetiro.getFullYear() - 1);
    }
    const diasCicloVacacion = Math.floor((fRetiro - ultimoAniversario) / (1000 * 60 * 60 * 24));
    const proporcionVacacionAnio = diasCicloVacacion / 365.25;
    const montoVacacionProp = proporcionVacacionAnio * 15 * 1.30 * salarioDiario;

    // 4. Aguinaldo Proporcional (Según Art. 196, 197, 202 MTPS)
    // Ciclo de aguinaldo del 12 de diciembre del año anterior al 11 de diciembre
    let fInicioAguinaldo = new Date(fRetiro.getFullYear() - 1, 11, 12);
    if (fRetiro < new Date(fRetiro.getFullYear(), 11, 12)) {
      if (fInicio > fInicioAguinaldo) fInicioAguinaldo = fInicio;
    } else {
      fInicioAguinaldo = new Date(fRetiro.getFullYear(), 11, 12);
      if (fInicio > fInicioAguinaldo) fInicioAguinaldo = fInicio;
    }
    const diasCicloAguinaldo = Math.max(0, Math.floor((fRetiro - fInicioAguinaldo) / (1000 * 60 * 60 * 24)));
    
    let diasAguinaldoTabla = 15;
    if (antiguedadAnios >= 10) diasAguinaldoTabla = 21;
    else if (antiguedadAnios >= 3) diasAguinaldoTabla = 19;
    else if (antiguedadAnios >= 1) diasAguinaldoTabla = 15;
    else diasAguinaldoTabla = 15;

    const montoAguinaldoProp = (diasCicloAguinaldo / 365.25) * diasAguinaldoTabla * salarioDiario;

    // 5. Indemnización Legal por Despido o Renuncia (Art. 58 y Ley de Renuncia)
    // Techo salarial Art. 58 MTPS: Máximo 4 salarios mínimos vigentes ($365 * 4 = $1,460.00)
    const salarioTecho = Math.min(salarioBase, 1460.00);
    const salarioDiarioTecho = salarioTecho / 30;

    let montoIndemnizacionCalc = 0;
    const politica = empresa?.politica_indemnizacion || 'Acumulada';

    if (formData.motivo_salida === 'Despido con Responsabilidad' || formData.motivo_salida === 'Mutuo Acuerdo') {
      if (politica === 'Anual') {
        // En política anual: indemnización únicamente por el año fiscal en curso (desde 1 de enero)
        const inicioAnioFiscal = new Date(fRetiro.getFullYear(), 0, 1);
        const fInicioIndem = fInicio > inicioAnioFiscal ? fInicio : inicioAnioFiscal;
        const diasAnioFiscal = Math.max(0, Math.floor((fRetiro - fInicioIndem) / (1000 * 60 * 60 * 24)));
        montoIndemnizacionCalc = (diasAnioFiscal / 365.25) * 30 * salarioDiarioTecho;
      } else {
        // Política acumulada: por toda la antigüedad servida
        montoIndemnizacionCalc = (antiguedadDias / 365.25) * 30 * salarioDiarioTecho;
      }
    } else if (formData.motivo_salida === 'Renuncia Voluntaria') {
      // Ley de Renuncia Voluntaria Decreto 592: Requiere 2+ años de servicio (730 días). 15 días por año.
      if (antiguedadDias >= 730) {
        montoIndemnizacionCalc = (antiguedadDias / 365.25) * 15 * salarioDiarioTecho;
      } else {
        montoIndemnizacionCalc = 0;
      }
    } else {
      montoIndemnizacionCalc = 0;
    }

    // 6. Deducciones de Ley (ISSS 3% máx $30, AFP 7.25%, Renta sobre devengado gravable)
    const devengadoGravable = montoSalarioPendiente + montoVacacionProp;
    const isss = Math.min(devengadoGravable * 0.03, 30.00);
    const afp = devengadoGravable * 0.0725;
    
    // Tabla simplificada ISR mensual proporcional
    const baseRenta = devengadoGravable - isss - afp;
    let renta = 0;
    if (baseRenta > 895.24) renta = (baseRenta - 895.24) * 0.20 + 60.00;
    else if (baseRenta > 472.00) renta = (baseRenta - 472.00) * 0.10 + 17.67;

    const deduccionesTotal = isss + afp + renta;
    const ingresosTotal = montoSalarioPendiente + montoVacacionProp + montoAguinaldoProp + montoIndemnizacionCalc;
    const liquidoTotal = ingresosTotal - deduccionesTotal;

    setFormData(prev => ({
      ...prev,
      dias_laborados_pendientes: diasPendientes,
      monto_salario_pendiente: montoSalarioPendiente.toFixed(2),
      monto_vacacion_proporcional: montoVacacionProp.toFixed(2),
      monto_aguinaldo_proporcional: montoAguinaldoProp.toFixed(2),
      monto_indemnizacion: montoIndemnizacionCalc.toFixed(2),
      deducciones_ley: deduccionesTotal.toFixed(2),
      total_ingresos_liquidacion: ingresosTotal.toFixed(2),
      total_liquido_pagar: liquidoTotal.toFixed(2)
    }));

    setCalcNotice(`✨ Calculado según Código de Trabajo El Salvador y Política de Indemnización ${politica.toUpperCase()} (${(antiguedadAnios).toFixed(1)} años de antigüedad).`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Recálculo de totales al editar montos manuales en UI
  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm(`¿Estás seguro de procesar este finiquito por $${formData.total_liquido_pagar}? Esta acción marcará al colaborador como INACTIVO permanentemente y cerrará su contrato.`)) return;
    
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
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, padding: '1.5rem', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="modal-content" style={{
        background: 'white', borderRadius: '12px', width: '100%', maxWidth: '750px',
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #991b1b, #dc2626)', color: 'white' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
            <FileWarning size={22} />
            Calculadora Legal de Liquidación y Finiquito
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.8 }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Colaborador</p>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#1e293b' }}>{empleado.primer_nombre} {empleado.primer_apellido}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Salario Base</p>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#15803d' }}>${salarioBase.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Fecha Contratación</p>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', fontSize: '0.95rem' }}>{fechaInicioContrato}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Política Empresa</p>
              <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1D4ED8', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building size={12} /> {empresa?.politica_indemnizacion || 'Acumulada'}
              </span>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <AlertTriangle size={18} /> Error al Procesar
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          {calcNotice && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', color: '#15803d', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} />
              <span>{calcNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Fecha de Retiro / Salida *</label>
                <input type="date" name="fecha_retiro" className="form-input" style={{ width: '100%' }} required value={formData.fecha_retiro} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Motivo de Salida *</label>
                <select name="motivo_salida" className="form-input" style={{ width: '100%' }} required value={formData.motivo_salida} onChange={handleChange}>
                  <option value="Despido con Responsabilidad">Despido con Responsabilidad Patronal (Art. 58)</option>
                  <option value="Renuncia Voluntaria">Renuncia Voluntaria (Ley Decreto 592 - 2+ Años)</option>
                  <option value="Mutuo Acuerdo">Mutuo Acuerdo</option>
                  <option value="Despido sin Responsabilidad">Despido sin Responsabilidad Patronal (Art. 50)</option>
                  <option value="Abandono de Trabajo">Abandono de Trabajo</option>
                  <option value="Finalizacion de Contrato">Finalización de Contrato Plazo Fijo</option>
                  <option value="Fallecimiento">Fallecimiento</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
                  <Scale size={18} /> Devengados y Prestaciones Proporcionales (Leyes SV)
                </h4>
                <button 
                  type="button" 
                  onClick={calcularLiquidacionLegal}
                  className="btn btn-outline" 
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Calculator size={13} /> Recalcular según Ley
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Días Pendientes de Pago (Última Nómina)</label>
                  <input 
                    type="number" 
                    name="dias_laborados_pendientes" 
                    className="form-input" 
                    style={{ width: '100%' }}
                    min="0" max="31" 
                    value={formData.dias_laborados_pendientes} 
                    onChange={e => {
                      const d = parseInt(e.target.value) || 0;
                      const sP = (salarioBase / 30 * d).toFixed(2);
                      setFormData(prev => ({ ...prev, dias_laborados_pendientes: d, monto_salario_pendiente: sP }));
                    }} 
                  />
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>Calculado automáticamente desde última planilla.</small>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Salario Pendiente ($)</label>
                  <input type="number" step="0.01" name="monto_salario_pendiente" className="form-input" style={{ width: '100%' }} value={formData.monto_salario_pendiente} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Vacación Prop. + 30% ($)</label>
                  <input type="number" step="0.01" name="monto_vacacion_proporcional" className="form-input" style={{ width: '100%' }} value={formData.monto_vacacion_proporcional} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Aguinaldo Prop. ($)</label>
                  <input type="number" step="0.01" name="monto_aguinaldo_proporcional" className="form-input" style={{ width: '100%' }} value={formData.monto_aguinaldo_proporcional} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Indemnización Legal ($)</label>
                  <input type="number" step="0.01" name="monto_indemnizacion" className="form-input" style={{ width: '100%' }} value={formData.monto_indemnizacion} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e3a8a', fontSize: '1rem' }}>Deducciones y Retenciones Legales</h4>
              <div style={{ maxWidth: '240px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>ISSS + AFP + Renta ($)</label>
                <input type="number" step="0.01" name="deducciones_ley" className="form-input" style={{ width: '100%' }} value={formData.deducciones_ley} onChange={handleChange} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Gran Total Ingresos</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>${formData.total_ingresos_liquidacion}</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>-</div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Deducciones</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>${formData.deducciones_ley}</p>
              </div>
              <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>=</div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Neto Líquido a Cancelar</p>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>${formData.total_liquido_pagar}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626', fontWeight: 'bold' }} disabled={loading}>
                {loading ? 'Procesando Finiquito...' : 'Confirmar Liquidación y Despedir'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
