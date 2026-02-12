const { Sequelize } = require("sequelize");

const isProd = process.env.NODE_ENV === "production";
const useSqlite = process.env.DB_DIALECT === "sqlite" || !isProd;

const sequelize = useSqlite
  ? new Sequelize({
      dialect: "sqlite",
      storage: process.env.DB_STORAGE || "./database.sqlite",
      logging: false
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      logging: false
    });

module.exports = sequelize;

