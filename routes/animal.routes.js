import express from "express";
import multer from "multer";
import { createAnimal, getAllAnimals, uploadCSV, getAnimalCount, testDatabaseConnection } from "../controller/animal.controller.js"; // <--- Añade testDatabaseConnection aquí


const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Crear un animal
router.post("/", createAnimal);

// Obtener todos los animales
router.get("/", getAllAnimals);

// --- NUEVA RUTA ---
// Obtener el conteo total de animales
// Es buena práctica colocar las rutas específicas ('/total') antes de las rutas dinámicas ('/:id')
router.get("/total", getAnimalCount);

// Subir CSV (JSON en Postman por ahora)
router.post("/upload-csv", upload.single("file"), uploadCSV);
router.get("/test-db", testDatabaseConnection);


export default router;