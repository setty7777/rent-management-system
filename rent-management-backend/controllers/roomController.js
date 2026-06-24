import { Room, Building, Floor } from "../models/index.js";

/* ================= VALIDATION ================= */
const validateRoom = ({ building_id, floor_id, room_number }) => {
  if (!building_id || !floor_id || !room_number?.trim()) {
    return "Building, floor and room number are required";
  }

  return null;
};

/* ================= GET ALL ROOMS ================= */
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Floor,
          as: "floor",
          attributes: ["id", "floor_number"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: rooms || [],
    });
  } catch (err) {
    console.error("❌ GET ROOMS ERROR FULL:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

/* ================= ADD ROOM ================= */
export const addRoom = async (req, res) => {
  let { building_id, floor_id, room_number } = req.body;

  room_number = room_number?.trim();

  // Convert to Number
  building_id = Number(building_id);
  floor_id = Number(floor_id);

  const validationError = validateRoom({
    building_id,
    floor_id,
    room_number,
  });

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    // Check building
    const building = await Building.findByPk(building_id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    // Check floor
    const floor = await Floor.findByPk(floor_id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    console.log("building_id:", building_id);
    console.log("floor.building_id:", floor.building_id);

    // FIXED HERE
    if (Number(floor.building_id) !== Number(building_id)) {
      return res.status(400).json({
        success: false,
        message: "Selected floor does not belong to this building",
      });
    }

    const room = await Room.create({
      building_id,
      floor_id,
      room_number,
    });

    const newRoom = await Room.findByPk(room.id, {
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["name"],
        },
        {
          model: Floor,
          as: "floor",
          attributes: ["floor_number"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Room added successfully",
      data: newRoom,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Room already exists on this floor",
      });
    }

    console.error("❌ ADD ROOM ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to add room",
    });
  }
};

/* ================= UPDATE ROOM ================= */
export const updateRoom = async (req, res) => {
  const { id } = req.params;

  let { building_id, floor_id, room_number } = req.body;

  room_number = room_number?.trim();

  // Convert to Number
  building_id = Number(building_id);
  floor_id = Number(floor_id);

  try {
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const building = await Building.findByPk(building_id);
    const floor = await Floor.findByPk(floor_id);

    if (!building || !floor) {
      return res.status(404).json({
        success: false,
        message: "Building or floor not found",
      });
    }

    // FIXED HERE
    if (Number(floor.building_id) !== Number(building_id)) {
      return res.status(400).json({
        success: false,
        message: "Selected floor does not belong to this building",
      });
    }

    room.building_id = building_id;
    room.floor_id = floor_id;
    room.room_number = room_number;

    await room.save();

    const updatedRoom = await Room.findByPk(id, {
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["name"],
        },
        {
          model: Floor,
          as: "floor",
          attributes: ["floor_number"],
        },
      ],
    });

    return res.json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Room already exists on this floor",
      });
    }

    console.error("❌ UPDATE ROOM ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update room",
    });
  }
};

/* ================= DELETE ROOM ================= */
export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await room.destroy();

    return res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE ROOM ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
    });
  }
};
