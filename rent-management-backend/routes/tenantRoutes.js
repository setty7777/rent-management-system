import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

import {
  getTenants,
  addTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/tenantController.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

/* ================= MULTER CONFIG ================= */

// Memory storage (for Cloudinary)
const storage = multer.memoryStorage();

// File filter (only images/pdf)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, PDF files are allowed"), false);
  }
};

// Upload config
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter,
});

/* ================= TENANT ROUTES ================= */

// GET all tenants
router.get("/", getTenants);

// CREATE tenant
router.post("/", upload.array("documents", 5), addTenant);

// UPDATE tenant
router.put("/:id", upload.array("documents", 5), updateTenant);

// DELETE tenant
router.delete("/:id", deleteTenant);

export default router;
