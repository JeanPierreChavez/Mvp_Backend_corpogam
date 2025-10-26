import pool from "../config/bd.js";

class EtapaModel {
  // Obtener todos los animales con su etapa calculada
  static async obtenerAnimalesPorEtapa() {
    const result = await pool.query(`
      SELECT 
        id_animal,
        codigo_animal,
        alias,
        sexo,
        fecha_nacimiento,
        edad_en_meses,
        ultimo_peso,
        estado,
        nombre_finca,
        etapa_actual
      FROM vista_animal_completa
      WHERE estado = 'VIVO'
      ORDER BY etapa_actual, edad_en_meses DESC
    `);
    return result.rows;
  }

  // Obtener animales filtrados por una etapa específica
  static async obtenerPorEtapa(etapa) {
    const result = await pool.query(
      `SELECT 
        id_animal,
        codigo_animal,
        alias,
        sexo,
        fecha_nacimiento,
        edad_en_meses,
        ultimo_peso,
        estado,
        nombre_finca,
        etapa_actual
      FROM vista_animal_completa
      WHERE etapa_actual = $1 AND estado = 'VIVO'
      ORDER BY edad_en_meses DESC`,
      [etapa]
    );
    return result.rows;
  }

  // Obtener resumen estadístico por etapas
  static async obtenerEstadisticasPorEtapa() {
    const result = await pool.query(`
      SELECT 
        etapa_actual,
        COUNT(*) as total_animales,
        COUNT(CASE WHEN sexo = 'H' THEN 1 END) as hembras,
        COUNT(CASE WHEN sexo = 'M' THEN 1 END) as machos,
        ROUND(AVG(edad_en_meses), 2) as edad_promedio_meses,
        ROUND(AVG(ultimo_peso), 2) as peso_promedio,
        MIN(edad_en_meses) as edad_minima,
        MAX(edad_en_meses) as edad_maxima
      FROM vista_animal_completa
      WHERE estado = 'VIVO'
      GROUP BY etapa_actual
      ORDER BY 
        CASE etapa_actual
          WHEN 'Lactante' THEN 1
          WHEN 'Cría' THEN 2
          WHEN 'Crecimiento' THEN 3
          WHEN 'Vaca' THEN 4
          WHEN 'Toro' THEN 5
          ELSE 6
        END
    `);
    return result.rows;
  }

  // Obtener animales próximos a cambiar de etapa
  static async obtenerProximosCambioEtapa() {
    const result = await pool.query(`
      SELECT 
        id_animal,
        codigo_animal,
        alias,
        sexo,
        edad_en_meses,
        etapa_actual,
        CASE 
          WHEN etapa_actual = 'Lactante' THEN 3 - edad_en_meses
          WHEN etapa_actual = 'Cría' THEN 6 - edad_en_meses
          WHEN etapa_actual = 'Crecimiento' THEN 12 - edad_en_meses
          ELSE NULL
        END as meses_para_cambio,
        CASE 
          WHEN etapa_actual = 'Lactante' THEN 'Cría'
          WHEN etapa_actual = 'Cría' THEN 'Crecimiento'
          WHEN etapa_actual = 'Crecimiento' AND sexo = 'H' THEN 'Vaca'
          WHEN etapa_actual = 'Crecimiento' AND sexo = 'M' THEN 'Toro'
          ELSE 'N/A'
        END as proxima_etapa
      FROM vista_animal_completa
      WHERE estado = 'VIVO'
        AND etapa_actual IN ('Lactante', 'Cría', 'Crecimiento')
      ORDER BY meses_para_cambio ASC
    `);
    return result.rows;
  }

  // Obtener listado de etapas disponibles
  static async obtenerCatalogoEtapas() {
    const result = await pool.query(`
      SELECT DISTINCT etapa_actual as nombre_etapa
      FROM vista_animal_completa
      WHERE estado = 'VIVO'
      ORDER BY 
        CASE etapa_actual
          WHEN 'Lactante' THEN 1
          WHEN 'Cría' THEN 2
          WHEN 'Crecimiento' THEN 3
          WHEN 'Vaca' THEN 4
          WHEN 'Toro' THEN 5
          ELSE 6
        END
    `);
    return result.rows;
  }

  // Obtener animales por rango de edad
  static async obtenerPorRangoEdad(edad_min, edad_max) {
    const result = await pool.query(
      `SELECT 
        id_animal,
        codigo_animal,
        alias,
        sexo,
        fecha_nacimiento,
        edad_en_meses,
        ultimo_peso,
        estado,
        nombre_finca,
        etapa_actual
      FROM vista_animal_completa
      WHERE estado = 'VIVO'
        AND edad_en_meses BETWEEN $1 AND $2
      ORDER BY edad_en_meses DESC`,
      [edad_min, edad_max]
    );
    return result.rows;
  }

  // Obtener comparativa de pesos por etapa
  static async obtenerComparativaPesos() {
    const result = await pool.query(`
      SELECT 
        etapa_actual,
        ROUND(AVG(ultimo_peso), 2) as peso_promedio,
        ROUND(MIN(ultimo_peso), 2) as peso_minimo,
        ROUND(MAX(ultimo_peso), 2) as peso_maximo,
        COUNT(CASE WHEN ultimo_peso IS NOT NULL THEN 1 END) as animales_con_peso
      FROM vista_animal_completa
      WHERE estado = 'VIVO'
      GROUP BY etapa_actual
      ORDER BY 
        CASE etapa_actual
          WHEN 'Lactante' THEN 1
          WHEN 'Cría' THEN 2
          WHEN 'Crecimiento' THEN 3
          WHEN 'Vaca' THEN 4
          WHEN 'Toro' THEN 5
          ELSE 6
        END
    `);
    return result.rows;
  }
}

export default EtapaModel;