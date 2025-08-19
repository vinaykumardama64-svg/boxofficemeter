import React from "react";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjCp30NwoHJi0X97M_Xsg7aGqKdHkPPHBzcZMsYkNUr2CB2JFap0f4o5SpcdLLebxHFnG278MBoZX7/pub?gid=0&single=true&output=csv";

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
    const fetchCSV = async () => {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const parsed = Papa.parse(text.trim(), { header: true });
        const cleanedData: MovieData[] = parsed.data
          .map((row: any) => {
            if (!row.movie || !row.region || !row.area) return null;
            return {
              movie: row.movie,
              region: row.region,
              area: row.area,
              day1: Number(row["day1"]) || 0,
              week1: Number(row["week1"]) || 0,
              finalGross: Number(row["final gross"]) || 0,
              lastUpdated: row["last updated"] || "N/A",
            };
          })
          .filter(Boolean) as MovieData[];
        setData(cleanedData);
      } catch (error) {
        console.error("Failed to fetch CSV:", error);
      }
    };
    fetchCSV();
  }, []);

  const filteredData = data.filter(entry =>
    Object.values(entry)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalGross = filteredData.reduce((sum, item) => sum + item.finalGross, 0);

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>
      <input
        type="text"
        placeholder="Search by movie, region, area..."
        value={search}
        onChange={e => setSearch(e.target.value)}
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
