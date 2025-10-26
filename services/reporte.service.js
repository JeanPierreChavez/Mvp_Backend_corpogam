import carbone from "carbone";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración correcta para Carbone v3+
carbone.set({
  factories: 1,
  startFactory: true,
  // Eliminar converterFactoryPath - no es compatible
  lang: 'es-ec'
});

class PdfService {
  static async generarFichaAnimal(datos) {
    return new Promise((resolve, reject) => {
      const templatePath = path.join(__dirname, "../templates/Reporte_Animales.odt");
      
      if (!fs.existsSync(templatePath)) {
        return reject(new Error(`Template no encontrado: ${templatePath}`));
      }

      const options = {
        convertTo: "pdf"
      };

      const datosFormateados = {
        ...datos,
        fecha_nacimiento_formato: datos.fecha_nacimiento 
          ? new Date(datos.fecha_nacimiento).toLocaleDateString('es-EC')
          : 'N/A',
        sexo_formato: datos.sexo === 'M' ? 'Macho' : 'Hembra',
        lugar_nacimiento: datos.lugar_nacimiento || 'No registrado',
        procedencia: datos.procedencia || 'No registrada',
        vacunas: datos.vacunas?.map(v => ({
          ...v,
          fecha_aplicacion_formato: v.fecha_aplicacion
            ? new Date(v.fecha_aplicacion).toLocaleDateString('es-EC')
            : 'N/A',
          proxima_dosis_formato: v.proxima_dosis
            ? new Date(v.proxima_dosis).toLocaleDateString('es-EC')
            : 'Sin fecha'
        })) || []
      };

      console.log('Generando PDF...');

      carbone.render(templatePath, datosFormateados, options, (err, result) => {
        if (err) {
          console.error("Error al generar PDF:", err);
          return reject(err);
        }
        console.log('PDF generado exitosamente');
        resolve(result);
      });
    });
  }
}

export default PdfService;