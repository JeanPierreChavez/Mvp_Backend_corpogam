import express from "express";
import VacunaController from "../controller/vacuna.controller.js";

const router = express.Router();

// RUTAS DEL CATÁLOGO DE VACUNAS
router.get("/catalogo", VacunaController.obtenerCatalogo);
router.post("/catalogo", VacunaController.crearVacuna);

// RUTAS DE VACUNAS APLICADAS
router.post("/aplicar", VacunaController.registrarVacunaAplicada);
router.get("/aplicadas", VacunaController.listarVacunasAplicadas);

// IMPORTANTE: Rutas específicas deben ir ANTES de rutas con parámetros dinámicos
router.get("/aplicadas/semaforo", VacunaController.obtenerVacunasPorEstado);
router.get("/aplicadas/urgentes", VacunaController.obtenerVacunasUrgentes);
router.get("/aplicadas/animal/:id_animal", VacunaController.obtenerVacunasPorAnimal);

router.put("/aplicadas/:id_vacuna_animal", VacunaController.actualizarProximaDosis);
router.delete("/aplicadas/:id_vacuna_animal", VacunaController.eliminarVacunaAplicada);

export default router;