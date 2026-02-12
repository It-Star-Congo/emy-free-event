"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      customerName: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true },
      totalAmount: { type: Sequelize.FLOAT, allowNull: false },
      currency: { type: Sequelize.STRING, allowNull: false, defaultValue: "XOF" },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      paymentStatus: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("order_items", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      productId: { type: Sequelize.INTEGER, allowNull: true },
      productName: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unitPrice: { type: Sequelize.FLOAT, allowNull: false },
      lineTotal: { type: Sequelize.FLOAT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("payment_transactions", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      provider: { type: Sequelize.STRING, allowNull: false, defaultValue: "mock" },
      amount: { type: Sequelize.FLOAT, allowNull: false },
      currency: { type: Sequelize.STRING, allowNull: false, defaultValue: "XOF" },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      providerRef: { type: Sequelize.STRING, allowNull: true },
      checkoutToken: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payment_transactions");
    await queryInterface.dropTable("order_items");
    await queryInterface.dropTable("orders");
  }
};

