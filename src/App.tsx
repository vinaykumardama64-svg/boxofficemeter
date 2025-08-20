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
  const [search, setSearch] = useState({ movie: "", region: "", area: "" });
  const [sortColumn, setSortColumn] = useState<keyof MovieData | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

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
          finalGross: Number(row["final gross"]) || 0,
          lastUpdated: row["last updated"] || "N/A",
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
      (search.movie === "" || entry.movie === search.movie) &&
      (search.region === "" || entry.region === search.region) &&
      (search.area === "" || entry.area === search.area)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    return sortAsc
      ? a[sortColumn] > b[sortColumn]
        ? 1
        : -1
      : a[sortColumn] < b[sortColumn]
      ? 1
      : -1;
  });

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalFinalGross = filteredData.reduce(
    (sum, item) => sum + item.finalGross,
    0
  );

  const getUnique = (key: keyof MovieData) => [
    ...new Set(data.map((item) => item[key])),
  ];

  const handleSort = (column: keyof MovieData) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      <div className="filters">
        <select
          value={search.movie}
          onChange={(e) => setSearch({ ...search, movie: e.target.value })}
        >
          <option value="">All Movies</option>
          {getUnique("movie").map((movie) => (
            <option key={movie} value={movie}>
              {movie}
            </option>
          ))}
        </select>
        <select
          value={search.region}
          onChange={(e) => setSearch({ ...search, region: e.target.value })}
        >
          <option value="">All Regions</option>
          {getUnique("region").map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          value={search.area}
          onChange={(e) => setSearch({ ...search, area: e.target.value })}
        >
          <option value="">All Areas</option>
          {getUnique("area").map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="kpis">
        <div className="kpi-card">
          <h3>Total Day 1</h3>
          <p>₹{totalDay1.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Week 1</h3>
          <p>₹{totalWeek1.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Final Gross</h3>
          <p>₹{totalFinalGross.toLocaleString()}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th className="highlight">Movie</th>
            <th>Region</th>
            <th>Area</th>
            <th onClick={() => handleSort("day1")} style={{ cursor: "pointer" }}>
              Day 1 {sortColumn === "day1" && (sortAsc ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("week1")} style={{ cursor: "pointer" }}>
              Week 1 {sortColumn === "week1" && (sortAsc ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("finalGross")} style={{ cursor: "pointer" }}>
              Final Gross {sortColumn === "finalGross" && (sortAsc ? "↑" : "↓")}
            </th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((entry, index) => (
            <tr key={index}>
              <td className="highlight">{entry.movie}</td>
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
