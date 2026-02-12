module.exports = (sequelize, DataTypes) => {
  const Pack = sequelize.define(
    "Pack",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      audienceSize: { type: DataTypes.STRING, allowNull: false },
      includedText: { type: DataTypes.TEXT, allowNull: false },
      pricePerDay: { type: DataTypes.FLOAT, allowNull: false },
      optionsText: { type: DataTypes.TEXT, allowNull: true },
      images: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }
    },
    { tableName: "packs" }
  );

  return Pack;
};

