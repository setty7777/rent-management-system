import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // =========================
    // Extract Token
    // =========================
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // =========================
    // Verify Token
    // =========================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =========================
    // Check User
    // =========================
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] }, // 🔐 remove password
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // Attach user
    // =========================
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    // =========================
    // Error Handling
    // =========================
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
