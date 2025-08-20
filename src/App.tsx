import React, { useEffect, useState } from "react";
import "./App.css";

const JSON_URL =
  "https://opensheet.elk.sh/1Xf3oggoei5OZIBQm76gIxDi8gQDwhwz-43dG7CfGCxQ/Sheet1"; // your updated sheet link

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(JSON_URL);
        const json = await res.json();

        const cleanedData: MovieData[] = json.map((row: any) => ({
          movie: row.movie,
          region: row.region,
          area: row.area,
          day1: Number(row.day1) || 0,
          week1: Number(row.week1) || 0,
          finalGross: Number(row.finalGross) || 0,
          lastUpdated: row.lastUpdated || "N/A",
        }));

        setData(cleanedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter((entry) =>
    Object.values(entry).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const totalGross = filteredData.reduce(
    (sum, item) => sum + item.finalGross,
    0
  );

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>
      <input
        type="text"
        placeholder="Search by movie, region, area..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px", padding: "6px", fontSize: "16px", width: "60%" }}
      />

      <div className="kpis">
        <div className="kpi-card">
          <h3>Total Final Gross</h3>
          <p>₹{totalGross.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <h3>Entries</h3>
          <p>{filteredData.length}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Movie</th>
            <th>Region</th>
            <th>Area</th>
            <th>Day 1</th>
            <th>Week 1</th>
            <th>Final Gross</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.movie}</td>
              <td>{entry.region}</td>
              <td>{entry.area}</td>
              <td>₹{entry.day1.toLocaleString()}</td>
              <td>₹{entry.week1.toLocaleString()}</td>
              <td>₹{entry.finalGross.toLocaleString()}</td>
              <td>{entry.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
