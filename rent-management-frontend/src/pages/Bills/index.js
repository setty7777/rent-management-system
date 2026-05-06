import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import Layout from "../../components/Layout";
import "./index.css";

const Bills = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  // LOGO BASE64
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    fetch("/SettyRents.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      });
  }, []);

  const [previous, setPrevious] = useState("");
  const [current, setCurrent] = useState("");
  const [units, setUnits] = useState("");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [filterTenant, setFilterTenant] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [tenants, setTenants] = useState([]);

  const [tenantId, setTenantId] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      const data = await apiRequest({
        endpoint: "/tenants/getTenants",
        method: "GET",
        navigate,
      });
      if (data) {
        setTenants(Array.isArray(data) ? data : data.data || []);
      }
    };

    fetchTenants();
  }, [navigate]);

  useEffect(() => {
    if (previous !== "" && current !== "") {
      const calculatedUnits = Number(current) - Number(previous);
      const finalUnits = calculatedUnits >= 0 ? calculatedUnits : 0;
      setUnits(finalUnits);

      if (rate !== "") {
        setAmount(finalUnits * Number(rate));
      } else {
        setAmount(0);
      }
    }
  }, [previous, current, rate]);

  useEffect(() => {
    const fetchLastBill = async () => {
      if (!tenantId) return;

      const data = await apiRequest({
        endpoint: `/bills/last?tenantId=${tenantId}`,
        method: "GET",
        navigate,
      });

      if (data?.current_reading) {
        setPrevious(data.current_reading);
      } else {
        setPrevious(0);
      }
    };

    fetchLastBill();
  }, [tenantId, navigate]);

  const fetchBills = useCallback(async () => {
    try {
      const response = await apiRequest({
        endpoint: "/bills/getBills",
        method: "GET",
        navigate,
      });

      console.log("RAW RESPONSE:", response);

      // ✅ HANDLE ALL POSSIBLE STRUCTURES SAFELY
      let bills = [];

      if (Array.isArray(response)) {
        bills = response;
      } else if (Array.isArray(response?.data)) {
        bills = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        bills = response.data.data;
      }

      setRecords(bills);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setRecords([]);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 DUPLICATE CHECK (same tenant + month + year)
    const alreadyExists = records.find(
      (r) =>
        r.tenant_id === Number(tenantId) &&
        r.month === month &&
        r.year === Number(year) &&
        r.id !== editId, // allow update
    );

    if (alreadyExists) {
      alert("Bill already exists for this tenant, month and year");
      return;
    }

    const endpoint = editId ? `/bills/updateBill/${editId}` : `/bills/addBill`;

    const method = editId ? "PUT" : "POST";

    const payload = {
      tenant_id: Number(tenantId),
      previous_reading: Number(previous),
      current_reading: Number(current),
      units: Number(units),
      rate: Number(rate),
      amount: Number(amount),
      month,
      year: Number(year),
    };

    const data = await apiRequest({
      endpoint,
      method,
      body: payload,
      navigate,
    });

    if (!data) return;

    alert(editId ? "Updated successfully" : "Saved successfully");

    fetchBills();

    // ✅ RESET FORM
    setEditId(null);
    setTenantId("");
    setPrevious("");
    setCurrent("");
    setUnits("");
    setRate("");
    setAmount(0);
    setMonth("");
    setYear("");
  };

  const handleEdit = (item) => {
    setEditId(item.id);

    setTenantId(item.tenant_id);
    setPrevious(item.previous_reading);
    setCurrent(item.current_reading);
    setUnits(item.units);
    setRate(item.rate);
    setAmount(item.amount);
    setMonth(item.month);
    setYear(item.year);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    const data = await apiRequest({
      endpoint: `/bills/deleteBill/${id}`,
      method: "DELETE",
      navigate,
    });

    if (!data) return;

    fetchBills();
  };

  const generatePrintHTML = (records) => {
    return (
      `
<html>
<head>
<title>Electricity Bills</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin:0;
  padding:0;
}

.page {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  page-break-after: always;
}

.invoice {
  border:2px solid #000;
  padding:20px;
  margin-bottom:15px;
  width:100%;
  box-sizing:border-box;
}

.logo-container {
  text-align:center;
  margin-bottom:8px;
}

.logo {
  max-width:120px;
}

h2 {
  text-align:center;
  margin:5px 0 12px;
  font-size:18px;
}

table {
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
  font-size:14px;
}

th, td {
  border:1px solid #000;
  padding:8px;
  text-align:left;
}

th {
  background:#f2f2f2;
}

.info-table td {
  width:25%;
}

.total-table {
  margin-top:15px;
  width:100%;
  border-collapse:collapse;
  font-size:15px;
}

.total-table td {
  border:none;
  font-weight:bold;
  padding:8px 4px;
}

.total-label {
  text-align:left;
}

.total-value {
  text-align:right;
  font-size:16px;
}

@media print {
  .page {
    page-break-after: always;
  }
}
</style>
</head>
<body>
` +
      records
        .map((record, index) => {
          const isPageStart = index % 2 === 0;
          const isPageEnd = index % 2 === 1;

          return `
${isPageStart ? `<div class="page">` : ``}

<div class="invoice">

<div class="logo-container">
<img src="${logoBase64}" class="logo"/>
</div>

<h2>Electricity Bill</h2>

<table class="info-table">
<tr>
<th>Tenant</th>
<td>${record.tenant?.name || "N/A"}</td>
<th>Room</th>
<td>${record.tenant?.room?.room_number || "N/A"}</td>
</tr>

<tr>
<th>Floor</th>
<td>${record.tenant?.floor?.floor_number || "N/A"}</td>
<th>Building</th>
<td>${record.tenant?.building?.name || "N/A"}</td>
</tr>

<tr>
<th>Month</th>
<td>${record.month}</td>
<th>Year</th>
<td>${record.year}</td>
</tr>
</table>

<table>
<thead>
<tr>
<th>Previous</th>
<th>Current</th>
<th>Units</th>
<th>Rate</th>
<th>Amount</th>
</tr>
</thead>
<tbody>
<tr>
<td>${record.previous_reading}</td>
<td>${record.current_reading}</td>
<td>${record.units}</td>
<td>${record.rate}</td>
<td>₹ ${record.amount}</td>
</tr>
</tbody>
</table>

<table class="total-table">
<tr>
<td class="total-label">Total Payable</td>
<td class="total-value">₹ ${record.amount}</td>
</tr>
</table>

</div>

${isPageEnd || index === records.length - 1 ? `</div>` : ``}
`;
        })
        .join("") +
      `
<script>
window.onload = () => {
  setTimeout(() => window.print(), 300);
}
</script>
</body>
</html>
`
    );
  };

  const safeRecords = Array.isArray(records) ? records : [];

  const filteredRecords = safeRecords.filter((r) => {
    return (
      (!filterTenant || r.tenant_id === Number(filterTenant)) &&
      (!filterMonth || r.month === filterMonth) &&
      (!filterYear || r.year === Number(filterYear))
    );
  });

  console.log("records:", records);
  console.log("filtered:", filteredRecords);
  // Print all filtered records
  const handlePrintAll = () => {
    // ✅ MANDATORY VALIDATION
    if (!filterTenant) {
      alert("Please select Tenant before printing");
      return;
    }

    if (!filterYear) {
      alert("Please select Year before printing");
      return;
    }

    if (filteredRecords.length === 0) {
      alert("No records to print");
      return;
    }

    const printWindow = window.open("", "", "height=700,width=900");
    printWindow.document.write(generatePrintHTML(filteredRecords));
    printWindow.document.close();
  };

  // Array Years
  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 6 },
    (_, i) => 2020 + i,
  );

  return (
    <Layout>
      <div className="bill-container">
        <h2>Electricity Bills</h2>

        <form className="bill-form" onSubmit={handleSubmit}>
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
            type="number"
            placeholder="Previous"
            value={previous}
            onChange={(e) => setPrevious(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <input type="number" placeholder="Units" value={units} readOnly />
          <input
            type="number"
            placeholder="Rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
          <input type="number" placeholder="Amount" value={amount} readOnly />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            <option value="">Select Month</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button type="submit">{editId ? "Update Bill" : "Save Bill"}</button>
        </form>

        <h2>Filter Bills</h2>
        <div className="filter-container">
          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
          >
            <option value="">All Tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button onClick={handlePrintAll}>Print Filtered</button>
        </div>

        <h2>Bills Records</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Floor</th>
                <th>Building</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td>{item.tenant?.name}</td>
                  <td>{item.tenant?.room?.room_number}</td>
                  <td>{item.tenant?.floor?.floor_number}</td>
                  <td>{item.tenant?.building?.name}</td>
                  <td>{item.units}</td>
                  <td>{item.amount}</td>
                  <td>{item.month}</td>
                  <td>{item.year}</td>
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
          {filteredRecords.map((item) => (
            <div className="mobile-row" key={item.id}>
              <div className="mobile-field">
                <span className="label">Tenant</span>
                <span>{item.tenant?.name || ""}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Room</span>
                <span>{item.tenant?.room?.room_number || ""}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Floor</span>
                <span>{item.tenant?.floor?.floor_number || ""}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Building</span>
                <span>{item.tenant?.building?.name || ""}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Units</span>
                <span>{item.units}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Amount</span>
                <span>₹ {item.amount}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Month</span>
                <span>{item.month}</span>
              </div>

              <div className="mobile-field">
                <span className="label">Year</span>
                <span>{item.year}</span>
              </div>

              <div className="mobile-actions">
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

export default Bills;
