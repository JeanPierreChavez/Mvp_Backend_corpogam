import express from "express";
import PdfController from "../controller/reporte.controller.js";

const router = express.Router();

// Generar ficha completa de un animal
router.get("/ficha-animal/:id_animal", PdfController.generarFichaAnimal);

export default router;