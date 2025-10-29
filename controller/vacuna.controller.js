import VacunaModel from "../models/vacuna.model.js";

class VacunaController {
  // Obtener catálogo de vacunas disponibles
  static async obtenerCatalogo(req, res) {
    try {
      const vacunas = await VacunaModel.obtenerCatalogoVacunas();
      res.json(vacunas);
    } catch (error) {
      console.error("Error al obtener catálogo de vacunas:", error);
      res.status(500).json({ 
        message: "Error al obtener catálogo de vacunas",
        error: error.message 
      });
    }
  }

  // Crear nueva vacuna en el catálogo
  static async crearVacuna(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({ 
          message: "El nombre de la vacuna es obligatorio" 
        });
      }

      const vacuna = await VacunaModel.crearVacuna(nombre, descripcion);
      res.status(201).json({
        message: "Vacuna creada exitosamente",
        vacuna
      });
    } catch (error) {
      console.error("Error al crear vacuna:", error);
      res.status(500).json({ 
        message: "Error al crear vacuna",
        error: error.message 
      });
    }
  }

  // Registrar vacuna aplicada a un animal
  static async registrarVacunaAplicada(req, res) {
    try {
      const { id_animal, id_vacuna, fecha_aplicacion, proxima_dosis } = req.body;

      if (!id_animal || !id_vacuna || !fecha_aplicacion) {
        return res.status(400).json({ 
          message: "Faltan datos obligatorios: id_animal, id_vacuna y fecha_aplicacion son requeridos" 
        });
      }

      const vacunaAplicada = await VacunaModel.registrarVacunaAplicada({
        id_animal,
        id_vacuna,
        fecha_aplicacion,
        proxima_dosis: proxima_dosis || null
      });

      res.status(201).json({
        message: "Vacuna registrada exitosamente",
        vacunaAplicada
      });
    } catch (error) {
      console.error("Error al registrar vacuna aplicada:", error);
      
      if (error.code === '23503') {
        return res.status(404).json({ 
          message: "Animal o vacuna no encontrados" 
        });
      }
      
      res.status(500).json({ 
        message: "Error al registrar vacuna aplicada",
        error: error.message 
      });
    }
  }

  // Listar todas las vacunas aplicadas con estado
  static async listarVacunasAplicadas(req, res) {
    try {
      const vacunas = await VacunaModel.listarVacunasAplicadas();
      res.json(vacunas);
    } catch (error) {
      console.error("Error al listar vacunas aplicadas:", error);
      res.status(500).json({ 
        message: "Error al listar vacunas aplicadas",
        error: error.message 
      });
    }
  }

  // Obtener vacunas de un animal específico
  static async obtenerVacunasPorAnimal(req, res) {
    try {
      const { id_animal } = req.params;

      if (!id_animal) {
        return res.status(400).json({ 
          message: "El id_animal es obligatorio" 
        });
      }

      const vacunas = await VacunaModel.obtenerVacunasPorAnimal(id_animal);
      res.json(vacunas);
    } catch (error) {
      console.error("Error al obtener vacunas del animal:", error);
      res.status(500).json({ 
        message: "Error al obtener vacunas del animal",
        error: error.message 
      });
    }
  }

  // Actualizar próxima dosis
  static async actualizarProximaDosis(req, res) {
    try {
      const { id_vacuna_animal } = req.params;
      const { proxima_dosis } = req.body;

      if (!proxima_dosis) {
        return res.status(400).json({ 
          message: "La fecha de próxima dosis es obligatoria" 
        });
      }

      const vacunaActualizada = await VacunaModel.actualizarProximaDosis(
        id_vacuna_animal, 
        proxima_dosis
      );

      if (!vacunaActualizada) {
        return res.status(404).json({ 
          message: "Registro de vacuna no encontrado" 
        });
      }

      res.json({
        message: "Próxima dosis actualizada exitosamente",
        vacunaActualizada
      });
    } catch (error) {
      console.error("Error al actualizar próxima dosis:", error);
      res.status(500).json({ 
        message: "Error al actualizar próxima dosis",
        error: error.message 
      });
    }
  }

  // Eliminar registro de vacuna aplicada
  static async eliminarVacunaAplicada(req, res) {
    try {
      const { id_vacuna_animal } = req.params;

      const vacunaEliminada = await VacunaModel.eliminarVacunaAplicada(id_vacuna_animal);

      if (!vacunaEliminada) {
        return res.status(404).json({ 
          message: "Registro de vacuna no encontrado" 
        });
      }

      res.json({
        message: "Registro de vacuna eliminado exitosamente",
        vacunaEliminada
      });
    } catch (error) {
      console.error("Error al eliminar vacuna aplicada:", error);
      res.status(500).json({ 
        message: "Error al eliminar vacuna aplicada",
        error: error.message 
      });
    }
  }

  // Obtener vacunas urgentes o próximas a vencer
  static async obtenerVacunasUrgentes(req, res) {
    try {
      const vacunasUrgentes = await VacunaModel.obtenerVacunasUrgentes();
      res.json(vacunasUrgentes);
    } catch (error) {
      console.error("Error al obtener vacunas urgentes:", error);
      res.status(500).json({ 
        message: "Error al obtener vacunas urgentes",
        error: error.message 
      });
    }
  }

  // Obtener vacunas agrupadas por estado para semáforo
  static async obtenerVacunasPorEstado(req, res) {
    try {
      const vacunas = await VacunaModel.obtenerVacunasPorEstado();
      res.json(vacunas);
    } catch (error) {
      console.error("Error al obtener vacunas por estado:", error);
      res.status(500).json({ 
        message: "Error al obtener vacunas por estado",
        error: error.message 
      });
    }
  }
  static async actualizarVacunaCompleta(req, res) {
  try {
    const { id_vacuna_animal } = req.params;
    const { fecha_aplicacion, proxima_dosis } = req.body;

    if (!fecha_aplicacion || !proxima_dosis) {
      return res.status(400).json({ 
        message: "Ambas fechas son obligatorias" 
      });
    }

    const vacunaActualizada = await VacunaModel.actualizarVacunaCompleta(
      id_vacuna_animal,
      { fecha_aplicacion, proxima_dosis }
    );

    if (!vacunaActualizada) {
      return res.status(404).json({ 
        message: "Registro de vacuna no encontrado" 
      });
    }

    res.json({
      message: "Vacuna actualizada exitosamente",
      vacunaActualizada
    });
  } catch (error) {
    console.error("Error al actualizar vacuna:", error);
    res.status(500).json({ 
      message: "Error al actualizar vacuna",
      error: error.message 
    });
  }
}
}

export default VacunaController;