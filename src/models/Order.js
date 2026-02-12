module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      customerName: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      totalAmount: { type: DataTypes.FLOAT, allowNull: false },
      currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "XOF" },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
      paymentStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" }
    },
    { tableName: "orders" }
  );

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
    Order.hasMany(models.PaymentTransaction, { foreignKey: "orderId", onDelete: "CASCADE" });
  };

  return Order;
};

