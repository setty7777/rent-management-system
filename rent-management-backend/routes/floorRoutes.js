import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getFloors,
  addFloor,
  updateFloor,
  deleteFloor,
  getFloorsByBuilding,
} from "../controllers/floorController.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

/* ================= FLOOR ROUTES ================= */

// GET all floors
router.get("/", getFloors);

// GET floors by building
router.get("/building/:buildingId", getFloorsByBuilding);

// CREATE floor
router.post("/", addFloor);

// UPDATE floor
router.put("/:id", updateFloor);

// DELETE floor
router.delete("/:id", deleteFloor);

export default router;
