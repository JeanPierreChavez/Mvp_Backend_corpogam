import pg from 'pg';
import dotenv from 'dotenv';

// Se asegura de cargar las variables del archivo .env
dotenv.config();

const { Pool } = pg;

// Creamos la instancia de la conexión usando las variables de entorno
const pool = new Pool({
  user: process.env.PGUSER,       // Lee PGUSER del .env
  password: process.env.PGPASSWORD, // Lee PGPASSWORD del .env
  host: process.env.PGHOST,       // Lee PGHOST del .env
  port: process.env.PGPORT,       // Lee PGPORT del .env
  database: process.env.PGDATABASE, // Lee PGDATABASE del .env
});

// Verificación de conexión (opcional pero recomendado)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo cliente para la base de datos', err.stack);
  }
  console.log('¡Conexión exitosa a la base de datos PostgreSQL!');
  client.release();
});

// Exportamos el pool para que los modelos puedan usarlo
export default pool;