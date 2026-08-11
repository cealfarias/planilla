import React, { useState, useEffect } from 'react';
import { 
  X, FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, 
  Sparkles, FileText, ArrowRight, Link2, Eye, ShieldCheck, Zap
} from 'lucide-react';
import { api } from '../services/api';

const SYSTEM_FIELDS = [
  { id: 'primer_nombre', label: 'Primer Nombre *', keyMatches: ['primer_nombre', 'nombre', 'nombres', 'nombre_completo', 'first_name'] },
  { id: 'primer_apellido', label: 'Primer Apellido *', keyMatches: ['primer_apellido', 'apellido', 'apellidos', 'last_name'] },
  { id: 'dui', label: 'DUI (Documento Único) *', keyMatches: ['dui', 'documento', 'identificacion', 'cedula'] },
  { id: 'nit', label: 'NIT', keyMatches: ['nit', 'registro_fiscal', 'tax_id'] },
  { id: 'cargo', label: 'Cargo / Puesto', keyMatches: ['cargo', 'puesto', 'posicion', 'job_title', 'rol'] },
  { id: 'salario_base', label: 'Salario Base ($USD) *', keyMatches: ['salario_base', 'salario', 'sueldo', 'devengado', 'salary', 'monto'] },
  { id: 'departamento_costo', label: 'Depto. Contable', keyMatches: ['departamento_costo', 'departamento', 'depto', 'centro_costo', 'area'] },
  { id: 'isss', label: 'Número ISSS', keyMatches: ['isss', 'num_isss', 'seguro_social'] },
  { id: 'nup_afp', label: 'NUP AFP', keyMatches: ['nup_afp', 'nup', 'afp', 'num_afp'] }
];

