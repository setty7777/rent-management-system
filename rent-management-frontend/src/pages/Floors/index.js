import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import Layout from "../../components/Layout";
import "./index.css";

const Floors = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [buildingId, setBuildingId] = useState("");
  const [floorName, setFloorName] = useState("");
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  // Fetch buildings with token
  const fetchBuildings = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/buildings/getBuildings",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setBuildings(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  // Fetch floors with token
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

  useEffect(() => {
    fetchBuildings();
    fetchFloors();
  }, [fetchFloors, fetchBuildings]);

  // Add / Update floor
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buildingId || !floorName) {
      alert("Please select building and enter floor.");
      return;
    }

    const endpoint = editId
      ? `/floors/updateFloor/${editId}`
      : `/floors/addFloor`;

    const method = editId ? "PUT" : "POST";

    const data = await apiRequest({
      endpoint,
      method,
      body: {
        building_id: parseInt(buildingId),
        floor_number: floorName,
      },
      navigate,
    });

    if (!data) return;

    alert(data.message || "Success");

    setBuildingId("");
    setFloorName("");
    setEditId(null);

    fetchFloors();
  };

  const handleEdit = (floor) => {
    setEditId(floor.id);
    setBuildingId(floor.buildingId.toString());
    setFloorName(floor.floorName);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this floor?")) return;

    const data = await apiRequest({
      endpoint: `/floors/deleteFloor/${id}`,
      method: "DELETE",
      navigate,
    });

    if (!data) return;

    alert(data.message || "Deleted successfully");

    fetchFloors();
  };

  const handleCancel = () => {
    setEditId(null);
    setBuildingId("");
    setFloorName("");
  };

  return (
    <Layout>
      <div className="floor-container">
        <h2>{editId ? "Update Floor" : "Add Floor"}</h2>

        <form className="floor-form" onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            required
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Floor Name (Ex: Ground, Floor 1)"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
            required
          />

          <button type="submit">
            {editId ? "Update Floor" : "Save Floor"}
          </button>
          {editId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Floors List</h2>

        <div className="table-container desktop-table">
          <table>
            <thead>
              <tr>
                <th>Building</th>
                <th>Floor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {floors.map((f) => (
                <tr key={f.id}>
                  <td>{f.buildingName}</td>
                  <td>{f.floorName}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(f)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(f.id)}
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
          {floors.map((f) => (
            <div key={f.id} className="mobile-row">
              <div className="mobile-field">
                <span className="label">Building:</span>{" "}
                <span className="value">{f.buildingName}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Floor:</span>{" "}
                <span className="value">{f.floorName}</span>
              </div>
              <div className="mobile-field">
                <button className="edit-btn" onClick={() => handleEdit(f)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(f.id)}
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

export default Floors;
