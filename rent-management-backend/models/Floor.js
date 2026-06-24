import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Floor = sequelize.define(
  "Floor",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    floor_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    building_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Buildings", key: "id" },
    },
  },
  {
    tableName: "Floors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["building_id", "floor_number"],
      },
    ],
  },
);

export default Floor;
