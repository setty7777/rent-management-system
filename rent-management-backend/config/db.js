import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Use DATABASE_URL from Supabase
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // required for Supabase
    },
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Supabase PostgreSQL connected");
  } catch (error) {
    console.error("❌ Unable to connect to Supabase:", error);
    process.exit(1);
  }
};

export { sequelize };
