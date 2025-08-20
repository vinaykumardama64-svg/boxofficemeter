import React, { useEffect, useState } from "react";
import "./App.css";

const JSON_URL =
  "https://opensheet.elk.sh/1Xf3oggoei5OZIBQm76gIxDi8gQDwhwz-43dG7CfGCxQ/Sheet1";

interface MovieData {
  movie: string;
  region: string;
  area: string;
  day1: number;
  week1: number;
  finalGross: number;
  lastUpdated: string;
}

function App() {
  const [data, setData] = useState<MovieData[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ movie: "", region: "", area: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(JSON_URL);
        const json = await res.json();

        const cleanedData: MovieData[] = json.map((row: any) => ({
          movie: row.movie,
          region: row.region,
          area: row.area,
          day1: Number(row["day1"]) || 0,
          week1: Number(row["week1"]) || 0,
          finalGross: Number(row["finalGross"]) || 0,
          lastUpdated: row["lastUpdated"] || "N/A",
        }));

        setData(cleanedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter((entry) => {
    return (
      entry.movie.toLowerCase().includes(filters.movie.toLowerCase()) &&
      entry.region.toLowerCase().includes(filters.region.toLowerCase()) &&
      entry.area.toLowerCase().includes(filters.area.toLowerCase())
    );
  });

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalFinalGross = filteredData.reduce(
    (sum, item) => sum + item.finalGross,
    0
  );

  return (
    <div className="App" style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>🎬 BoxOfficeTrack</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="Filter by movie"
          value={filters.movie}
          onChange={(e) => setFilters({ ...filters, movie: e.target.value })}
          style={{ padding: "8px", fontSize: "14px" }}
        />
        <input
          type="text"
          placeholder="Filter by region"
          value={filters.region}
          onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          style={{ padding: "8px", fontSize: "14px" }}
        />
        <input
          type="text"
          placeholder="Filter by area"
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          style={{ padding: "8px", fontSize: "14px" }}
        />
      </div>

      <div className="kpis" style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "20px" }}>
        <div className="kpi-card" style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px 20px", backgroundColor: "#f9f9f9" }}>
          <h3>Total Day 1</h3>
          <p>₹{totalDay1.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px 20px", backgroundColor: "#f9f9f9" }}>
          <h3>Total Week 1</h3>
          <p>₹{totalWeek1.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px 20px", backgroundColor: "#f9f9f9" }}>
          <h3>Total Final Gross</h3>
          <p>₹{totalFinalGross.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px 20px", backgroundColor: "#f9f9f9" }}>
          <h3>Entries</h3>
          <p>{filteredData.length}</p>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Movie</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Region</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Area</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Day 1</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Week 1</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Final Gross</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.movie}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.region}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.area}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>₹{entry.day1.toLocaleString()}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>₹{entry.week1.toLocaleString()}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>₹{entry.finalGross.toLocaleString()}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{entry.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
