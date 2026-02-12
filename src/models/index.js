const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Product = require("./Product")(sequelize, DataTypes);
const Pack = require("./Pack")(sequelize, DataTypes);
const QuoteRequest = require("./QuoteRequest")(sequelize, DataTypes);
const Reservation = require("./Reservation")(sequelize, DataTypes);
const AdminUser = require("./AdminUser")(sequelize, DataTypes);
const Realisation = require("./Realisation")(sequelize, DataTypes);
const Order = require("./Order")(sequelize, DataTypes);
const OrderItem = require("./OrderItem")(sequelize, DataTypes);
const PaymentTransaction = require("./PaymentTransaction")(sequelize, DataTypes);

const models = {
  sequelize,
  Product,
  Pack,
  QuoteRequest,
  Reservation,
  AdminUser,
  Realisation,
  Order,
  OrderItem,
  PaymentTransaction
};

Object.values(models).forEach((model) => {
  if (model && typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = models;
