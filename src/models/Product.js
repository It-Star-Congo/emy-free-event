module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      category: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      pricePerDay: { type: DataTypes.FLOAT, allowNull: false },
      deposit: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      power: { type: DataTypes.STRING, allowNull: true },
      images: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { tableName: "products" }
  );

  return Product;
};

