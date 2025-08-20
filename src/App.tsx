import React, { useEffect, useState } from "react";
import "./App.css";
import "./AppEnhanced.css";

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
  const [movieFilter, setMovieFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

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

  const filteredData = data.filter(
    (entry) =>
      (!movieFilter || entry.movie === movieFilter) &&
      (!regionFilter || entry.region === regionFilter) &&
      (!areaFilter || entry.area === areaFilter)
  );

  const movies = Array.from(new Set(data.map((d) => d.movie)));
  const regions = Array.from(new Set(data.map((d) => d.region)));
  const areas = Array.from(new Set(data.map((d) => d.area)));

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalFinalGross = filteredData.reduce((sum, item) => sum + item.finalGross, 0);

  return (
    <div className="App fade-in">
      <h1>🎬 BoxOfficeTrack</h1>

      <div className="filters">
        <select onChange={(e) => setMovieFilter(e.target.value)} value={movieFilter}>
          <option value="">All Movies</option>
          {movies.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select onChange={(e) => setRegionFilter(e.target.value)} value={regionFilter}>
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select onChange={(e) => setAreaFilter(e.target.value)} value={areaFilter}>
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="totals-box">
        <div>Total Day 1: ₹{totalDay1.toLocaleString()}</div>
        <div>Total Week 1: ₹{totalWeek1.toLocaleString()}</div>
        <div>Total Final Gross: ₹{totalFinalGross.toLocaleString()}</div>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th className="highlight">Movie</th>
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
