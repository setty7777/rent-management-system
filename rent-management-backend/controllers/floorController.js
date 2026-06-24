import Floor from "../models/Floor.js";
import Building from "../models/Building.js";

/* ================= GET ALL FLOORS ================= */
export const getFloors = async (req, res) => {
  try {
    const floors = await Floor.findAll({
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: floors,
    });
  } catch (err) {
    console.error("❌ GET FLOORS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch floors",
      error: err.message,
    });
  }
};

/* ================= ADD FLOOR ================= */
export const addFloor = async (req, res) => {
  let { building_id, floor_number } = req.body;

  floor_number = floor_number?.trim();

  if (!building_id || !floor_number) {
    return res.status(400).json({
      success: false,
      message: "Building ID and floor number are required",
    });
  }

  try {
    // ✅ Check building exists
    const building = await Building.findByPk(building_id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    const floor = await Floor.create({ building_id, floor_number });

    return res.status(201).json({
      success: true,
      message: "Floor added successfully",
      data: floor,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Floor already exists for this building",
      });
    }

    console.error("❌ ADD FLOOR ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add floor",
    });
  }
};

/* ================= UPDATE FLOOR ================= */
export const updateFloor = async (req, res) => {
  const { id } = req.params;
  let { building_id, floor_number } = req.body;

  try {
    const floor = await Floor.findByPk(id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Trim values
    if (floor_number) floor_number = floor_number.trim();

    // Optional: validate building if updating
    if (building_id) {
      const building = await Building.findByPk(building_id);

      if (!building) {
        return res.status(404).json({
          success: false,
          message: "Building not found",
        });
      }
    }

    floor.building_id = building_id || floor.building_id;
    floor.floor_number = floor_number || floor.floor_number;

    await floor.save();

    return res.json({
      success: true,
      message: "Floor updated successfully",
      data: floor,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Floor already exists for this building",
      });
    }

    console.error("❌ UPDATE FLOOR ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update floor",
    });
  }
};

/* ================= DELETE FLOOR ================= */
export const deleteFloor = async (req, res) => {
  const { id } = req.params;

  try {
    const floor = await Floor.findByPk(id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    await floor.destroy();

    return res.json({
      success: true,
      message: "Floor deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE FLOOR ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete floor",
    });
  }
};

/* ================= GET FLOORS BY BUILDING ================= */
export const getFloorsByBuilding = async (req, res) => {
  const { buildingId } = req.params;

  try {
    const floors = await Floor.findAll({
      where: { building_id: buildingId },
      order: [["id", "ASC"]],
    });

    return res.json({
      success: true,
      data: floors || [],
    });
  } catch (err) {
    console.error("❌ GET FLOORS BY BUILDING ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch floors",
    });
  }
};
