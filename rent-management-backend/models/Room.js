import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    room_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    building_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Buildings", key: "id" },
    },
    floor_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Floors", key: "id" },
    },
  },
  {
    tableName: "Rooms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["building_id", "floor_id", "room_number"],
      },
    ],
  },
);

export default Room;
