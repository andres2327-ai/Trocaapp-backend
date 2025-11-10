import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, 
    trustServerCertificate: true, 
  },
};

export async function getConnection() {
  try {
    const pool = await sql.connect(dbSettings);
    console.log("✅ Conexión exitosa a SQL Server");
    return pool;
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:", error);
    throw error;
  }
}

