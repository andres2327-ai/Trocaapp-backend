import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import { getConnection } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/messages", messagesRoutes);

app.get("/", (req, res) => {
  res.send("Servidor de Trueques funcionando ✅");
});

app.get("/test-db", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT name FROM sys.databases");
    res.json({
      message: "✅ Conexión exitosa a SQL Server",
      databases: result.recordset,
    });
  } catch (error) {
    console.error("❌ Error en /test-db:", error);
    res.status(500).json({ error: "Error al conectar a la base de datos" });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));