import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBuildings,
  addBuilding,
  deleteBuilding,
  updateBuilding,
} from "../controllers/buildingController.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

/* ================= BUILDING ROUTES ================= */

// GET all buildings
router.get("/", getBuildings);

// CREATE building
router.post("/", addBuilding);

// UPDATE building
router.put("/:id", updateBuilding);

// DELETE building
router.delete("/:id", deleteBuilding);

export default router;
