import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Bill = sequelize.define(
  "Bill",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    bill_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    tenant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "Tenants", key: "id" },
    },
    previous_reading: DataTypes.INTEGER,
    current_reading: DataTypes.INTEGER,
    units: DataTypes.INTEGER,
    rate: DataTypes.DECIMAL(10, 2),
    amount: DataTypes.DECIMAL(10, 2),
    month: DataTypes.STRING,
    year: DataTypes.INTEGER,
    generated_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Bills",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    hooks: {
      beforeValidate: (b) => {
        b.units = b.current_reading - b.previous_reading;
        b.amount = b.units * b.rate;
      },
    },
  },
);

export default Bill;