export default function ImportarEmpleadosModal({ isOpen, onClose, onSuccess }) {
  const [csvContent, setCsvContent] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleDownloadPlantilla = async () => {
    try {
      const blob = await api.downloadPlantillaEmpleados();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Importacion_Empleados_El_Salvador.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Error descargando plantilla: " + err.message);
    }
  };

  const processCSVText = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setCsvHeaders([]);
      setRawRows([]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    setCsvHeaders(headers);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      rows.push(obj);
    }
    setRawRows(rows);

    // Mapeo automático inteligente (Auto-Matching)
    const initialMapping = {};
    SYSTEM_FIELDS.forEach(sysField => {
      const matchedHeader = headers.find(h => {
        const hLower = h.toLowerCase().replace(/[^a-z0-9_]/g, '');
        return sysField.keyMatches.some(m => hLower.includes(m));
      });

      if (matchedHeader) {
        initialMapping[sysField.id] = matchedHeader;
      } else {
        initialMapping[sysField.id] = '';
      }
    });

    setFieldMapping(initialMapping);
    setResult(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvContent(text);
      processCSVText(text);
    };
    reader.readAsText(file);
  };

  const handleTextPaste = (e) => {
    const text = e.target.value;
    setCsvContent(text);
    processCSVText(text);
  };

  const handleMapChange = (sysFieldId, selectedCsvHeader) => {
    setFieldMapping(prev => ({
      ...prev,
      [sysFieldId]: selectedCsvHeader
    }));
  };

  // Construir registros mapeados listos para importar
  const getMappedData = () => {
    return rawRows.map(row => {
      const mapped = {};
      SYSTEM_FIELDS.forEach(sysField => {
        const csvHeader = fieldMapping[sysField.id];
        mapped[sysField.id] = csvHeader ? row[csvHeader] : '';
      });
      return mapped;
    });
  };

  const mappedData = getMappedData();

  const handleImportar = async () => {
    if (mappedData.length === 0) {
      alert("No hay registros válidos para importar");
      return;
    }

    try {
      setLoading(true);
      const res = await api.importarEmpleadosMasivo(mappedData);
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error importando colaboradores: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        maxHeight: '94vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#0F172A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#16A34A', padding: '0.55rem', borderRadius: '10px', display: 'flex' }}>
              <FileSpreadsheet size={24} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                Importador & Mapeador Visual de Colaboradores (Excel / CSV)
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Conecta las columnas de cualquier archivo Excel/CSV con los campos del sistema de forma interactiva.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Paso 1: Descarga Plantilla */}
          <div style={{ padding: '1rem 1.25rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#166534', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Paso 1: Descarga la Plantilla Ejemplo (Opcional)
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#15803D' }}>
                Descarga el archivo preformateado con las columnas de <strong>Nombres, Apellidos, DUI, NIT, ISSS, AFP, Cargo, Salario Base y Departamento Contable</strong>.
              </p>
            </div>

            <button
              onClick={handleDownloadPlantilla}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#16A34A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Download size={15} /> Descargar Plantilla CSV
            </button>
          </div>

          {/* Paso 2: Cargar Archivo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>
                Paso 2A: Cargar Archivo `.csv` o `.txt`
              </label>
              <input
                type="file"
                accept=".csv, .txt"
                onChange={handleFileUpload}
                style={{ width: '100%', padding: '0.5rem', border: '1px dashed #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', backgroundColor: '#F8FAFC' }}
              />
              {fileName && <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 'bold', display: 'block', marginTop: '0.25rem' }}>✓ Archivo cargado: {fileName}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>
                Paso 2B: O Pega el Texto CSV Directo de Excel
              </label>
              <textarea
                rows={3}
                placeholder="Pega aquí el contenido copiado de tu hoja de Excel..."
                value={csvContent}
                onChange={handleTextPaste}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Paso 3: MAPEADOR VISUAL INTERACTIVO DE COLUMNAS */}
          {csvHeaders.length > 0 && (
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Link2 size={18} color="#2563EB" /> 🔗 Mapeador Visual Interactivo de Columnas
                </h4>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold' }}>
                  {csvHeaders.length} Columnas Detectadas en el Archivo
                </span>
              </div>

              <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#64748B' }}>
                Relaciona cada campo requerido por nuestro sistema con la columna correspondiente de tu archivo importado:
              </p>

              {/* Grid Mapeador */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {SYSTEM_FIELDS.map(field => {
                  const currentMappedHeader = fieldMapping[field.id] || '';
                  const sampleValue = rawRows.length > 0 && currentMappedHeader ? rawRows[0][currentMappedHeader] : '';

                  return (
                    <div 
                      key={field.id} 
                      style={{ 
                        padding: '0.75rem', 
                        backgroundColor: currentMappedHeader ? '#F0FDF4' : 'white', 
                        border: currentMappedHeader ? '1px solid #86EFAC' : '1px solid #E2E8F0', 
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: field.id.includes('*') || field.label.includes('*') ? '#0F172A' : '#475569' }}>
                          {field.label}
                        </span>
                        {currentMappedHeader && <CheckCircle2 size={14} color="#16A34A" />}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 'bold' }}>➔</span>
                        <select
                          value={currentMappedHeader}
                          onChange={(e) => handleMapChange(field.id, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.4rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.78rem',
                            fontWeight: currentMappedHeader ? 'bold' : 'normal',
                            color: currentMappedHeader ? '#0F172A' : '#94A3B8'
                          }}
                        >
                          <option value="">-- Seleccionar Columna del CSV --</option>
                          {csvHeaders.map(h => (
                            <option key={h} value={h}>
                              Columna: "{h}"
                            </option>
                          ))}
                        </select>
                      </div>

                      {sampleValue && (
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={12} color="#16A34A" /> Ejemplo Fila 1: <strong style={{ color: '#15803D' }}>"{sampleValue}"</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paso 4: Vista Previa */}
          {mappedData.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#0F172A' }}>
                  Vista Previa Resultante ({mappedData.length} Colaboradores listos)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 'bold' }}>
                  ✓ Campos Vinculados
                </span>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#F1F5F9', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '0.5rem' }}>#</th>
                      <th style={{ padding: '0.5rem' }}>Nombre Completo</th>
                      <th style={{ padding: '0.5rem' }}>DUI</th>
                      <th style={{ padding: '0.5rem' }}>Cargo</th>
                      <th style={{ padding: '0.5rem' }}>Depto. Contable</th>
                      <th style={{ padding: '0.5rem' }}>Salario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#64748B' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#0F172A' }}>
                          {row.primer_nombre} {row.primer_apellido}
                        </td>
                        <td style={{ padding: '0.5rem' }}>{row.dui || 'N/A'}</td>
                        <td style={{ padding: '0.5rem' }}>{row.cargo || 'Colaborador'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 'bold' }}>
                            {row.departamento_costo || 'Administrativo'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#15803D' }}>
                          ${parseFloat(row.salario_base || 365).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resultado de la importación */}
          {result && (
            <div style={{ padding: '1rem', backgroundColor: result.importados > 0 ? '#F0FDF4' : '#FFFBEB', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
              <h5 style={{ margin: '0 0 0.3rem 0', color: '#166534', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} /> Importación Procesada
              </h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803D' }}>
                {result.mensaje}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1rem 1.75rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.55rem 1.25rem', backgroundColor: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.825rem', cursor: 'pointer' }}
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleImportar}
            disabled={loading || mappedData.length === 0}
            style={{ padding: '0.55rem 1.5rem', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.825rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
          >
            <ArrowRight size={16} /> {loading ? 'Importando...' : `Procesar e Importar ${mappedData.length} Colaboradores`}
          </button>
        </div>

      </div>
    </div>
  );
}
