// models/animal.model.js
import pool from "../config/bd.js";

// Crear un nuevo animal (VERSIÓN MEJORADA)
export const createAnimalDB = async (animalData) => {
  const {
    codigo_animal, 
    arete_numero = null, 
    chip_rfid = null, 
    alias,
    sexo, 
    fecha_nacimiento, 
    raza = null, 
    color = null,
    peso_inicial, 
    estado = 'VIVO',
    fecha_baja = null, 
    motivo_baja = null,
    id_madre = null, 
    id_padre = null, 
    lugar_nacimiento = null,
    procedencia = null, 
    id_finca = null
  } = animalData;

  // Validaciones básicas
  if (!codigo_animal || !alias || !sexo || !fecha_nacimiento || !peso_inicial) {
    throw new Error('Faltan campos requeridos: codigo_animal, alias, sexo, fecha_nacimiento, peso_inicial');
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.animal (
        codigo_animal, arete_numero, chip_rfid, alias,
        sexo, fecha_nacimiento, raza, color,
        peso_inicial, estado,
        fecha_baja, motivo_baja,
        id_madre, id_padre, lugar_nacimiento,
        procedencia, id_finca
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 
        $9, $10, $11, $12, $13, $14, 
        $15, $16, $17
      )
      RETURNING *`,
      [
        codigo_animal, 
        arete_numero, 
        chip_rfid, 
        alias,
        sexo, 
        fecha_nacimiento, 
        raza, 
        color,
        peso_inicial, 
        estado,
        fecha_baja, 
        motivo_baja,
        id_madre, 
        id_padre, 
        lugar_nacimiento,
        procedencia, 
        id_finca
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error en createAnimalDB:', error);
    throw error;
  }
};

// Listar todos los animales
export const getAllAnimalsDB = async () => {
  const result = await pool.query(
    "SELECT * FROM public.animal ORDER BY id_animal ASC"
  );
  return result.rows;
};

// Insertar múltiples animales (desde CSV)
export const bulkInsertAnimals = async (animals) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const a of animals) {
      await client.query(
        `INSERT INTO public.animal (
          codigo_animal, arete_numero, chip_rfid, alias,
          sexo, fecha_nacimiento, raza, color,
          peso_inicial, estado,
          lugar_nacimiento, procedencia, id_finca
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 
          $9, $10, $11, $12, $13
        )`,
        [
          a.codigo_animal, 
          a.arete_numero || null, 
          a.chip_rfid || null, 
          a.alias,
          a.sexo, 
          a.fecha_nacimiento, 
          a.raza || null, 
          a.color || null,
          a.peso_inicial, 
          a.estado || 'VIVO',
          a.lugar_nacimiento || null, 
          a.procedencia || null, 
          a.id_finca || null
        ]
      );
    }

    await client.query("COMMIT");
    return { success: true, message: `${animals.length} animales insertados` };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error('Error en bulkInsertAnimals:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Contar todos los animales registrados
export const countAnimalsDB = async () => {
  const result = await pool.query("SELECT COUNT(*) AS total FROM animal");
  return parseInt(result.rows[0].total, 10);
};