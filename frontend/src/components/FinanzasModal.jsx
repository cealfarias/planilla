import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { X, DollarSign, AlertCircle, CheckCircle, Calculator, Scale, UploadCloud } from 'lucide-react';
import BaseLegalModal from './BaseLegalModal';
import { parsearCSVNovedades } from '../utils/csv_novedades';

export default function FinanzasModal({ empleado, onClose }) {
  const [activeTab, setActiveTab] = useState('descuentos'); // 'novedades' o 'descuentos'
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal Base Legal & CSV
  const [showBaseLegal, setShowBaseLegal] = useState(false);
  const fileCsvRef = useRef(null);

  // Form State Descuentos
  const [tipoPrestamo, setTipoPrestamo] = useState('Interno');
  const [entidad, setEntidad] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [cuotaPeriodica, setCuotaPeriodica] = useState('');

  // Form State Novedades
  const [tipoNovedad, setTipoNovedad] = useState('HORA_EXTRA');
  const [fechaNovedad, setFechaNovedad] = useState('');
  const [horaInicio, setHoraInicio] = useState('17:00');
  const [horaFin, setHoraFin] = useState('19:00');
  const [minutosTardia, setMinutosTardia] = useState('');
  const [aplicaSeptimoDia, setAplicaSeptimoDia] = useState(false);
  const [montoDirecto, setMontoDirecto] = useState('');
  const [observacionNovedad, setObservacionNovedad] = useState('');
  const [submittingNovedad, setSubmittingNovedad] = useState(false);
  const [errorNovedad, setErrorNovedad] = useState(null);
  const [successNovedad, setSuccessNovedad] = useState(null);
  const [periodoActivo, setPeriodoActivo] = useState(null);

  useEffect(() => {
    fetchPrestamos();
    verificarPeriodo();
  }, []);

  const verificarPeriodo = async () => {
    try {
      const res = await api.getPeriodoActivo();
      if (res && res.activo) {
        setPeriodoActivo(res);
      } else {
        setPeriodoActivo(false);
      }
    } catch (err) {
      setPeriodoActivo(false);
    }
  };

  // Salario info
  const contratoActivo = empleado.contratos?.find(c => c.es_activo);
  const salarioNominal = contratoActivo ? parseFloat(contratoActivo.salario_base) : (parseFloat(empleado.salario_base) || 0);
  const valorHoraNormal = salarioNominal / 240; // 30 días * 8 horas
  const valorDiaNormal = salarioNominal / 30;
  const limiteLegal = salarioNominal * 0.20;

  // Calculadora de Horas Extras por Horario
  const calcularDesgloseHoras = () => {
    if (!horaInicio || !horaFin) return { totalHoras: 0, diurnas: 0, nocturnas: 0, montoDiurno: 0, montoNocturno: 0, montoTotal: 0 };
    
    const [hI, mI] = horaInicio.split(':').map(Number);
    const [hF, mF] = horaFin.split(':').map(Number);
    
    let inicioMin = hI * 60 + mI;
    let finMin = hF * 60 + mF;
    if (finMin <= inicioMin) finMin += 24 * 60; // Si pasa de medianoche

    const totalMinutos = finMin - inicioMin;
    const totalHoras = totalMinutos / 60;

    let diurnas = 0;
    let nocturnas = 0;

    // Recorremos minuto a minuto para desglosar Diurno (06:00 a 19:00 -> 360 a 1140 min)
    for (let m = inicioMin; m < finMin; m++) {
      const minDelDia = m % (24 * 60);
      if (minDelDia >= 360 && minDelDia < 1140) {
        diurnas += 1 / 60;
      } else {
        nocturnas += 1 / 60;
      }
    }

    const montoDiurno = diurnas * (valorHoraNormal * 2.0); // 100% recargo
    const montoNocturno = nocturnas * (valorHoraNormal * 2.25); // 125% recargo
    const montoTotalCalc = montoDiurno + montoNocturno;

    return { totalHoras, diurnas, nocturnas, montoDiurno, montoNocturno, montoTotal: montoTotalCalc };
  };

  const desgloseHoras = calcularDesgloseHoras();

  // Cálculo de tardanza
  const minTard = parseFloat(minutosTardia) || 0;
  const montoProporcionalTardia = (valorHoraNormal / 60) * minTard;
  const montoTardiaEstimado = montoProporcionalTardia + (aplicaSeptimoDia ? valorDiaNormal : 0);

  const handleSubmitNovedad = async (e) => {
    e.preventDefault();
    setErrorNovedad(null);
    setSuccessNovedad(null);

    try {
      setSubmittingNovedad(true);
      let montoCalculado = 0;

      if (tipoNovedad === 'HORA_EXTRA') {
        montoCalculado = desgloseHoras.montoTotal;
      } else if (tipoNovedad === 'LLEGADA_TARDIA') {
        montoCalculado = -montoTardiaEstimado;
      } else {
        montoCalculado = parseFloat(montoDirecto) || 0;
        if (tipoNovedad === 'FALTA_INJUSTIFICADA') montoCalculado = -Math.abs(montoCalculado);
      }

      await api.crearNovedadEmpleado({
        empleado_id: empleado.id,
        tipo_novedad: tipoNovedad,
        fecha: fechaNovedad,
        monto_total: montoCalculado,
        observaciones: observacionNovedad
      });

      setSuccessNovedad("Novedad registrada exitosamente.");
      setFechaNovedad('');
      setMinutosTardia('');
      setMontoDirecto('');
      setObservacionNovedad('');
    } catch (err) {
      setErrorNovedad(err.message || "Error al registrar la novedad.");
    } finally {
      setSubmittingNovedad(false);
    }
  };

  const handleCargarCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const contenido = evt.target.result;
        const { resultados, errores } = parsearCSVNovedades(contenido);
        if (errores.length > 0) {
          setErrorNovedad(errores.join(" "));
          return;
        }

        // Enviar resultados masivos
        await api.crearNovedadesMasivas(resultados);
        setSuccessNovedad(`Se cargaron ${resultados.length} novedades desde el archivo CSV correctamente.`);
      } catch (err) {
        setErrorNovedad(err.message);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const data = await api.getPrestamosEmpleado(empleado.id);
      setPrestamos(data);
    } catch (err) {
      setError("No se pudieron cargar los préstamos actuales.");
    } finally {
      setLoading(false);
    }
  };

  const prestamosActivos = prestamos.filter(p => p.estado === 'Activo' || parseFloat(p.saldo_pendiente) > 0);
  const cuotaActualTotal = prestamosActivos.reduce((sum, p) => sum + parseFloat(p.cuota_periodica), 0);
  const nuevaCuota = parseFloat(cuotaPeriodica) || 0;
  const sumaProyectada = cuotaActualTotal + nuevaCuota;
  const excedeLimite = tipoPrestamo !== 'Embargo Judicial' && sumaProyectada > limiteLegal;

  const handleSubmitDescuento = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (excedeLimite) {
      setError(`La cuota excede el límite legal del 20% ($${limiteLegal.toFixed(2)}).`);
      return;
    }

    try {
      setSubmitting(true);
      await api.crearPrestamoEmpleado({
        empleado_id: empleado.id,
        tipo_prestamo: tipoPrestamo,
        monto_total: parseFloat(montoTotal),
        saldo_pendiente: parseFloat(montoTotal),
        cuota_periodica: parseFloat(cuotaPeriodica),
        entidad: entidad || null,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        estado: "Activo"
      });
      setSuccess("Descuento programado correctamente.");
      setMontoTotal('');
      setCuotaPeriodica('');
      setEntidad('');
      setFechaInicio('');
      setFechaFin('');
      fetchPrestamos(); // Recargar tabla
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={24} className="text-blue-600" />
          Finanzas de Empleado
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          {empleado.primer_nombre} {empleado.primer_apellido} - Salario Base: ${salarioNominal.toFixed(2)}
        </p>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <button 
            style={{ 
              padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'descuentos' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'descuentos' ? '#2563eb' : 'var(--text-muted)',
              fontWeight: activeTab === 'descuentos' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('descuentos')}
          >
            Préstamos y Descuentos Fijos
          </button>
          <button 
            style={{ 
              padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'novedades' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'novedades' ? '#2563eb' : 'var(--text-muted)',
              fontWeight: activeTab === 'novedades' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('novedades')}
          >
            Novedades Ocasionales
          </button>
        </div>

        {activeTab === 'descuentos' && (
          <div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <Calculator className="text-blue-600" size={24} />
              <div style={{ flex: 1, fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Límite Legal 20% (Art. 136):</span>
                  <strong>${limiteLegal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#dc2626' }}>
                  <span>Cuotas Activas:</span>
                  <strong>-${cuotaActualTotal.toFixed(2)}</strong>
                </div>
                <div style={{ borderTop: '1px solid #cbd5e1', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Disponible para cuotas:</span>
                  <span style={{ color: (limiteLegal - cuotaActualTotal) < 0 ? '#dc2626' : '#16a34a' }}>
                    ${(limiteLegal - cuotaActualTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {error && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}
            {success && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontSize: '0.875rem' }}>{success}</div>}

            <form onSubmit={handleSubmitDescuento} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo de Descuento</label>
                  <select className="form-control" value={tipoPrestamo} onChange={e => setTipoPrestamo(e.target.value)}>
                    <option value="Interno">Préstamo Interno</option>
                    <option value="Bancario">Préstamo Bancario / Comercial</option>
                    <option value="Anticipo">Anticipo Salarial</option>
                    <option value="Embargo Judicial">Embargo Judicial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Entidad / Institución</label>
                  <input type="text" className="form-control" placeholder="Ej. Banco Agrícola, Procuraduría..." value={entidad} onChange={e => setEntidad(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Fecha Fin (Opcional)</label>
                  <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Monto Total ($)</label>
                  <input type="number" step="0.01" min="0.01" className="form-control" required value={montoTotal} onChange={e => setMontoTotal(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Cuota por Planilla ($)</label>
                <input 
                  type="number" step="0.01" min="0.01" 
                  className="form-control" required 
                  value={cuotaPeriodica} onChange={e => setCuotaPeriodica(e.target.value)} 
                  style={{ borderColor: excedeLimite ? '#dc2626' : '' }}
                />
                {excedeLimite && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <AlertCircle size={14} /> La cuota excede el 20% legal (Excepto Embargos).
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-outline">Cerrar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || excedeLimite || !salarioNominal}>
                  {submitting ? 'Guardando...' : 'Programar Descuento'}
                </button>
              </div>
            </form>

            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Historial y Descuentos del Empleado</h4>
            {loading ? <p>Cargando...</p> : (
              prestamos.length === 0 ? <p className="text-muted" style={{ fontSize: '0.875rem' }}>Hasta el momento no posee descuentos ni préstamos registrados.</p> :
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Tipo</th>
                    <th style={{ padding: '0.5rem' }}>Entidad</th>
                    <th style={{ padding: '0.5rem' }}>Monto Total</th>
                    <th style={{ padding: '0.5rem' }}>Saldo Pendiente</th>
                    <th style={{ padding: '0.5rem' }}>Cuota</th>
                    <th style={{ padding: '0.5rem' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: '500' }}>{p.tipo_prestamo}</td>
                      <td style={{ padding: '0.5rem' }}>{p.entidad || '-'}</td>
                      <td style={{ padding: '0.5rem' }}>${p.monto_total}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>${p.saldo_pendiente}</td>
                      <td style={{ padding: '0.5rem', color: '#dc2626', fontWeight: '500' }}>-${p.cuota_periodica}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          backgroundColor: (p.estado === 'Activo' || parseFloat(p.saldo_pendiente) > 0) ? '#DBEAFE' : '#F1F5F9',
                          color: (p.estado === 'Activo' || parseFloat(p.saldo_pendiente) > 0) ? '#1D4ED8' : '#475569'
                        }}>
                          {(p.estado === 'Activo' || parseFloat(p.saldo_pendiente) > 0) ? 'Activo' : 'Pagado / Amortizado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'novedades' && (
          <div>
            {periodoActivo === false && (
              <div style={{ background: '#fffbebfb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400e' }}>
                <AlertCircle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
                <div style={{ fontSize: '0.875rem' }}>
                  <strong>⚠️ No hay ninguna planilla abierta:</strong> Para poder registrar novedades u horas extras, primero debes aperturar un nuevo período de planilla en el módulo de <strong>Planillas</strong>.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <button 
                type="button" 
                onClick={() => setShowBaseLegal(true)} 
                className="btn btn-outline" 
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#2563eb', color: '#2563eb' }}
              >
                <Scale size={16} /> ⚖️ Ver Base Legal (Art. 51, 132, 169)
              </button>

              <button 
                type="button" 
                onClick={() => fileCsvRef.current?.click()} 
                className="btn btn-outline" 
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <UploadCloud size={16} /> Cargar CSV Masivo
              </button>
              <input type="file" accept=".csv" ref={fileCsvRef} style={{ display: 'none' }} onChange={handleCargarCSV} />
            </div>

            {errorNovedad && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '0.875rem' }}>{errorNovedad}</div>}
            {successNovedad && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontSize: '0.875rem' }}>{successNovedad}</div>}

            <form onSubmit={handleSubmitNovedad} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Tipo de Novedad</label>
                <select className="form-control" value={tipoNovedad} onChange={e => setTipoNovedad(e.target.value)}>
                  <option value="HORA_EXTRA">Horas Extras (Cálculo por Horario)</option>
                  <option value="LLEGADA_TARDIA">Llegada Tardía (Minutos no trabajados - Art. 51)</option>
                  <option value="ASUETO_TRABAJADO">Día de Asueto / Festivo Trabajado (Art. 192 - 100% Recargo)</option>
                  <option value="FALTA_INJUSTIFICADA">Inasistencia / Ausencia Injustificada (Descuento)</option>
                  <option value="BONIFICACION">Bonificación / Comisión Ocasional</option>
                </select>
              </div>

              {tipoNovedad === 'HORA_EXTRA' && (
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Fecha</label>
                      <input type="date" className="form-control" required value={fechaNovedad} onChange={e => setFechaNovedad(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Hora Inicio</label>
                      <input type="time" className="form-control" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Hora Fin</label>
                      <input type="time" className="form-control" required value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                    </div>
                  </div>

                  {desgloseHoras.totalHoras > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#1e40af', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Total Horas Laboradas:</span> <strong>{desgloseHoras.totalHoras.toFixed(2)} hrs</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Horas Diurnas (100% Recargo / Art. 169):</span> <span>{desgloseHoras.diurnas.toFixed(2)} hrs (${desgloseHoras.montoDiurno.toFixed(2)})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Horas Nocturnas (125% Recargo / Art. 168):</span> <span>{desgloseHoras.nocturnas.toFixed(2)} hrs (${desgloseHoras.montoNocturno.toFixed(2)})</span>
                      </div>
                      <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.25rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Monto Estimado a Pagar:</span> <span style={{ color: '#16a34a' }}>+${desgloseHoras.montoTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tipoNovedad === 'LLEGADA_TARDIA' && (
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Fecha</label>
                      <input type="date" className="form-control" required value={fechaNovedad} onChange={e => setFechaNovedad(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Minutos de Retraso</label>
                      <input type="number" min="1" className="form-control" required placeholder="Ej. 30" value={minutosTardia} onChange={e => setMinutosTardia(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
                    <input 
                      type="checkbox" 
                      id="septimo" 
                      checked={aplicaSeptimoDia} 
                      onChange={e => setAplicaSeptimoDia(e.target.checked)} 
                    />
                    <label htmlFor="septimo" style={{ fontSize: '0.85rem', color: '#991b1b', cursor: 'pointer', fontWeight: '600' }}>
                      Aplica Pérdida del 7° Día por faltas/tardanzas acumuladas (Art. 132 MTPS)
                    </label>
                  </div>

                  {montoTardiaEstimado > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#991b1b', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                      Monto a descontar (Proporcional + 7° Día si aplica): <strong>-${montoTardiaEstimado.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              )}

              {(tipoNovedad === 'ASUETO_TRABAJADO' || tipoNovedad === 'FALTA_INJUSTIFICADA' || tipoNovedad === 'BONIFICACION') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input type="date" className="form-control" required value={fechaNovedad} onChange={e => setFechaNovedad(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Monto en USD ($)</label>
                    <input type="number" step="0.01" min="0.01" className="form-control" required placeholder="0.00" value={montoDirecto} onChange={e => setMontoDirecto(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Observaciones / Justificación (Opcional)</label>
                <input type="text" className="form-control" placeholder="Ej. Aprobado por jefatura..." value={observacionNovedad} onChange={e => setObservacionNovedad(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={onClose} className="btn btn-outline">Cerrar</button>
                <button type="submit" className="btn btn-primary" disabled={submittingNovedad}>
                  {submittingNovedad ? 'Guardando...' : 'Registrar Novedad'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showBaseLegal && <BaseLegalModal onClose={() => setShowBaseLegal(false)} />}
    </div>
  );
}
