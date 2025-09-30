module.exports = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "coffee_shop",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-here",
  PORT: process.env.PORT || 5000,
};
