module.exports = (sequelize, DataTypes) => {
  const PaymentTransaction = sequelize.define(
    "PaymentTransaction",
    {
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      provider: { type: DataTypes.STRING, allowNull: false, defaultValue: "mock" },
      amount: { type: DataTypes.FLOAT, allowNull: false },
      currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "XOF" },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
      providerRef: { type: DataTypes.STRING, allowNull: true },
      checkoutToken: { type: DataTypes.STRING, allowNull: false, unique: true }
    },
    { tableName: "payment_transactions" }
  );

  PaymentTransaction.associate = (models) => {
    PaymentTransaction.belongsTo(models.Order, { foreignKey: "orderId" });
  };

  return PaymentTransaction;
};

