module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      startDate: { type: DataTypes.DATEONLY, allowNull: false },
      endDate: { type: DataTypes.DATEONLY, allowNull: false },
      itemsJson: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "en_attente" }
    },
    { tableName: "reservations" }
  );

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.Pack, { foreignKey: "packId" });
  };

  return Reservation;
};

