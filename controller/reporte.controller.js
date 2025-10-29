import PdfService from "../services/reporte.service.js";
import FichaAnimalModel from "../models/reporte.model.js";
import QRCode from "qrcode"; // npm install qrcode

class PdfController {
  // ⭐ NUEVA: Obtener datos JSON para vista web (con o sin autenticación)
  static async obtenerDatosFicha(req, res) {
    try {
      const { id_animal } = req.params;

      const datos = await FichaAnimalModel.obtenerDatosCompletos(id_animal);

      if (!datos) {
        return res.status(404).json({
          success: false,
          message: "Animal no encontrado"
        });
      }

      // Devolver datos formateados para web
      res.json({
        success: true,
        data: {
          ...datos,
          fecha_informe: new Date().toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          sexo_texto: datos.sexo === 'M' ? 'Macho' : 'Hembra'
        }
      });
    } catch (error) {
      console.error("Error al obtener datos de ficha:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener datos del animal",
        error: error.message
      });
    }
  }

  // ⭐ NUEVA: Vista pública por código único (para QR)
  static async obtenerFichaPublica(req, res) {
    try {
      const { codigo_unico } = req.params;

      const animal = await FichaAnimalModel.obtenerPorCodigoUnico(codigo_unico);

      if (!animal) {
        return res.status(404).json({
          success: false,
          message: "Animal no encontrado"
        });
      }

      const datos = await FichaAnimalModel.obtenerDatosCompletos(animal.id_animal);

      res.json({
        success: true,
        data: {
          ...datos,
          fecha_informe: new Date().toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          sexo_texto: datos.sexo === 'M' ? 'Macho' : 'Hembra'
        }
      });
    } catch (error) {
      console.error("Error al obtener ficha pública:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener ficha del animal",
        error: error.message
      });
    }
  }

  // ⭐ MODIFICADA: Generar PDF desde datos dinámicos
  static async generarFichaPDF(req, res) {
    try {
      const { id_animal } = req.params;

      const datos = await FichaAnimalModel.obtenerDatosCompletos(id_animal);

      if (!datos) {
        return res.status(404).json({
          success: false,
          message: "Animal no encontrado"
        });
      }

      // Generar PDF
      const pdfBuffer = await PdfService.generarFichaAnimal(datos);

      // Configurar headers para descarga
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ficha_${datos.codigo_animal}_${datos.alias}.pdf`
      );

      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      res.status(500).json({
        success: false,
        message: "Error al generar la ficha del animal",
        error: error.message
      });
    }
  }

  // ⭐ NUEVA: Generar código QR con la URL pública
  static async generarQR(req, res) {
    try {
      const { id_animal } = req.params;

      const animal = await FichaAnimalModel.obtenerAnimalBasico(id_animal);

      if (!animal) {
        return res.status(404).json({
          success: false,
          message: "Animal no encontrado"
        });
      }

      // URL pública
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const urlFicha = `${baseUrl}/ficha-publica/${animal.codigo_unico}`;

      // Generar QR en base64
      const qrCode = await QRCode.toDataURL(urlFicha, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      res.json({
        success: true,
        qr_code: qrCode, // base64 data URL
        url: urlFicha,
        codigo_unico: animal.codigo_unico,
        codigo_animal: animal.codigo_animal,
        alias: animal.alias
      });
    } catch (error) {
      console.error("Error al generar QR:", error);
      res.status(500).json({
        success: false,
        message: "Error al generar código QR",
        error: error.message
      });
    }
  }

  // ⭐ NUEVA: Descargar imagen QR como PNG
  static async descargarQR(req, res) {
    try {
      const { id_animal } = req.params;

      const animal = await FichaAnimalModel.obtenerAnimalBasico(id_animal);

      if (!animal) {
        return res.status(404).json({
          success: false,
          message: "Animal no encontrado"
        });
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const urlFicha = `${baseUrl}/ficha-publica/${animal.codigo_unico}`;

      // Generar QR como buffer PNG
      const qrBuffer = await QRCode.toBuffer(urlFicha, {
        width: 800,
        margin: 2
      });

      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=QR_${animal.codigo_animal}_${animal.alias}.png`
      );

      res.send(qrBuffer);
    } catch (error) {
      console.error("Error al descargar QR:", error);
      res.status(500).json({
        success: false,
        message: "Error al descargar código QR",
        error: error.message
      });
    }
  }
}

export default PdfController;