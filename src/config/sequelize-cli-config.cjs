require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const useSqlite =
  process.env.DB_DIALECT === "sqlite" ||
  (!isProd && !process.env.DB_DIALECT);

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
    ...(hasDatabaseUrl
      ? {
          ...base,
          use_env_variable: "DATABASE_URL",
          dialect: "postgres",
          dialectOptions: {
            ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : undefined
          }
        }
      : {
          ...base,
          dialect: "postgres",
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          dialectOptions: {
            ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : undefined
          }
        })
  }
};
