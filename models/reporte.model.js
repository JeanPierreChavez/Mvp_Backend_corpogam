import pool from "../config/bd.js";

class FichaAnimalModel {
  static async obtenerDatosCompletos(id_animal) {
    // Obtener datos del animal con madre y padre
    const animalQuery = await pool.query(
      `SELECT 
        a.id_animal,
        a.codigo_animal,
        a.alias,
        a.sexo,
        a.fecha_nacimiento,
        a.raza,
        a.color,
        a.estado,
        a.arete_numero,
        a.chip_rfid,
        f.nombre AS nombre_finca,
        madre.codigo_animal AS codigo_madre,
        madre.alias AS nombre_madre,
        padre.codigo_animal AS codigo_padre,
        padre.alias AS nombre_padre,
        v.edad_en_meses,
        v.etapa_actual,
        v.ultimo_peso
      FROM animal a
      LEFT JOIN finca f ON a.id_finca = f.id_finca
      LEFT JOIN animal madre ON a.id_madre = madre.id_animal
      LEFT JOIN animal padre ON a.id_padre = padre.id_animal
      LEFT JOIN vista_animal_completa v ON a.id_animal = v.id_animal
      WHERE a.id_animal = $1`,
      [id_animal]
    );

    if (animalQuery.rows.length === 0) {
      return null;
    }

    const animal = animalQuery.rows[0];

    // Obtener vacunas del animal
    const vacunasQuery = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY va.fecha_aplicacion DESC) AS numero,
        v.nombre AS nombre_vacuna,
        va.fecha_aplicacion,
        va.proxima_dosis,
        CASE
          WHEN va.proxima_dosis IS NULL THEN 'Sin fecha'
          WHEN va.proxima_dosis > CURRENT_DATE + INTERVAL '2 months' THEN 'A tiempo'
          WHEN va.proxima_dosis BETWEEN CURRENT_DATE + INTERVAL '1 month' AND CURRENT_DATE + INTERVAL '2 months' THEN 'Próximo'
          WHEN va.proxima_dosis <= CURRENT_DATE THEN 'Urgente'
          ELSE 'A tiempo'
        END AS estado_vacunacion
      FROM vacunas_animales va
      INNER JOIN vacuna v ON va.id_vacuna = v.id_vacuna
      WHERE va.id_animal = $1
      ORDER BY va.fecha_aplicacion DESC`,
      [id_animal]
    );

    return {
      ...animal,
      vacunas: vacunasQuery.rows,
    };
  }
}

export default FichaAnimalModel;