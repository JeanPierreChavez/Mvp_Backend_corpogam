// controller/animal.controller.js
import { 
  createAnimalDB, 
  getAllAnimalsDB, 
  bulkInsertAnimals, 
  countAnimalsDB 
} from "../models/animal.model.js";

// Crear un nuevo animal
export const createAnimal = async (req, res) => {
  try {
    console.log('Datos recibidos del frontend:', req.body);
    
    const newAnimal = await createAnimalDB(req.body);
    
    console.log('Animal creado exitosamente:', newAnimal.id_animal);
    res.status(201).json(newAnimal);
    
  } catch (err) {
    console.error("Error al crear animal:", err.message);
    res.status(500).json({ 
      error: "Error al crear animal",
      message: err.message 
    });
  }
};

// Listar todos los animales
export const getAllAnimals = async (req, res) => {
  try {
    const animals = await getAllAnimalsDB();
    res.json(animals);
  } catch (err) {
    console.error("Error al obtener animales:", err);
    res.status(500).json({ error: "Error al obtener animales" });
  }
};

// Insertar múltiples desde CSV
export const uploadCSV = async (req, res) => {
  try {
    const animals = req.body;
    const result = await bulkInsertAnimals(animals);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error al subir CSV:", err);
    res.status(500).json({ error: "Error al subir CSV" });
  }
};

// Obtener el total de animales
export const getAnimalCount = async (req, res) => {
  try {
    const total = await countAnimalsDB();
    res.json({ total });
  } catch (err) {
    console.error("Error al contar animales:", err);
    res.status(500).json({ error: "Error al obtener el total de animales" });
  }
};

// Test de conexión a BD
export const testDatabaseConnection = async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Conexión exitosa', 
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    console.error("Error en test de BD:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};