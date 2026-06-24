import express from "express";
import {
  getRentEntries,
  createRentEntry,
  updateRentEntry,
  deleteRentEntry,
} from "../controllers/rentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

/* ================= RENT ROUTES ================= */

// GET all rent entries
router.get("/", getRentEntries);

// CREATE rent entry
router.post("/", createRentEntry);

// UPDATE rent entry
router.put("/:id", updateRentEntry);

// DELETE rent entry
router.delete("/:id", deleteRentEntry);

export default router;
