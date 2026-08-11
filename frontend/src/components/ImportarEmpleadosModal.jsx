import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ImportarEmpleadosModal({ isOpen, onClose, onSuccess }) {
  const [csvContent, setCsvContent] = useState('');
  const [parsedData, setParsedData] = useState([]);
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

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
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

    return rows;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvContent(text);
      const parsed = parseCSV(text);
      setParsedData(parsed);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleTextPaste = (e) => {
    const text = e.target.value;
    setCsvContent(text);
    const parsed = parseCSV(text);
    setParsedData(parsed);
    setResult(null);
  };

  const handleImportar = async () => {
    if (parsedData.length === 0) {
      alert("No hay registros válidos para importar");
      return;
    }

    try {
      setLoading(true);
      const res = await api.importarEmpleadosMasivo(parsedData);
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
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '920px',
        width: '100%',
        maxHeight: '92vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
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
            <div style={{ backgroundColor: '#16A34A', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
              <FileSpreadsheet size={24} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                Importación Masiva de Colaboradores (Excel / CSV)
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                Carga tu nómina desde Excel o CSV e importa 50+ colaboradores en 1 clic.
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

        {/* Content Body */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Step 1: Descargar Plantilla */}
          <div style={{ padding: '1rem 1.25rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#166534', fontSize: '0.9rem', fontWeight: 'bold' }}>
                paso 1: Descarga la Plantilla Excel / CSV Oficial
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#15803D' }}>
                Descarga el archivo preformateado con las columnas de DUI, NIT, ISSS, AFP, Salario y Departamentos Contables.
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

          {/* Step 2: Cargar Archivo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>
                Paso 2A: Subir Archivo `.csv` o `.txt`
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
                Paso 2B: O Pega el Texto CSV Directo
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

          {/* Step 3: Vista Previa */}
          {parsedData.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#0F172A' }}>
                  Vista Previa ({parsedData.length} Colaboradores Detectados)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 'bold' }}>
                  ✓ Listo para importar
                </span>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
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
                    {parsedData.map((row, idx) => (
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
            disabled={loading || parsedData.length === 0}
            style={{ padding: '0.55rem 1.5rem', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.825rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
          >
            <ArrowRight size={16} /> {loading ? 'Importando...' : `Procesar e Importar ${parsedData.length} Colaboradores`}
          </button>
        </div>

      </div>
    </div>
  );
}
