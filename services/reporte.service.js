import carbone from "carbone";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ Verificar LibreOffice al iniciar el servicio
console.log('🔍 Verificando LibreOffice...');
try {
  // Intenta ejecutar LibreOffice
  const version = execSync('soffice --version', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('✅ LibreOffice encontrado:', version.trim());
} catch (error) {
  console.error('❌ ERROR: LibreOffice NO está disponible');
  console.error('📥 Descarga LibreOffice: https://www.libreoffice.org/download/download/');
  console.error('📁 Asegúrate de agregarlo al PATH: C:\\Program Files\\LibreOffice\\program');
  console.error('Detalles del error:', error.message);
}

// ⭐ Mostrar el PATH actual
console.log('📂 PATH actual contiene:', 
  process.env.PATH.split(';')
    .filter(p => p.toLowerCase().includes('libreoffice'))
);

carbone.set({
  factories: 1,
  startFactory: true,
  lang: 'es-ec'
});

class PdfService {
  static formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static async generarFichaAnimal(datos) {
    return new Promise((resolve, reject) => {
      const templatePath = path.join(__dirname, "../templates/Ficha_Tecnica_plantilla.odt");
      
      console.log('Buscando template en:', templatePath);
      
      if (!fs.existsSync(templatePath)) {
        console.error('❌ Template NO encontrado en:', templatePath);
        return reject(new Error(`Template no encontrado: ${templatePath}`));
      }
      
      console.log('✅ Template encontrado');

      const options = {
        convertTo: "pdf"
      };

      const datosFormateados = {
        ...datos,
        fecha_informe: new Date().toLocaleDateString('es-EC', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        fecha_nacimiento: this.formatearFecha(datos.fecha_nacimiento),
        fecha_baja: this.formatearFecha(datos.fecha_baja),
        sexo_texto: datos.sexo === 'M' ? 'Macho' : 'Hembra',
        lugar_nacimiento: datos.lugar_nacimiento || 'No registrado',
        procedencia: datos.procedencia || 'No registrada',
        codigo_padre: datos.codigo_padre || 'No registrado',
        codigo_madre: datos.codigo_madre || 'No registrada',
        ubicacion: datos.ubicacion || 'No registrada',
        vacunas: datos.vacunas?.map(v => ({
          nombre_vacuna: v.nombre_vacuna || v.nombre || 'Sin nombre',
          fecha_aplicacion: this.formatearFecha(v.fecha_aplicacion),
          proxima_dosis: this.formatearFecha(v.proxima_dosis)
        })) || []
      };

      console.log('📄 Datos formateados para PDF');
      console.log('🔄 Iniciando conversión a PDF...');

      carbone.render(templatePath, datosFormateados, options, (err, result) => {
        if (err) {
          console.error("❌ Error al generar PDF:", err);
          console.error("💡 Posibles causas:");
          console.error("   1. LibreOffice no está instalado");
          console.error("   2. LibreOffice no está en el PATH");
          console.error("   3. El template ODT tiene errores");
          return reject(err);
        }
        console.log('✅ PDF generado exitosamente');
        resolve(result);
      });
    });
  }
}

export default PdfService;