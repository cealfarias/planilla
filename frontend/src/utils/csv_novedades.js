// Parser y Validador de Novedades CSV para El Salvador

export function parsearCSVNovedades(textoCSV) {
  const lineas = textoCSV.split(/\r?\n/).filter(linea => linea.trim() !== '');
  if (lineas.length <= 1) {
    throw new Error("El archivo CSV está vacío o solo contiene la línea de encabezados.");
  }

  const encabezados = lineas[0].toLowerCase().split(',').map(h => h.trim());
  const resultados = [];
  const errores = [];

  for (let i = 1; i < lineas.length; i++) {
    const valores = lineas[i].split(',').map(v => v.trim());
    if (valores.length < 2) continue;

    const filaNum = i + 1;
    const item = {
      codigo_empleado: valores[0] || '',
      fecha: valores[1] || '',
      hora_inicio: valores[2] || '',
      hora_fin: valores[3] || '',
      tipo_novedad: (valores[4] || '').toUpperCase(),
      minutos_tardia: parseInt(valores[5]) || 0,
      observaciones: valores[6] || ''
    };

    if (!item.codigo_empleado) {
      errores.push(`Fila ${filaNum}: Falta el código de empleado.`);
      continue;
    }

    if (!item.tipo_novedad) {
      errores.push(`Fila ${filaNum}: Falta el tipo de novedad.`);
      continue;
    }

    resultados.push(item);
  }

  return { resultados, errores };
}
