import Building from "../models/Building.js";

/* ================= GET ALL BUILDINGS ================= */
export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.findAll({
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: buildings || [],
    });
  } catch (err) {
    console.error("❌ GET BUILDINGS ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch buildings",
    });
  }
};

/* ================= ADD BUILDING ================= */
export const addBuilding = async (req, res) => {
  let { name, address } = req.body;

  // ✅ Trim inputs
  name = name?.trim();
  address = address?.trim();

  // ✅ Validation
  if (!name || !address) {
    return res.status(400).json({
      success: false,
      message: "Name and address are required",
    });
  }

  try {
    const building = await Building.create({ name, address });

    return res.status(201).json({
      success: true,
      message: "Building added successfully",
      data: building,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.errors?.[0]?.path;

      if (field === "name") {
        return res.status(400).json({
          success: false,
          message: "Building name already exists",
        });
      }

      if (field === "address") {
        return res.status(400).json({
          success: false,
          message: "Address already exists",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Duplicate entry",
      });
    }

    console.error("❌ ADD BUILDING ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add building",
    });
  }
};

/* ================= DELETE BUILDING ================= */
export const deleteBuilding = async (req, res) => {
  const { id } = req.params;

  try {
    const building = await Building.findByPk(id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    await building.destroy();

    return res.json({
      success: true,
      message: "Building deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE BUILDING ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete building",
    });
  }
};

/* ================= UPDATE BUILDING ================= */
export const updateBuilding = async (req, res) => {
  const { id } = req.params;
  let { name, address } = req.body;

  try {
    const building = await Building.findByPk(id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    // ✅ Trim if provided
    if (name) name = name.trim();
    if (address) address = address.trim();

    // ✅ Update only if exists
    building.name = name || building.name;
    building.address = address || building.address;

    await building.save();

    return res.json({
      success: true,
      message: "Building updated successfully",
      data: building,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.errors?.[0]?.path;

      if (field === "name") {
        return res.status(400).json({
          success: false,
          message: "Building name already exists",
        });
      }

      if (field === "address") {
        return res.status(400).json({
          success: false,
          message: "Address already exists",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Duplicate entry",
      });
    }

    console.error("❌ UPDATE BUILDING ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update building",
    });
  }
};
