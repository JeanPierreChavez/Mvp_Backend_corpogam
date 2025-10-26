import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import animalRoutes from "./routes/animal.routes.js";
import vacunaRoutes from "./routes/vacuna.routes.js";
import pdfRoutes from "./routes/reportes.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/animal", animalRoutes);
app.use("/api/vacuna", vacunaRoutes);
app.use("/api/pdf", pdfRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});