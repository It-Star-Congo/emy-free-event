module.exports = (sequelize, DataTypes) => {
  const QuoteRequest = sequelize.define(
    "QuoteRequest",
    {
      customerName: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      eventType: { type: DataTypes.STRING, allowNull: false },
      eventDate: { type: DataTypes.DATEONLY, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      audience: { type: DataTypes.INTEGER, allowNull: true },
      needs: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      itemsJson: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      optionsJson: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "nouveau" },
      riderFile: { type: DataTypes.STRING, allowNull: true }
    },
    { tableName: "quote_requests" }
  );

  QuoteRequest.associate = (models) => {
    QuoteRequest.belongsTo(models.Pack, { foreignKey: "packId" });
  };

  return QuoteRequest;
};

