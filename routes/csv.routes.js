import express from 'express';
import multer from 'multer';
import CsvController from '../controllers/csv.controller.js';

const router = express.Router();

// Configurar multer para subir archivos
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  }
});

router.get('/plantilla', CsvController.descargarPlantilla);
router.post('/procesar', upload.single('archivo'), CsvController.procesarCSV);

export default router;