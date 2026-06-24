import { useEffect, useState } from "react";
import "./index.css";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { apiRequest } from "../../utils/api";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const DashboardCards = () => {
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    buildings: 0,
    floors: 0,
    rooms: 0,
    tenants: 0,
  });

  const extractLength = (res) => {
    if (!res) return 0;
    if (Array.isArray(res)) return res.length;
    if (Array.isArray(res.data)) return res.data.length;
    return 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🚀 Parallel API calls (faster)
        const [buildings, floors, rooms, tenants] = await Promise.all([
          apiRequest({ endpoint: "/buildings", method: "GET", navigate }),
          apiRequest({ endpoint: "/floors", method: "GET", navigate }),
          apiRequest({ endpoint: "/rooms", method: "GET", navigate }),
          apiRequest({ endpoint: "/tenants", method: "GET", navigate }),
        ]);

        setCounts({
          buildings: extractLength(buildings),
          floors: extractLength(floors),
          rooms: extractLength(rooms),
          tenants: extractLength(tenants),
        });
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const data = [
    { title: "Buildings", count: counts.buildings },
    { title: "Floors", count: counts.floors },
    { title: "Rooms", count: counts.rooms },
    { title: "Tenants", count: counts.tenants },
  ];

  const barData = {
    labels: data.map((item) => item.title),
    datasets: [
      {
        label: "Count",
        data: data.map((item) => item.count),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: data.map((item) => item.title),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="dashboard">
      {/* Cards */}
      <div className="cards-container">
        {data.map((item) => (
          <div className="card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.count}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Bar Chart</h3>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>Pie Chart</h3>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: { legend: { position: "bottom" } },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
