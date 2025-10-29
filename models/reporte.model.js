import pool from "../config/bd.js";
import crypto from "crypto";

class FichaAnimalModel {
  
  // ⭐ NUEVO: Generar código único
  static async generarCodigoUnico(id_animal) {
    const codigoUnico = crypto.randomBytes(16).toString('hex');
    
    await pool.query(
      `UPDATE animal SET codigo_unico = $1 WHERE id_animal = $2`,
      [codigoUnico, id_animal]
    );
    
    return codigoUnico;
  }

  // ⭐ NUEVO: Obtener animal básico con código único
  static async obtenerAnimalBasico(id_animal) {
    const result = await pool.query(
      `SELECT id_animal, codigo_animal, alias, codigo_unico 
       FROM animal 
       WHERE id_animal = $1`,
      [id_animal]
    );

    if (result.rows.length === 0) return null;

    let animal = result.rows[0];

    // Si no tiene código único, generarlo
    if (!animal.codigo_unico) {
      animal.codigo_unico = await this.generarCodigoUnico(id_animal);
    }

    return animal;
  }

  // ⭐ NUEVO: Buscar por código único
  static async obtenerPorCodigoUnico(codigo_unico) {
    const result = await pool.query(
      `SELECT id_animal, codigo_animal, alias 
       FROM animal 
       WHERE codigo_unico = $1`,
      [codigo_unico]
    );

    return result.rows[0] || null;
  }

  // ✅ EXISTENTE: Tu método actual (sin cambios)
  static async obtenerDatosCompletos(id_animal) {
    const animalQuery = await pool.query(
      `SELECT 
        a.id_animal,
        a.codigo_animal,
        a.alias,
        a.sexo,
        a.fecha_nacimiento,
        a.fecha_baja,
        a.raza,
        a.color,
        a.estado,
        a.arete_numero,
        a.chip_rfid,
        a.lugar_nacimiento,
        a.procedencia,
        f.nombre AS nombre_finca,
        f.ubicacion AS ubicacion,
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

    console.log(`📊 Animal ID ${id_animal}: ${vacunasQuery.rows.length} vacunas`);

    return {
      ...animal,
      vacunas: vacunasQuery.rows
    };
  }
}

export default FichaAnimalModel;