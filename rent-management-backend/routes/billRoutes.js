import express from "express";
import {
  getBills,
  addBill,
  updateBill,
  deleteBill,
  getLastBill,
} from "../controllers/billController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= BILL ROUTES ================= */

// GET all bills
router.get("/", protect, getBills);

// GET last bill of tenant
router.get("/last", protect, getLastBill);

// CREATE bill
router.post("/", protect, addBill);

// UPDATE bill
router.put("/:id", protect, updateBill);

// DELETE bill
router.delete("/:id", protect, deleteBill);

export default router;
