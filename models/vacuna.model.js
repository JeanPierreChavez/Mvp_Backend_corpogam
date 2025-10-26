import pool from "../config/bd.js";

class VacunaModel {
  // Obtener todas las vacunas del catálogo
  static async obtenerCatalogoVacunas() {
    const result = await pool.query(
      "SELECT id_vacuna, nombre, descripcion FROM vacuna ORDER BY nombre"
    );
    return result.rows;
  }

  // Crear nueva vacuna en el catálogo
  static async crearVacuna(nombre, descripcion) {
    const result = await pool.query(
      "INSERT INTO vacuna (nombre, descripcion) VALUES ($1, $2) RETURNING *",
      [nombre, descripcion]
    );
    return result.rows[0];
  }

  // Registrar vacuna aplicada a un animal
  static async registrarVacunaAplicada(datos) {
    const { id_animal, id_vacuna, fecha_aplicacion, proxima_dosis } = datos;
    const result = await pool.query(
      `INSERT INTO vacunas_animales (id_animal, id_vacuna, fecha_aplicacion, proxima_dosis)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_animal, id_vacuna, fecha_aplicacion, proxima_dosis]
    );
    return result.rows[0];
  }

  // Listar todas las vacunas aplicadas con estado
  static async listarVacunasAplicadas() {
    const result = await pool.query(`
      SELECT 
        va.id_vacuna_animal,
        va.fecha_aplicacion,
        va.proxima_dosis,
        va.id_animal,
        a.codigo_animal,
        a.alias,
        v.id_vacuna,
        v.nombre AS nombre_vacuna,
        v.descripcion,
        CASE
          WHEN va.proxima_dosis IS NULL THEN 'Sin fecha'
          WHEN va.proxima_dosis > CURRENT_DATE + INTERVAL '2 months' THEN 'A tiempo'
          WHEN va.proxima_dosis BETWEEN CURRENT_DATE + INTERVAL '1 month' AND CURRENT_DATE + INTERVAL '2 months' THEN 'Próximo'
          WHEN va.proxima_dosis <= CURRENT_DATE THEN 'Urgente'
          ELSE 'A tiempo'
        END AS estado_vacunacion
      FROM vacunas_animales va
      INNER JOIN animal a ON a.id_animal = va.id_animal
      INNER JOIN vacuna v ON v.id_vacuna = va.id_vacuna
      ORDER BY va.proxima_dosis ASC NULLS LAST;
    `);
    return result.rows;
  }

  // Obtener vacunas de un animal específico
  static async obtenerVacunasPorAnimal(id_animal) {
    const result = await pool.query(
      `SELECT 
        va.id_vacuna_animal,
        va.fecha_aplicacion,
        va.proxima_dosis,
        v.nombre AS nombre_vacuna,
        v.descripcion,
        CASE
          WHEN va.proxima_dosis IS NULL THEN 'Sin fecha'
          WHEN va.proxima_dosis > CURRENT_DATE + INTERVAL '2 months' THEN 'A tiempo'
          WHEN va.proxima_dosis BETWEEN CURRENT_DATE + INTERVAL '1 month' AND CURRENT_DATE + INTERVAL '2 months' THEN 'Próximo'
          WHEN va.proxima_dosis <= CURRENT_DATE THEN 'Urgente'
          ELSE 'A tiempo'
        END AS estado_vacunacion
      FROM vacunas_animales va
      INNER JOIN vacuna v ON v.id_vacuna = va.id_vacuna
      WHERE va.id_animal = $1
      ORDER BY va.fecha_aplicacion DESC`,
      [id_animal]
    );
    return result.rows;
  }

  // Actualizar fecha de próxima dosis
  static async actualizarProximaDosis(id_vacuna_animal, proxima_dosis) {
    const result = await pool.query(
      `UPDATE vacunas_animales 
       SET proxima_dosis = $1 
       WHERE id_vacuna_animal = $2 
       RETURNING *`,
      [proxima_dosis, id_vacuna_animal]
    );
    return result.rows[0];
  }

  // Eliminar registro de vacuna aplicada
  static async eliminarVacunaAplicada(id_vacuna_animal) {
    const result = await pool.query(
      "DELETE FROM vacunas_animales WHERE id_vacuna_animal = $1 RETURNING *",
      [id_vacuna_animal]
    );
    return result.rows[0];
  }

  // Obtener vacunas urgentes (vencidas o próximas a vencer)
  static async obtenerVacunasUrgentes() {
    const result = await pool.query(`
      SELECT 
        va.id_vacuna_animal,
        va.fecha_aplicacion,
        va.proxima_dosis,
        a.codigo_animal,
        a.alias,
        v.nombre AS nombre_vacuna,
        CASE
          WHEN va.proxima_dosis <= CURRENT_DATE THEN 'Urgente'
          ELSE 'Próximo'
        END AS estado_vacunacion,
        CURRENT_DATE - va.proxima_dosis AS dias_vencido
      FROM vacunas_animales va
      INNER JOIN animal a ON a.id_animal = va.id_animal
      INNER JOIN vacuna v ON v.id_vacuna = va.id_vacuna
      WHERE va.proxima_dosis <= CURRENT_DATE + INTERVAL '1 month'
      ORDER BY va.proxima_dosis ASC;
    `);
    return result.rows;
  }

  // Obtener vacunas agrupadas por estado (semáforo)
  static async obtenerVacunasPorEstado() {
    const result = await pool.query(`
      SELECT 
        va.id_vacuna_animal,
        va.fecha_aplicacion,
        va.proxima_dosis,
        a.codigo_animal,
        a.alias,
        v.nombre AS nombre_vacuna,
        CASE
          WHEN va.proxima_dosis IS NULL THEN 'SIN_FECHA'
          WHEN va.proxima_dosis < CURRENT_DATE THEN 'VENCIDO'
          WHEN va.proxima_dosis BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 'PROXIMO'
          WHEN va.proxima_dosis > CURRENT_DATE + INTERVAL '30 days' THEN 'A_TIEMPO'
          ELSE 'A_TIEMPO'
        END AS estado
      FROM vacunas_animales va
      INNER JOIN animal a ON a.id_animal = va.id_animal
      INNER JOIN vacuna v ON v.id_vacuna = va.id_vacuna
      WHERE a.estado = 'VIVO'
      ORDER BY 
        CASE 
          WHEN va.proxima_dosis < CURRENT_DATE THEN 1
          WHEN va.proxima_dosis BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 2
          ELSE 3
        END,
        va.proxima_dosis ASC NULLS LAST;
    `);
    
    // Agrupar resultados por estado
    const agrupado = {
      a_tiempo: result.rows.filter(v => v.estado === 'A_TIEMPO'),
      proximo: result.rows.filter(v => v.estado === 'PROXIMO'),
      vencido: result.rows.filter(v => v.estado === 'VENCIDO')
    };
    
    return agrupado;
  }
}

export default VacunaModel;