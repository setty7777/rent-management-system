import express from "express";
import rateLimit from "express-rate-limit";

import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= RATE LIMIT ================= */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // limit each IP
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

/* ================= AUTH ROUTES ================= */
router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);

/* ================= PROTECTED ROUTE ================= */
router.get("/dashboard", protect, (req, res) => {
  res.json({
    success: true,
    message: "Dashboard access granted",
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
});

export default router;
