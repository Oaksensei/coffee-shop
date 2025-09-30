import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "coffee_shop",
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  multipleStatements: true,
};

async function initDatabase() {
  let connection;
  
  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    
    console.log("Reading schema file...");
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    
    console.log("Creating tables...");
    await connection.execute(schemaSQL);
    
    console.log("Reading seed file...");
    const seedPath = path.join(__dirname, "db", "seed.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf8");
    
    console.log("Inserting seed data...");
    await connection.execute(seedSQL);
    
    console.log("Database initialization completed successfully!");
    
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
