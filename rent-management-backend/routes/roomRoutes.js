import express from "express";
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

/* ================= ROOM ROUTES ================= */

// GET all rooms
router.get("/", getRooms);

// CREATE room
router.post("/", addRoom);

// UPDATE room
router.put("/:id", updateRoom);

// DELETE room
router.delete("/:id", deleteRoom);

export default router;
