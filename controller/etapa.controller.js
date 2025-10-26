import EtapaModel from "../models/etapa.model.js";

class EtapaController {
  // Obtener todos los animales con su etapa
  static async obtenerAnimalesPorEtapa(req, res) {
    try {
      const animales = await EtapaModel.obtenerAnimalesPorEtapa();
      res.json(animales);
    } catch (error) {
      console.error("Error al obtener animales por etapa:", error);
      res.status(500).json({
        message: "Error al obtener animales por etapa",
        error: error.message,
      });
    }
  }

  // Obtener animales de una etapa específica
  static async obtenerPorEtapa(req, res) {
    try {
      const { etapa } = req.params;

      const etapasValidas = [
        "Lactante",
        "Cría",
        "Crecimiento",
        "Vaca",
        "Toro",
        "Adulto",
      ];

      if (!etapasValidas.includes(etapa)) {
        return res.status(400).json({
          message: "Etapa no válida",
          etapas_disponibles: etapasValidas,
        });
      }

      const animales = await EtapaModel.obtenerPorEtapa(etapa);
      res.json(animales);
    } catch (error) {
      console.error("Error al obtener animales por etapa específica:", error);
      res.status(500).json({
        message: "Error al obtener animales por etapa",
        error: error.message,
      });
    }
  }

  // Obtener estadísticas por etapa
  static async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await EtapaModel.obtenerEstadisticasPorEtapa();
      
      // Calcular totales generales
      const totales = {
        total_animales: estadisticas.reduce(
          (sum, e) => sum + parseInt(e.total_animales),
          0
        ),
        total_hembras: estadisticas.reduce(
          (sum, e) => sum + parseInt(e.hembras),
          0
        ),
        total_machos: estadisticas.reduce(
          (sum, e) => sum + parseInt(e.machos),
          0
        ),
      };

      res.json({
        por_etapa: estadisticas,
        totales,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas por etapa:", error);
      res.status(500).json({
        message: "Error al obtener estadísticas",
        error: error.message,
      });
    }
  }

  // Obtener animales próximos a cambiar de etapa
  static async obtenerProximosCambios(req, res) {
    try {
      const proximos = await EtapaModel.obtenerProximosCambioEtapa();
      res.json(proximos);
    } catch (error) {
      console.error("Error al obtener próximos cambios de etapa:", error);
      res.status(500).json({
        message: "Error al obtener próximos cambios",
        error: error.message,
      });
    }
  }

  // Obtener catálogo de etapas disponibles
  static async obtenerCatalogo(req, res) {
    try {
      const etapas = await EtapaModel.obtenerCatalogoEtapas();
      res.json(etapas);
    } catch (error) {
      console.error("Error al obtener catálogo de etapas:", error);
      res.status(500).json({
        message: "Error al obtener catálogo de etapas",
        error: error.message,
      });
    }
  }

  // Obtener animales por rango de edad
  static async obtenerPorRangoEdad(req, res) {
    try {
      const { edad_min, edad_max } = req.query;

      if (!edad_min || !edad_max) {
        return res.status(400).json({
          message: "Se requieren los parámetros edad_min y edad_max",
        });
      }

      if (parseInt(edad_min) > parseInt(edad_max)) {
        return res.status(400).json({
          message: "edad_min no puede ser mayor que edad_max",
        });
      }

      const animales = await EtapaModel.obtenerPorRangoEdad(
        parseInt(edad_min),
        parseInt(edad_max)
      );

      res.json(animales);
    } catch (error) {
      console.error("Error al obtener animales por rango de edad:", error);
      res.status(500).json({
        message: "Error al obtener animales por rango de edad",
        error: error.message,
      });
    }
  }

  // Obtener comparativa de pesos por etapa
  static async obtenerComparativaPesos(req, res) {
    try {
      const comparativa = await EtapaModel.obtenerComparativaPesos();
      res.json(comparativa);
    } catch (error) {
      console.error("Error al obtener comparativa de pesos:", error);
      res.status(500).json({
        message: "Error al obtener comparativa de pesos",
        error: error.message,
      });
    }
  }
}

export default EtapaController;