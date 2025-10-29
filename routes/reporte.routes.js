import express from "express";
import PdfController from "../controller/reporte.controller.js";

const router = express.Router();

// 📄 Rutas para datos JSON (para vista web)
router.get("/ficha-datos/:id_animal", PdfController.obtenerDatosFicha);

// 🌐 Ruta pública por código único (para QR)
router.get("/ficha-publica/:codigo_unico", PdfController.obtenerFichaPublica);

// 📥 Descargar PDF
router.get("/ficha-pdf/:id_animal", PdfController.generarFichaPDF);

// 🔲 Generar QR (devuelve base64 para mostrar en web)
router.get("/ficha-qr/:id_animal", PdfController.generarQR);

// 🔲 Descargar QR como imagen PNG
router.get("/ficha-qr-download/:id_animal", PdfController.descargarQR);

export default router;