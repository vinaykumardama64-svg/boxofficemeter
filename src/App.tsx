import React, { useEffect, useState } from "react";
import "./App.css";
import MultiSelectDropdown from "./components/MultiSelectDropdown";

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
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof MovieData>('finalGross');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const toggleSort = (column: keyof MovieData) => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const filteredData = data.filter((entry) => {
    const matchMovie = selectedMovies.length === 0 || selectedMovies.includes(entry.movie);
    const matchRegion = selectedRegions.length === 0 || selectedRegions.includes(entry.region);
    const matchArea = selectedAreas.length === 0 || selectedAreas.includes(entry.area);

    return (
      matchMovie &&
      matchRegion &&
      matchArea &&
      Object.values(entry).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const uniqueMovies = Array.from(new Set(data.map((d) => d.movie)));
  const uniqueRegions = Array.from(new Set(data.map((d) => d.region)));
  const uniqueAreas = Array.from(new Set(data.map((d) => d.area)));

  const toIndianFormat = (num: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalFinal = filteredData.reduce((sum, item) => sum + item.finalGross, 0);

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      <input
        type="text"
        placeholder="Search by movie, region, area..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="filters">
        <MultiSelectDropdown
          label="Movies"
          options={uniqueMovies}
          selected={selectedMovies}
          onChange={setSelectedMovies}
        />
        <MultiSelectDropdown
          label="Regions"
          options={uniqueRegions}
          selected={selectedRegions}
          onChange={setSelectedRegions}
        />
        <MultiSelectDropdown
          label="Areas"
          options={uniqueAreas}
          selected={selectedAreas}
          onChange={setSelectedAreas}
        />
      </div>

      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Total Day 1</h3>
          <p>₹{toIndianFormat(totalDay1)}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Week 1</h3>
          <p>₹{toIndianFormat(totalWeek1)}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Final Gross</h3>
          <p>₹{toIndianFormat(totalFinal)}</p>
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
            <th onClick={() => toggleSort('day1')}>Day 1</th>
            <th onClick={() => toggleSort('week1')}>Week 1</th>
            <th onClick={() => toggleSort('finalGross')}>Final Gross</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.movie}</td>
              <td>{entry.region}</td>
              <td>{entry.area}</td>
              <td>₹{toIndianFormat(entry.day1)}</td>
              <td>₹{toIndianFormat(entry.week1)}</td>
              <td>₹{toIndianFormat(entry.finalGross)}</td>
              <td>{entry.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
