require("dotenv").config();

const useSqlite = process.env.DB_DIALECT === "sqlite" || process.env.NODE_ENV !== "production";

const base = {
  seederStorage: "sequelize",
  migrationStorage: "sequelize",
  logging: false
};

module.exports = {
  development: useSqlite
    ? { ...base, dialect: "sqlite", storage: process.env.DB_STORAGE || "./database.sqlite" }
    : {
        ...base,
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS
      },
  test: {
    ...base,
    dialect: "sqlite",
    storage: ":memory:"
  },
  production: {
    ...base,
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  }
};

