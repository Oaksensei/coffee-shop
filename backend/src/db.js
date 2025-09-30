// backend/src/db.js
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "coffee_shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log("Database config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password ? "***" : "empty",
  database: dbConfig.database,
});

const pool = mysql.createPool(dbConfig);

export default pool;
