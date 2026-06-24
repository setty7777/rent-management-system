import Building from "./Building.js";
import Floor from "./Floor.js";
import Room from "./Room.js";
import Tenant from "./Tenant.js";
import RentEntry from "./RentEntry.js";
import Bill from "./Bill.js";

// =========================
// ASSOCIATIONS (CENTRALIZED)
// =========================

// Building
Building.hasMany(Floor, { foreignKey: "building_id", as: "floors" });
Building.hasMany(Room, { foreignKey: "building_id", as: "rooms" });
Building.hasMany(Tenant, { foreignKey: "building_id", as: "tenants" });

// Floor
Floor.belongsTo(Building, { foreignKey: "building_id", as: "building" });
Floor.hasMany(Room, { foreignKey: "floor_id", as: "rooms" });
Floor.hasMany(Tenant, { foreignKey: "floor_id", as: "tenants" });

// Room
Room.belongsTo(Building, { foreignKey: "building_id", as: "building" });
Room.belongsTo(Floor, { foreignKey: "floor_id", as: "floor" });
Room.hasMany(Tenant, { foreignKey: "room_id", as: "tenants" });

// Tenant
Tenant.belongsTo(Building, { foreignKey: "building_id", as: "building" });
Tenant.belongsTo(Floor, { foreignKey: "floor_id", as: "floor" });
Tenant.belongsTo(Room, { foreignKey: "room_id", as: "room" });
Tenant.hasMany(RentEntry, { foreignKey: "tenant_id", as: "rent_entries" });
Tenant.hasMany(Bill, { foreignKey: "tenant_id", as: "bills" });

// RentEntry
RentEntry.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

// Bill
Bill.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

export { Building, Floor, Room, Tenant, RentEntry, Bill };
