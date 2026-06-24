import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

import Tenant from "../models/Tenant.js";
import Building from "../models/Building.js";
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";

/* ================= VALIDATION ================= */
const validateTenant = (data) => {
  if (!data.name?.trim()) return "Name is required";
  if (!data.phone?.trim()) return "Phone is required";
  if (!data.join_date) return "Join date is required";

  if (!data.building_id || !data.floor_id || !data.room_id) {
    return "Building, Floor and Room are required";
  }

  return null;
};

/* ================= CLOUDINARY UPLOAD ================= */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tenants" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/* ================= GET TENANTS ================= */
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      order: [["id", "DESC"]],
      include: [
        { model: Building, as: "building", attributes: ["id", "name"] },
        { model: Floor, as: "floor", attributes: ["id", "floor_number"] },
        { model: Room, as: "room", attributes: ["id", "room_number"] },
      ],
    });

    return res.json({
      success: true,
      count: tenants.length,
      data: tenants,
    });
  } catch (error) {
    console.error("❌ GET TENANTS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
    });
  }
};

/* ================= ADD TENANT ================= */
export const addTenant = async (req, res) => {
  try {
    const data = {
      name: req.body.name?.trim(),
      phone: req.body.phone?.trim(),
      advance: Number(req.body.advance || 0),
      join_date: req.body.join_date,
      building_id: Number(req.body.building_id),
      floor_id: Number(req.body.floor_id),
      room_id: Number(req.body.room_id),
    };

    const validationError = validateTenant(data);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // ✅ Validate relationships
    const building = await Building.findByPk(data.building_id);
    const floor = await Floor.findByPk(data.floor_id);
    const room = await Room.findByPk(data.room_id);

    if (!building || !floor || !room) {
      return res.status(404).json({
        success: false,
        message: "Invalid building/floor/room",
      });
    }

    if (Number(floor.building_id) !== Number(data.building_id)) {
      return res.status(400).json({
        success: false,
        message: "Floor does not belong to building",
      });
    }

    if (Number(room.floor_id) !== Number(data.floor_id)) {
      return res.status(400).json({
        success: false,
        message: "Room does not belong to floor",
      });
    }

    // ✅ Check occupancy
    const existingTenant = await Tenant.findOne({
      where: {
        room_id: data.room_id,
      },
    });

    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: "Room is already occupied",
      });
    }

    // Upload documents
    let documents = [];

    if (req.files?.length > 0) {
      documents = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);
          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        }),
      );
    }

    const tenant = await Tenant.create({
      ...data,
      documents,
    });

    return res.status(201).json({
      success: true,
      message: "Tenant added successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("❌ ADD TENANT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add tenant",
    });
  }
};

/* ================= UPDATE TENANT ================= */
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const data = {
      name: req.body.name?.trim() || tenant.name,
      phone: req.body.phone?.trim() || tenant.phone,
      advance: req.body.advance ? Number(req.body.advance) : tenant.advance,

      join_date: req.body.join_date || tenant.join_date,

      building_id: req.body.building_id
        ? Number(req.body.building_id)
        : tenant.building_id,

      floor_id: req.body.floor_id ? Number(req.body.floor_id) : tenant.floor_id,

      room_id: req.body.room_id ? Number(req.body.room_id) : tenant.room_id,
    };

    // ================= VALIDATE =================

    const building = await Building.findByPk(data.building_id);
    const floor = await Floor.findByPk(data.floor_id);
    const room = await Room.findByPk(data.room_id);

    if (!building || !floor || !room) {
      return res.status(404).json({
        success: false,
        message: "Invalid building/floor/room",
      });
    }

    if (Number(floor.building_id) !== Number(data.building_id)) {
      return res.status(400).json({
        success: false,
        message: "Floor does not belong to building",
      });
    }

    if (Number(room.floor_id) !== Number(data.floor_id)) {
      return res.status(400).json({
        success: false,
        message: "Room does not belong to floor",
      });
    }

    // ================= ROOM OCCUPANCY CHECK =================

    const existingTenant = await Tenant.findOne({
      where: {
        room_id: data.room_id,
      },
    });

    if (existingTenant && existingTenant.id !== tenant.id) {
      return res.status(400).json({
        success: false,
        message: "Room is already occupied",
      });
    }

    // ================= DOCUMENT REPLACEMENT =================

    let documents = tenant.documents || [];

    // If new files uploaded
    if (req.files?.length > 0) {
      // DELETE OLD CLOUDINARY FILES
      for (const file of documents) {
        if (file?.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      }

      // UPLOAD NEW FILES
      documents = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);

          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        }),
      );
    }

    // ================= UPDATE =================

    await tenant.update({
      ...data,
      documents,
    });

    return res.json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("❌ UPDATE TENANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tenant",
    });
  }
};

/* ================= DELETE TENANT ================= */
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const docs = tenant.documents || [];

    for (const file of docs) {
      if (file?.public_id) {
        await cloudinary.uploader.destroy(file.public_id);
      }
    }

    await tenant.destroy();

    return res.json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE TENANT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tenant",
    });
  }
};
