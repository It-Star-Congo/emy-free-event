"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      category: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      pricePerDay: { type: Sequelize.FLOAT, allowNull: false },
      deposit: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      power: { type: Sequelize.STRING, allowNull: true },
      images: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("packs", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      audienceSize: { type: Sequelize.STRING, allowNull: false },
      includedText: { type: Sequelize.TEXT, allowNull: false },
      pricePerDay: { type: Sequelize.FLOAT, allowNull: false },
      optionsText: { type: Sequelize.TEXT, allowNull: true },
      images: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("quote_requests", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      customerName: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true },
      eventType: { type: Sequelize.STRING, allowNull: false },
      eventDate: { type: Sequelize.DATEONLY, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      audience: { type: Sequelize.INTEGER, allowNull: true },
      needs: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      itemsJson: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      packId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "packs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      optionsJson: { type: Sequelize.JSON, allowNull: false, defaultValue: {} },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "nouveau" },
      riderFile: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("reservations", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      startDate: { type: Sequelize.DATEONLY, allowNull: false },
      endDate: { type: Sequelize.DATEONLY, allowNull: false },
      itemsJson: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      packId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "packs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "en_attente" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("admin_users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false, defaultValue: "admin" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable("realisations", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      eventDate: { type: Sequelize.DATEONLY, allowNull: true },
      location: { type: Sequelize.STRING, allowNull: true },
      image: { type: Sequelize.STRING, allowNull: true },
      serviceType: { type: Sequelize.STRING, allowNull: true },
      audience: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("realisations");
    await queryInterface.dropTable("admin_users");
    await queryInterface.dropTable("reservations");
    await queryInterface.dropTable("quote_requests");
    await queryInterface.dropTable("packs");
    await queryInterface.dropTable("products");
  }
};

