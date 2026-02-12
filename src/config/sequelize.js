const { Sequelize } = require("sequelize");

const isProd = process.env.NODE_ENV === "production";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const useSqlite =
  process.env.DB_DIALECT === "sqlite" ||
  (!isProd && !process.env.DB_DIALECT);

const sequelize = useSqlite
  ? new Sequelize({
      dialect: "sqlite",
      storage: process.env.DB_STORAGE || "./database.sqlite",
      logging: false
    })
  : hasDatabaseUrl
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
        dialectOptions: {
          ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : undefined
        }
      })
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        dialect: "postgres",
        logging: false,
        dialectOptions: {
          ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : undefined
        }
      });

module.exports = sequelize;
