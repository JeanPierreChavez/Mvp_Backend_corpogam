import { Parser } from 'json2csv';

class CsvController {
  // Descargar plantilla CSV vacía
  static async descargarPlantilla(req, res) {
    try {
      const campos = [
        'codigo_animal',
        'arete_numero',
        'chip_rfid',
        'alias',
        'sexo',
        'fecha_nacimiento',
        'raza',
        'color',
        'peso_inicial',
        'estado',
        'fecha_baja',
        'motivo_baja',
        'lugar_nacimiento',
        'procedencia'
      ];

      // Datos de ejemplo
      const datosEjemplo = [
        {
          codigo_animal: 'BOV001',
          arete_numero: 'ARETE-001',
          chip_rfid: 'RFID-12345',
          alias: 'Manchita',
          sexo: 'H',
          fecha_nacimiento: '2023-01-15',
          raza: 'Holstein',
          color: 'Blanco con negro',
          peso_inicial: 450.5,
          estado: 'VIVO',
          fecha_baja: '',
          motivo_baja: '',
          lugar_nacimiento: 'Finca Los Alpes',
          procedencia: 'Nacido en finca'
        },
        {
          codigo_animal: 'BOV002',
          arete_numero: 'ARETE-002',
          chip_rfid: '',
          alias: 'Torito',
          sexo: 'M',
          fecha_nacimiento: '2023-03-20',
          raza: 'Brahman',
          color: 'Gris',
          peso_inicial: 500,
          estado: 'VIVO',
          fecha_baja: '',
          motivo_baja: '',
          lugar_nacimiento: 'Finca Santa Rosa',
          procedencia: 'Comprado'
        }
      ];

      const parser = new Parser({ fields: campos });
      const csv = parser.parse(datosEjemplo);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_animales.csv');
      res.send('\ufeff' + csv); // BOM para Excel
    } catch (error) {
      console.error('Error al generar plantilla CSV:', error);
      res.status(500).json({ message: 'Error al generar plantilla' });
    }
  }

  // Procesar archivo CSV subido
  static async procesarCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ningún archivo' });
      }

      const Papa = require('papaparse');
      const fs = require('fs');
      const pool = require('../config/bd').default;

      // Leer archivo
      const fileContent = fs.readFileSync(req.file.path, 'utf8');

      // Parsear CSV
      const resultado = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase()
      });

      if (resultado.errors.length > 0) {
        return res.status(400).json({
          message: 'Error al procesar el archivo CSV',
          errores: resultado.errors
        });
      }

      const animales = resultado.data;
      let registrados = 0;
      let errores = [];

      // Insertar cada animal
      for (const [index, animal] of animales.entries()) {
        try {
          // Validar campos obligatorios
          if (!animal.codigo_animal || !animal.alias || !animal.sexo || !animal.fecha_nacimiento || !animal.peso_inicial) {
            errores.push({
              fila: index + 2,
              error: 'Faltan campos obligatorios',
              datos: animal
            });
            continue;
          }

          // Insertar en BD
          await pool.query(
            `INSERT INTO animal (
              codigo_animal, arete_numero, chip_rfid, alias, sexo, 
              fecha_nacimiento, raza, color, peso_inicial, estado, 
              fecha_baja, motivo_baja, lugar_nacimiento, procedencia
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              animal.codigo_animal,
              animal.arete_numero || null,
              animal.chip_rfid || null,
              animal.alias,
              animal.sexo.toUpperCase(),
              animal.fecha_nacimiento,
              animal.raza || null,
              animal.color || null,
              parseFloat(animal.peso_inicial),
              animal.estado || 'VIVO',
              animal.fecha_baja || null,
              animal.motivo_baja || null,
              animal.lugar_nacimiento || null,
              animal.procedencia || null
            ]
          );

          registrados++;
        } catch (error) {
          errores.push({
            fila: index + 2,
            error: error.message,
            datos: animal
          });
        }
      }

      // Eliminar archivo temporal
      fs.unlinkSync(req.file.path);

      res.json({
        message: 'Procesamiento completado',
        registrados,
        total: animales.length,
        errores
      });
    } catch (error) {
      console.error('Error al procesar CSV:', error);
      res.status(500).json({ message: 'Error al procesar archivo CSV' });
    }
  }
}

export default CsvController;