import PdfService from "../services/reporte.service.js";
import FichaAnimalModel from "../models/reporte.model.js";

class PdfController {
  static async generarFichaAnimal(req, res) {
    try {
      const { id_animal } = req.params;

      // Obtener datos completos del animal
      const datos = await FichaAnimalModel.obtenerDatosCompletos(id_animal);

      if (!datos) {
        return res.status(404).json({
          message: "Animal no encontrado",
        });
      }

      // Generar PDF
      const pdfBuffer = await PdfService.generarFichaAnimal(datos);

      // Configurar headers para descarga
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ficha_${datos.codigo_animal}.pdf`
      );

      // Enviar PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error al generar ficha:", error);
      res.status(500).json({
        message: "Error al generar la ficha del animal",
        error: error.message,
      });
    }
  }
}

export default PdfController;