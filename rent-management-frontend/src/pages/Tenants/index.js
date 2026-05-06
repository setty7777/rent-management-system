import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import Layout from "../../components/Layout";
import "./index.css";

const Tenants = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [advance, setAdvance] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [filterName, setFilterName] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch Buildings
  const fetchBuildings = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/buildings/getBuildings",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setBuildings(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  // Fetch Floors
  const fetchFloors = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/floors/getFloors",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setFloors(
      (Array.isArray(data) ? data : []).map((f) => ({
        id: f.id,
        buildingId: f.building_id,
        buildingName: f.building?.name || "",
        floorName: f.floor_number,
      })),
    );
  }, [navigate]);

  // Fetch Rooms
  const fetchRooms = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/rooms/getRooms",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setRooms(
      (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        buildingId: r.building_id,
        buildingName: r.building?.name || "",
        floorId: r.floor_id,
        floorName: r.floor?.floor_number || "",
        roomNumber: r.room_number,
      })),
    );
  }, [navigate]);

  // Fetch Tenants
  const fetchTenants = useCallback(async () => {
  const res = await apiRequest({
    endpoint: "/tenants/getTenants",
    method: "GET",
    navigate,
  });

  if (!res) return;

  const tenantsData = res.data || []; 

  setTenants(
    tenantsData.map((t) => ({
      ...t,
      documents: Array.isArray(t.documents)
        ? t.documents
        : typeof t.documents === "string"
        ? JSON.parse(t.documents)
        : [],
      building: { name: t.building?.name || "" },
      floor: { floor_number: t.floor?.floor_number || "" },
      room: { room_number: t.room?.room_number || "" },
    }))
  );
}, [navigate]);

  useEffect(() => {
    fetchBuildings();
    fetchFloors();
    fetchRooms();
    fetchTenants();
  }, [fetchBuildings, fetchFloors, fetchRooms, fetchTenants]);

  const filteredFloors = floors.filter(
    (f) => f.buildingId === parseInt(buildingId),
  );
  const filteredRooms = rooms.filter(
    (r) =>
      r.buildingId === parseInt(buildingId) && r.floorId === parseInt(floorId),
  );

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((f) => {
      if (
        !["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(
          f.type,
        )
      ) {
        alert(`Invalid file: ${f.name}`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
  };

 const validate = () => {
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    alert("Tenant name must contain only letters and spaces");
    return false;
  }

  // ✅ Must be exactly 10 digits
  if (!/^\d{10}$/.test(phone)) {
    alert("Phone number must contain exactly 10 digits");
    return false;
  }

  return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!validate()) return;

    if (
      !buildingId ||
      !floorId ||
      !roomId ||
      !name ||
      !phone ||
      !advance ||
      !joiningDate
    ) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Prepare FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("advance", advance);
    formData.append("join_date", joiningDate);
    formData.append("building_id", buildingId);
    formData.append("floor_id", floorId);
    formData.append("room_id", roomId);

    files.forEach((file) => formData.append("documents", file));

    // ✅ Decide endpoint
    const endpoint = editingId
      ? `/tenants/updateTenant/${editingId}`
      : `/tenants/addTenant`;

    const method = editingId ? "PUT" : "POST";


    const data = await apiRequest({
      endpoint,
      method,
      body: formData,
      navigate,
    });

    if (!data) return;

    // ✅ SUCCESS MESSAGE (from backend)
    alert(data.message);

    // ✅ Refresh latest data from backend 
    fetchTenants();

    handleCancel();
  };
  const handleEdit = (tenant) => {
    setEditingId(tenant.id);
    setName(tenant.name);
    setPhone(tenant.phone);
    setAdvance(tenant.advance);
    setJoiningDate(tenant.join_date);
    setBuildingId(tenant.building_id.toString());
    setFloorId(tenant.floor_id.toString());
    setRoomId(tenant.room_id.toString());
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant?")) return;

    const data = await apiRequest({
      endpoint: `/tenants/deleteTenant/${id}`,
      method: "DELETE",
      navigate,
    });

    if (!data) return;

    alert(data.message || "Deleted successfully");

    fetchTenants();
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setAdvance("");
    setJoiningDate("");
    setBuildingId("");
    setFloorId("");
    setRoomId("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredTenants = tenants.filter(
    (t) =>
      (!filterName || t.name === filterName) &&
      (!filterRoom || String(t.room?.room_number) === String(filterRoom)) &&
      (!filterBuilding || String(t.building_id) === String(filterBuilding)),
  );

  // Shared print styles
  const printStyles = `
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:0; }
  .page { page-break-after: always; display:flex; justify-content:center; align-items:center; height:100vh; }
  .page-border { border:2px solid #000; width:95%; height:95%; box-sizing:border-box; padding:30px; display:flex; flex-direction:column; }
  .invoice { width:100%; height:100%; display:flex; flex-direction:column; }
  .header { display:flex; align-items:center; gap:20px; margin-bottom:40px; }
  .logo { max-width:120px; }
  h2 { font-size:28px; margin:0; }
  table { width:100%; border-collapse:collapse; font-size:24px; flex-grow:1; }
  th, td { border:1px solid #000; padding:20px; text-align:left; vertical-align:middle; }
  th { width:30%; background:#f2f2f2; font-weight:bold; }
  td { width:70%; }
  .full-page { width:100%; page-break-after:always; display:flex; justify-content:center; align-items:center; height:100vh; }
  .full-page img, .full-page embed { width:95%; max-height:95vh; object-fit:contain; border:2px solid #000; padding:10px; box-sizing:border-box; }
</style>
`;

  // Generate HTML for a single tenant
  const generateTenantHTML = (tenant) => {
    const buildingName = tenant.building?.name || "";
    const floorName = tenant.floor?.floor_number || "";
    const roomNumber = tenant.room?.room_number || "";

    const filesHtml = tenant.documents
      ? tenant.documents
          .map(
            (f) => `
    <div class="full-page">
      ${
        f.url.match(/\.(jpg|jpeg|png|gif)$/i)
          ? `<img src="${f.url}" />`
          : `<embed src="${f.url}" type="application/pdf" />`
      }
    </div>
  `,
          )
          .join("")
      : "";

    return `
  <div class="page">
    <div class="page-border">
      <div class="invoice">
        <div class="header">
          <img src="${window.location.origin}/SettyRents.png" class="logo" />
          <h2>Tenant Details</h2>
        </div>
        <table>
          <tr><th>Name</th><td>${tenant.name}</td></tr>
          <tr><th>Phone</th><td>${tenant.phone}</td></tr>
          <tr><th>Building</th><td>${buildingName}</td></tr>
          <tr><th>Floor</th><td>${floorName}</td></tr>
          <tr><th>Room</th><td>${roomNumber}</td></tr>
          <tr><th>Advance</th><td>${tenant.advance}</td></tr>
          <tr><th>Joining Date</th><td>${tenant.join_date}</td></tr>
        </table>
      </div>
    </div>
  </div>

  ${filesHtml}
`;
  };

  // Print all filtered tenants with building check
  const printAllTenants = (filteredTenants, selectedBuilding) => {
    if (!selectedBuilding) {
      alert("Building is mandatory to print filtered tenants");
      return;
    }

    if (!filteredTenants || !filteredTenants.length) {
      alert("No tenants to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Allow popups.");
      return;
    }

    const content = filteredTenants.map(generateTenantHTML).join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>All Tenants</title>
        ${printStyles}
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 800);
          }
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  return (
    <Layout>
      <div className="tenant-container">
        <h2>{editingId ? "Edit Tenant" : "Add Tenant"}</h2>
        <form className="tenant-form" onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setFloorId("");
              setRoomId("");
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
            onChange={(e) => {
              setFloorId(e.target.value);
              setRoomId("");
            }}
            required
          >
            <option value="">Select Floor</option>
            {filteredFloors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floorName}
              </option>
            ))}
          </select>

          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select Room</option>
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomNumber}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tenant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Advance"
            value={advance}
            onChange={(e) => setAdvance(e.target.value)}
            required
          />
          <input
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />

          <input
            type="file"
            name="documents"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button type="submit">
            {editingId ? "Update Tenant" : "Add Tenant"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        {/* Filter Section */}
        <h2>Filter Tenants</h2>
        <div className="filter-box">
          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          >
            <option value="">All Tenants</option>
            {[...new Set(tenants.map((t) => t.name))].map((name, i) => (
              <option key={i} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.roomNumber}>
                {r.roomNumber}
              </option>
            ))}
          </select>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => printAllTenants(filteredTenants, filterBuilding)}
          >
            Print Filtered
          </button>
        </div>

        <h2>Tenants List</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Building</th>
                <th>Floor</th>
                <th>Room</th>
                <th>Advance</th>
                <th>Joining</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.phone}</td>
                  <td>{t.building?.name}</td>

                  {/* FLOOR FIX */}
                  <td>{t.floor?.floor_number || "N/A"}</td>

                  <td>{t.room?.room_number}</td>
                  <td>{t.advance}</td>
                  <td>{t.join_date}</td>

                  <td>
                    {Array.isArray(t.documents) && t.documents.length > 0
                      ? t.documents.map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            View
                          </a>
                        ))
                      : "No Docs"}
                  </td>

                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Tenants;
