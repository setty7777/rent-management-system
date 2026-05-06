import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import Layout from "../../components/Layout";
import "./index.css";

const Rooms = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  // Fetch buildings
  const fetchBuildings = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/buildings/getBuildings",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setBuildings(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  // Fetch floors
  const fetchFloors = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/floors/getFloors",
      method: "GET",
      navigate,
    });

    if (!data) return;

    const formatted = (Array.isArray(data) ? data : data.data || []).map(
      (f) => ({
        id: f.id,
        buildingId: f.building_id,
        buildingName: f.building?.name || "",
        floorName: f.floor_number,
      }),
    );

    setFloors(formatted);
  }, [navigate]);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/rooms/getRooms",
      method: "GET",
      navigate,
    });

    if (!data) return;

    const formatted = (Array.isArray(data) ? data : data.data || []).map(
      (r) => ({
        id: r.id,
        buildingId: r.building_id,
        buildingName: r.building?.name || "",
        floorId: r.floor_id,
        floorName: r.floor?.floor_number || "",
        roomNumber: r.room_number,
      }),
    );

    // ✅ SORT BY ID ASC (old → new)
    formatted.sort((a, b) => a.id - b.id);

    setRooms(formatted);
  }, [navigate]);

  useEffect(() => {
    fetchBuildings();
    fetchFloors();
    fetchRooms();
  }, [fetchBuildings, fetchFloors, fetchRooms]);

  const filteredFloors = floors.filter(
    (f) => f.buildingId === parseInt(buildingId),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buildingId || !floorId || !roomNumber) {
      alert("Please fill all fields");
      return;
    }

    const endpoint = editId ? `/rooms/updateRoom/${editId}` : `/rooms/addRoom`;

    const method = editId ? "PUT" : "POST";

    const data = await apiRequest({
      endpoint,
      method,
      body: {
        building_id: parseInt(buildingId),
        floor_id: parseInt(floorId),
        room_number: roomNumber,
      },
      navigate,
    });

    if (!data) return;

    alert(data.message || "Success");

    setEditId(null);
    setBuildingId("");
    setFloorId("");
    setRoomNumber("");

    fetchRooms(); // ✅ instead of manual state update
  };

  const handleEdit = (room) => {
    setEditId(room.id);
    setBuildingId(room.buildingId.toString());
    setFloorId(room.floorId.toString());
    setRoomNumber(room.roomNumber);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;

    const data = await apiRequest({
      endpoint: `/rooms/deleteRoom/${id}`,
      method: "DELETE",
      navigate,
    });

    if (!data) return;

    alert(data.message || "Deleted successfully");

    fetchRooms();
  };

  const handleCancel = () => {
    setEditId(null);
    setBuildingId("");
    setFloorId("");
    setRoomNumber("");
  };

  return (
    <Layout>
      <div className="room-container">
        <h2>{editId ? "Update Room" : "Add Room"}</h2>

        <form className="room-form" onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setFloorId("");
            }}
            required
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            required
          >
            <option value="">Select Floor</option>
            {filteredFloors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floorName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
          <button type="submit">{editId ? "Update Room" : "Save Room"}</button>
          {editId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Rooms List</h2>
        <div className="table-container desktop-table">
          <table>
            <thead>
              <tr>
                <th>Building</th>
                <th>Floor</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.buildingName}</td>
                  <td>{r.floorName}</td>
                  <td>{r.roomNumber}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(r)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-list">
          {rooms.map((r) => (
            <div key={r.id} className="mobile-row">
              <div className="mobile-field">
                <span className="label">Building:</span>{" "}
                <span className="value">{r.buildingName}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Floor:</span>{" "}
                <span className="value">{r.floorName}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Room:</span>{" "}
                <span className="value">{r.roomNumber}</span>
              </div>
              <div className="mobile-field">
                <button className="edit-btn" onClick={() => handleEdit(r)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(r.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Rooms;
