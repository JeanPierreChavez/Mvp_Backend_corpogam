import express from "express";
import EtapaController from "../controllers/etapa.controller.js";

const router = express.Router();

// 🔹 RUTAS DE CONSULTA DE ETAPAS
router.get("/", EtapaController.obtenerAnimalesPorEtapa);
router.get("/catalogo", EtapaController.obtenerCatalogo);
router.get("/estadisticas", EtapaController.obtenerEstadisticas);
router.get("/proximos-cambios", EtapaController.obtenerProximosCambios);
router.get("/comparativa-pesos", EtapaController.obtenerComparativaPesos);
router.get("/rango-edad", EtapaController.obtenerPorRangoEdad);
router.get("/:etapa", EtapaController.obtenerPorEtapa);

export default router;