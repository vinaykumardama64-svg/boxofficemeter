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
  const [movieFilter, setMovieFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof MovieData | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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

  let filteredData = data.filter((entry) => {
    return (
      (!movieFilter || entry.movie === movieFilter) &&
      (!regionFilter || entry.region === regionFilter) &&
      (!areaFilter || entry.area === areaFilter)
    );
  });

  if (sortKey) {
    filteredData = [...filteredData].sort((a, b) =>
      sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    );
  }

  const uniqueMovies = [...new Set(data.map((d) => d.movie))];
  const uniqueRegions = [...new Set(data.map((d) => d.region))];
  const uniqueAreas = [...new Set(data.map((d) => d.area))];

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalGross = filteredData.reduce((sum, item) => sum + item.finalGross, 0);

  const handleSort = (key: keyof MovieData) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      <div className="filters">
        <select value={movieFilter} onChange={(e) => setMovieFilter(e.target.value)}>
          <option value="">All Movies</option>
          {uniqueMovies.map((movie) => (
            <option key={movie} value={movie}>{movie}</option>
          ))}
        </select>

        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">All Regions</option>
          {uniqueRegions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          <option value="">All Areas</option>
          {uniqueAreas.map((area) => (
            <option key={area} value={area}>{area}</option>
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
            <th className="highlight">Movie</th>
            <th>Region</th>
            <th>Area</th>
            <th onClick={() => handleSort("day1")} style={{ cursor: "pointer" }}>Day 1</th>
            <th onClick={() => handleSort("week1")} style={{ cursor: "pointer" }}>Week 1</th>
            <th onClick={() => handleSort("finalGross")} style={{ cursor: "pointer" }}>Final Gross</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry, index) => (
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
