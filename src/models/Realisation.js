module.exports = (sequelize, DataTypes) => {
  const Realisation = sequelize.define(
    "Realisation",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: false },
      eventDate: { type: DataTypes.DATEONLY, allowNull: true },
      location: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: true },
      serviceType: { type: DataTypes.STRING, allowNull: true },
      audience: { type: DataTypes.INTEGER, allowNull: true }
    },
    { tableName: "realisations" }
  );

  return Realisation;
};

