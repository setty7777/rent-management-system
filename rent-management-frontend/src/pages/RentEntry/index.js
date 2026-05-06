import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import Layout from "../../components/Layout";
import "./index.css";

const RentEntry = () => {
  const [tenants, setTenants] = useState([]);
  const [entries, setEntries] = useState([]);

  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [tenantId, setTenantId] = useState("");
  const [month, setMonth] = useState("");
  const [rent, setRent] = useState("");
  const [water, setWater] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [electricity, setElectricity] = useState("");
  const [previousDue, setPreviousDue] = useState(0);
  const [paid, setPaid] = useState("");
  const [advance, setAdvance] = useState("");
  const [status, setStatus] = useState("not vacated");

  const [editingId, setEditingId] = useState(null);

  const [filterRoom, setFilterRoom] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    fetch("/SettyRents.png") // place image in public folder
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      });
  }, []);

  const navigate = useNavigate();

  /* ================= FETCH TENANTS ================= */
  const fetchTenants = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/tenants/getTenants",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setTenants(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  /* ================= FETCH BUILDINGS & ROOMS ================= */
  const fetchBuildings = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/buildings/getBuildings",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setBuildings(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  /* ================= FETCH ENTRIES (FIXED ESLINT WARNING) ================= */
  const fetchRooms = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/rooms/getRooms",
      method: "GET",
      navigate,
    });

    if (!data) return;

    setRooms(Array.isArray(data) ? data : data.data || []);
  }, [navigate]);

  const fetchEntries = useCallback(async () => {
    const data = await apiRequest({
      endpoint: "/rent/getRentEntries",
      method: "GET",
      navigate,
    });

    if (!data) return;

    const list = Array.isArray(data) ? data : data.data || [];

    const formatted = list.map((e) => ({
      ...e,
      building: e.building || "N/A",
      room: e.room || "N/A",
    }));

    formatted.sort((a, b) => a.id - b.id);

    setEntries(formatted);
  }, [navigate]);

  useEffect(() => {
    fetchTenants();
    fetchBuildings();
    fetchRooms();
    fetchEntries();
  }, [fetchTenants, fetchBuildings, fetchRooms, fetchEntries]);

  /* ================= AUTO FILL FROM LAST ENTRY ================= */
  useEffect(() => {
    if (!tenantId || editingId || !month) return;

    const tenantEntries = entries
      .filter((e) => Number(e.tenant_id) === Number(tenantId))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // 🔥 find ONLY previous month entry
    const previousEntries = tenantEntries.filter((e) => e.month < month);

    if (previousEntries.length > 0) {
      const last = previousEntries[previousEntries.length - 1];

      setRent(last.rent || 0);
      setWater(last.water || 300);
      setMaintenance(last.maintenance || 0);
      setElectricity(last.electricity || 0);

      // 🔥 correct business logic
      setPreviousDue(Number(last.due || 0));
    } else {
      setRent("");
      setWater(300);
      setMaintenance("");
      setElectricity("");
      setPreviousDue(0);
    }
  }, [tenantId, entries, editingId, month]);

  /* ================  VALIDATIONS ================== */
  const validateRentEntry = () => {
    if (!tenantId) {
      alert("Please select tenant");
      return false;
    }

    if (!month) {
      alert("Please select month");
      return false;
    }

    if (Number(paid) < 0) {
      alert("Paid amount cannot be negative");
      return false;
    }

    if (
      Number(rent) < 0 ||
      Number(water) < 0 ||
      Number(maintenance) < 0 ||
      Number(electricity) < 0
    ) {
      alert("Amounts cannot be negative");
      return false;
    }

    return true;
  };

  /* ================= CALCULATIONS ================= */
  const calculateTotal = () =>
    Number(rent || 0) +
    Number(water || 0) +
    Number(maintenance || 0) +
    Number(electricity || 0) +
    Number(previousDue || 0);

  const calculateDue = () => {
    const total = calculateTotal();
    const p = Number(paid || 0);
    const adv = Number(advance || 0);

    return status === "vacating" ? total - p - adv : total - p;
  };

  const total = calculateTotal();
  const due = calculateDue();

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateRentEntry()) return;

  const payload = {
    tenant_id: Number(tenantId),
    month,
    rent: Number(rent || 0),
    water: Number(water || 0),
    maintenance: Number(maintenance || 0),
    electricity: Number(electricity || 0),
    previous_due: Number(previousDue || 0),
    total: Number(total || 0),
    paid: Number(paid || 0),
    advance: Number(advance || 0),
    status,
    due: Number(due || 0),
  };

  const endpoint = editingId
    ? `/rent/updateRentEntry/${editingId}`
    : `/rent/createRentEntry`;

  const method = editingId ? "PUT" : "POST";

  const data = await apiRequest({
    endpoint,
    method,
    body: payload,
    navigate,
  });

  if (!data) return;

  // ✅ SUCCESS MESSAGE
  alert(data.message || "Saved successfully");

  fetchEntries();
  handleCancel();
};

  /* ================= EDIT ================= */
  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setTenantId(entry.tenant_id.toString());
    setMonth(entry.month);
    setRent(entry.rent);
    setWater(entry.water);
    setMaintenance(entry.maintenance);
    setElectricity(entry.electricity);
    setPreviousDue(entry.previous_due);
    setPaid(entry.paid);
    setAdvance(entry.advance);
    setStatus(entry.status);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;

    const data = await apiRequest({
      endpoint: `/rent/deleteRentEntry/${id}`,
      method: "DELETE",
      navigate,
    });

    if (!data) return;

    alert(data.message || "Deleted successfully");

    fetchEntries();
  };

  const handleCancel = () => {
    setEditingId(null);
    setTenantId("");
    setMonth("");
    setRent("");
    setWater("");
    setMaintenance("");
    setElectricity("");
    setPreviousDue(0);
    setPaid("");
    setAdvance("");
    setStatus("not vacated");
  };

  /* ================= PRINT FILTERED ================= */
  const handlePrint = () => {
    if (!filterBuilding || !filterYear) {
      alert("Building and Year are mandatory for printing");
      return;
    }

    const filtered = entries.filter((e) => {
      const [year, month] = e.month.split("-");

      return (
        e.building === filterBuilding &&
        year === filterYear &&
        (filterMonth ? month === filterMonth : true) &&
        (filterRoom ? e.room === filterRoom : true)
      );
    });

    if (filtered.length === 0) {
      alert("No records found");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=750");

    if (!printWindow) {
      alert("Popup blocked! Please allow popups.");
      return;
    }

    const tableRows = filtered
      .map(
        (e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="text-align:left;">${e.tenant?.name || "N/A"}</td>
      <td>${e.building}</td>
      <td>${e.room}</td>
      <td>${e.month}</td>
      <td>₹ ${e.total}</td>
      <td>₹ ${e.paid}</td>
      <td style="color:${e.due > 0 ? "#b91c1c" : "#166534"}; font-weight:600;">
        ₹ ${e.due}
      </td>
    </tr>
  `,
      )
      .join("");

    const totalAmount = filtered.reduce((s, e) => s + Number(e.total), 0);
    const totalPaid = filtered.reduce((s, e) => s + Number(e.paid), 0);
    const totalDue = filtered.reduce((s, e) => s + Number(e.due), 0);

    const title =
      filterRoom || filterMonth
        ? "DETAILED RENT STATEMENT"
        : "ANNUAL RENT STATEMENT";

    printWindow.document.write(`
    <html>
      <head>
        <title>Rent Report</title>

        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 20px;
            background: #fff;
            color: #111;
          }

          .page {
            max-width: 1000px;
            margin: auto;
          }

          /* ================= HEADER ================= */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }

          .left {
            width: 20%;
          }

          .logo {
            height: 55px;
          }

          .center {
            width: 60%;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .building-name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }

          /* ✅ FIXED RIGHT SIDE */
          .right {
            width: 20%;
            font-size: 12px;

            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
          }

          .right-row {
            display: flex;
            justify-content: space-between;
            width: 100%;
          }

          .label {
            font-weight: 600;
            width: 50px;
            text-align: left;
          }

          .value {
            text-align: right;
            flex: 1;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th {
            border: 1px solid #000;
            padding: 8px;
            background: #f3f3f3;
            font-weight: 700;
          }

          td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }

          tbody tr:nth-child(even) {
            background: #fafafa;
          }

          /* SUMMARY */
          .summary {
            margin-top: 15px;
            border-top: 2px solid #000;
            padding-top: 10px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            font-size: 13px;
          }

          .due { color: #b91c1c; font-weight: 700; }
          .paid { color: #166534; font-weight: 700; }

          /* FOOTER */
          .footer {
            margin-top: 20px;
            font-size: 10px;
            text-align: center;
            color: #555;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
        </style>
      </head>

      <body>
        <div class="page">

          <div class="header">

            <div class="left">
              ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : ""}
            </div>

            <div class="center">
              <div class="building-name">${filterBuilding}</div>
              <div class="title">${title}</div>
            </div>

            <!-- ✅ FIXED RIGHT SIDE STRUCTURE -->
            <div class="right">

              <div class="right-row">
                <span class="label">Date</span>
                <span class="value">${new Date().toLocaleDateString()}</span>
              </div>

              <div class="right-row">
                <span class="label">Year</span>
                <span class="value">${filterYear}</span>
              </div>

              ${
                filterMonth
                  ? `
              <div class="right-row">
                <span class="label">Month</span>
                <span class="value">${filterMonth}</span>
              </div>`
                  : ""
              }

            </div>

          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tenant</th>
                <th>Building</th>
                <th>Room</th>
                <th>Month</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="summary">
            <div><b>Total:</b> ₹ ${totalAmount}</div>
            <div class="paid"><b>Paid:</b> ₹ ${totalPaid}</div>
            <div class="due"><b>Due:</b> ₹ ${totalDue}</div>
          </div>

          <div class="footer">
            System Generated Report • Valid without signature
          </div>

        </div>
      </body>
    </html>
  `);

    printWindow.document.close();

    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    const img = printWindow.document.querySelector("img");

    if (img) {
      if (img.complete) triggerPrint();
      else {
        img.onload = triggerPrint;
        img.onerror = triggerPrint;
      }
    } else {
      triggerPrint();
    }
  };

  /* ================= FILTER OPTIONS ================= */
  const buildingOptions = buildings.map((b) => b.name);
  const roomOptions = rooms.map((r) => r.room_number);
  const monthOptions = [...new Set(entries.map((e) => e.month.split("-")[1]))];
  const yearOptions = [...new Set(entries.map((e) => e.month.split("-")[0]))];

  const filteredEntries = entries.filter((e) => {
    const [year, m] = e.month.split("-");
    return (
      (!filterRoom || e.room === filterRoom) &&
      (!filterBuilding || e.building === filterBuilding) &&
      (!filterMonth || m === filterMonth) &&
      (!filterYear || year === filterYear)
    );
  });

  return (
    <Layout>
      <div className="rent-page">
        <h2>{editingId ? "Update Rent Entry" : "Add Rent Entry"}</h2>

        <form className="rent-form" onSubmit={handleSubmit}>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
          >
            <option value="">Select Tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Rent"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
          />
          <input
            type="number"
            placeholder="Water"
            value={water}
            onChange={(e) => setWater(e.target.value)}
          />
          <input
            type="number"
            placeholder="Maintenance"
            value={maintenance}
            onChange={(e) => setMaintenance(e.target.value)}
          />
          <input
            type="number"
            placeholder="Electricity"
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
          />

          <input
            type="number"
            placeholder="Previous Due"
            value={previousDue}
            readOnly
          />

          <input
            type="number"
            placeholder="Paid"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
          />
          <input
            type="number"
            placeholder="Advance"
            value={advance}
            onChange={(e) => setAdvance(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="not vacated">Not Vacated</option>
            <option value="vacating">Vacating</option>
          </select>

          <div className="rent-calculation">
            <p>Total: {total}</p>
            <p className={due > 0 ? "due-overdue" : "due-refund"}>Due: {due}</p>
          </div>

          <button type="submit">
            {editingId ? "Update Entry" : "Save Entry"}
          </button>
        </form>

        <h2>Filter Rent Details</h2>

        <div className="filter-box">
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="">All Buildings</option>
            {buildingOptions.map((b, i) => (
              <option key={i} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="">All Rooms</option>
            {roomOptions.map((r, i) => (
              <option key={i} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {monthOptions.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {yearOptions.map((y, i) => (
              <option key={i} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button onClick={handlePrint}>Print Filtered</button>
        </div>

        <h2>Rent Records</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Building</th>
                <th>Room</th>
                <th>Month</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEntries.map((e) => (
                <tr key={e.id}>
                  <td>{e.tenant?.name}</td>
                  <td>{e.building || "N/A"}</td>
                  <td>{e.room || "N/A"}</td>
                  <td>{e.month}</td>
                  <td>{e.total}</td>
                  <td>{e.paid}</td>
                  <td className={e.due > 0 ? "due-overdue" : "due-refund"}>
                    {e.due}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(e)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(e.id)}
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

export default RentEntry;
