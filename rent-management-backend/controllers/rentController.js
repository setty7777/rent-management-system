import RentEntry from "../models/RentEntry.js";
import Tenant from "../models/Tenant.js";
import Building from "../models/Building.js";
import Room from "../models/Room.js";
import { Op } from "sequelize";

/* ================= NORMALIZER ================= */
const normalize = (body) => ({
  tenant_id: Number(body.tenant_id),

  month: body.month?.trim(),

  rent: Number(body.rent || 0),

  water: Number(body.water || 0),

  maintenance: Number(body.maintenance || 0),

  electricity: Number(body.electricity || 0),

  previous_due: Number(body.previous_due || 0),

  total: Number(body.total || 0),

  paid: Number(body.paid || 0),

  advance: Number(body.advance || 0),

  due: Number(body.due || 0),

  status: body.status || "not vacated",
});

/* ================= VALIDATION ================= */
const validate = (data) => {
  if (!data.tenant_id || !data.month) {
    return "Tenant and month are required";
  }

  if (
    isNaN(data.rent) ||
    isNaN(data.water) ||
    isNaN(data.maintenance) ||
    isNaN(data.electricity)
  ) {
    return "Invalid numeric values";
  }

  return null;
};

/* ================= GET ALL ================= */
export const getRentEntries = async (req, res) => {
  try {
    const entries = await RentEntry.findAll({
      include: [
        {
          model: Tenant,
          as: "tenant",
          required: true,
          attributes: ["id", "name"],
          include: [
            {
              model: Building,
              as: "building",
              attributes: ["name"],
            },
            {
              model: Room,
              as: "room",
              attributes: ["room_number"],
            },
          ],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("❌ GET RENT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rent entries",
    });
  }
};

/* ================= CREATE ================= */
export const createRentEntry = async (req, res) => {
  try {
    const data = normalize(req.body);

    const validationError = validate(data);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const tenant = await Tenant.findByPk(data.tenant_id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const existing = await RentEntry.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Rent already exists for this tenant and month",
      });
    }

    const entry = await RentEntry.create(data);

    return res.status(201).json({
      success: true,
      message: "Rent entry created successfully",
      data: entry,
    });
  } catch (error) {
    console.error("❌ CREATE RENT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create rent entry",
    });
  }
};

/* ================= UPDATE ================= */
export const updateRentEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalize(req.body);

    const entry = await RentEntry.findByPk(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Rent entry not found",
      });
    }

    const validationError = validate(data);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const duplicate = await RentEntry.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        id: { [Op.ne]: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another entry already exists for this tenant/month",
      });
    }

    await entry.update(data);

    return res.json({
      success: true,
      message: "Rent entry updated successfully",
      data: entry,
    });
  } catch (error) {
    console.error("❌ UPDATE RENT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update rent entry",
    });
  }
};

/* ================= DELETE ================= */
export const deleteRentEntry = async (req, res) => {
  try {
    const entry = await RentEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Rent entry not found",
      });
    }

    await entry.destroy();

    return res.json({
      success: true,
      message: "Rent entry deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE RENT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete rent entry",
    });
  }
};
