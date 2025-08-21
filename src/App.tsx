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

  const indianFormat = (num: number) =>
    new Intl.NumberFormat("en-IN").format(num);

  const filteredData = data.filter((entry) => {
    return (
      (!movieFilter || entry.movie === movieFilter) &&
      (!regionFilter || entry.region === regionFilter) &&
      (!areaFilter || entry.area === areaFilter) &&
      Object.values(entry).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  });

  const uniqueMovies = Array.from(new Set(data.map((item) => item.movie)));
  const uniqueRegions = Array.from(new Set(data.map((item) => item.region)));
  const uniqueAreas = Array.from(new Set(data.map((item) => item.area)));

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalGross = filteredData.reduce((sum, item) => sum + item.finalGross, 0);

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      <div className="filters">
        <select onChange={(e) => setMovieFilter(e.target.value)} value={movieFilter}>
          <option value="">All Movies</option>
          {uniqueMovies.map((movie, index) => (
            <option key={index} value={movie}>
              {movie}
            </option>
          ))}
        </select>
        <select onChange={(e) => setRegionFilter(e.target.value)} value={regionFilter}>
          <option value="">All Regions</option>
          {uniqueRegions.map((region, index) => (
            <option key={index} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select onChange={(e) => setAreaFilter(e.target.value)} value={areaFilter}>
          <option value="">All Areas</option>
          {uniqueAreas.map((area, index) => (
            <option key={index} value={area}>
              {area}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="totals">
        <div className="total-box">
          <h4>Total Day 1</h4>
          <p>₹{indianFormat(totalDay1)}</p>
        </div>
        <div className="total-box">
          <h4>Total Week 1</h4>
          <p>₹{indianFormat(totalWeek1)}</p>
        </div>
        <div className="total-box">
          <h4>Total Final Gross</h4>
          <p>₹{indianFormat(totalGross)}</p>
        </div>
      </div>

      <table className="data-table">
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
              <td>₹{indianFormat(entry.day1)}</td>
              <td>₹{indianFormat(entry.week1)}</td>
              <td>₹{indianFormat(entry.finalGross)}</td>
              <td>{entry.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
