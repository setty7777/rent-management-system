import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import "./index.css";

const Buildings = () => {
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  // Fetch buildings
  const fetchBuildings = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/buildings",
      method: "GET",
      navigate,
    });

    if (!data || data.success === false) {
      toast.error(data?.message || "Failed to fetch buildings");
      return;
    }

    setBuildings(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buildingName || !address) {
      toast.error("Please provide building name and address.");
      return;
    }

    const endpoint = editId ? `/buildings/${editId}` : `/buildings`;

    const method = editId ? "PUT" : "POST";

    const data = await apiRequest({
      endpoint,
      method,
      body: {
        name: buildingName,
        address,
      },
      navigate,
    });

    if (!data || data.success === false) {
      toast.error(data?.message || "Operation failed");
      return;
    }

    toast.success(data.message || "Success");

    setBuildingName("");
    setAddress("");
    setEditId(null);

    fetchBuildings();
  };

  // EDIT
  const handleEdit = (building) => {
    setBuildingName(building.name);
    setAddress(building.address);
    setEditId(building.id);
  };

  // CANCEL
  const handleCancel = () => {
    setEditId(null);
    setBuildingName("");
    setAddress("");
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this building?")) return;

    const data = await apiRequest({
      endpoint: `/buildings/${id}`,
      method: "DELETE",
      navigate,
    });

    if (!data || data.success === false) {
      toast.error(data?.message || "Delete failed");
      return;
    }

    toast.success(data.message || "Deleted successfully");

    fetchBuildings();
  };

  return (
    <Layout>
      <div className="building-container">
        <h2>{editId ? "Update Building" : "Add Building"}</h2>

        <form className="building-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Building Name"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <button type="submit">
            {editId ? "Update Building" : "Save Building"}
          </button>

          {editId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Buildings List</h2>

        <div className="table-container desktop-table">
          <table>
            <thead>
              <tr>
                <th>Building Name</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {buildings.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.address}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
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
          {buildings.map((item) => (
            <div key={item.id} className="mobile-row">
              <div className="mobile-field">
                <span className="label">Building:</span>
                <span className="value">{item.name}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Address:</span>
                <span className="value">{item.address}</span>
              </div>

              <div className="mobile-field">
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
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

export default Buildings;
