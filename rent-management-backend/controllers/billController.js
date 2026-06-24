import Bill from "../models/Bill.js";
import Tenant from "../models/Tenant.js";
import Room from "../models/Room.js";
import Floor from "../models/Floor.js";
import Building from "../models/Building.js";
import { Op } from "sequelize";

/* ================= BILL NUMBER ================= */
const generateBillNumber = () => {
  return `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/* ================= NORMALIZER ================= */
const normalize = (body) => {
  const previous = Number(body.previous_reading);
  const current = Number(body.current_reading);
  const rate = Number(body.rate);

  const units = current - previous;
  const amount = units * rate;

  return {
    tenant_id: Number(body.tenant_id),
    previous_reading: previous,
    current_reading: current,
    units,
    rate,
    amount,
    month: body.month?.trim().toLowerCase(),
    year: Number(body.year),
  };
};

/* ================= VALIDATION ================= */
const validateBillData = (data) => {
  if (!data.tenant_id || !data.month || !data.year) {
    return "Required fields missing";
  }

  if (
    isNaN(data.previous_reading) ||
    isNaN(data.current_reading) ||
    isNaN(data.rate)
  ) {
    return "Invalid numeric values";
  }

  if (data.current_reading < data.previous_reading) {
    return "Current reading must be greater than previous reading";
  }

  return null;
};

/* ================= GET ALL BILLS ================= */
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      include: [
        {
          model: Tenant,
          as: "tenant",
          attributes: ["id", "name"],
          required: false,
          include: [
            {
              model: Room,
              as: "room",
              attributes: ["room_number"],
              required: false,
            },
            {
              model: Floor,
              as: "floor",
              attributes: ["floor_number"],
              required: false,
            },
            {
              model: Building,
              as: "building",
              attributes: ["name"],
              required: false,
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: bills || [],
    });
  } catch (err) {
    console.error("❌ GET BILLS ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
    });
  }
};

/* ================= CREATE BILL ================= */
export const addBill = async (req, res) => {
  try {
    const data = normalize(req.body);

    const validationError = validateBillData(data);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existing = await Bill.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        year: data.year,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Bill already exists for this tenant, month and year",
      });
    }

    const bill = await Bill.create({
      ...data,
      bill_number: generateBillNumber(),
      generated_date: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: bill,
    });
  } catch (err) {
    console.error("❌ CREATE BILL ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create bill",
    });
  }
};

/* ================= UPDATE BILL ================= */
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findByPk(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const data = normalize(req.body);

    const validationError = validateBillData(data);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const duplicate = await Bill.findOne({
      where: {
        tenant_id: data.tenant_id,
        month: data.month,
        year: data.year,
        id: { [Op.ne]: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another bill already exists for this tenant/month/year",
      });
    }

    await bill.update(data);

    return res.json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    });
  } catch (err) {
    console.error("❌ UPDATE BILL ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update bill",
    });
  }
};

/* ================= DELETE BILL ================= */
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    await bill.destroy();

    return res.json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE BILL ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete bill",
    });
  }
};

/* ================= GET LAST BILL ================= */
export const getLastBill = async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "tenantId is required",
      });
    }

    const bill = await Bill.findOne({
      where: { tenant_id: tenantId },
      order: [["created_at", "DESC"]], // ✅ FIXED
    });

    return res.json({
      success: true,
      data: bill || null,
    });
  } catch (err) {
    console.error("❌ LAST BILL ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch last bill",
    });
  }
};
