import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const RentEntry = sequelize.define(
  "RentEntry",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Tenants", key: "id" },
    },
    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    water: { type: DataTypes.DECIMAL(10, 2), defaultValue: 300 },
    maintenance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    electricity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    previous_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    advance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: "not vacated" },
    due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  },
  {
    tableName: "RentEntries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    hooks: {
      beforeValidate: (r) => {
        r.total =
          +r.rent +
          +r.water +
          +r.maintenance +
          +r.electricity +
          +r.previous_due;
        r.due = r.total - +r.paid - +r.advance;
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["tenant_id", "month"],
      },
    ],
  },
);

export default RentEntry;
