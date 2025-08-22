import React, { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface MovieData {
  id: number;
  movie: string;
  region: string;
  area: string;
  day1: number;
  week1: number;
  final_gross: number;
  last_updated: string;
}

function App() {
  const [data, setData] = useState<MovieData[]>([]);
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const toIndianFormat = (num: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);

  const fetchFilters = async () => {
    const [movieData, regionData, areaData] = await Promise.all([
      supabase.from("box_office_data").select("movie"),
      supabase.from("box_office_data").select("region"),
      supabase.from("box_office_data").select("area"),
    ]);

    if (movieData.data) setMovies([...new Set(movieData.data.map((d) => d.movie))]);
    if (regionData.data) setRegions([...new Set(regionData.data.map((d) => d.region))]);
    if (areaData.data) setAreas([...new Set(areaData.data.map((d) => d.area))]);
  };

  const fetchData = async () => {
    let query = supabase.from("box_office_data").select("*").limit(10000);

    if (selectedMovie) query = query.eq("movie", selectedMovie);
    if (selectedRegion) query = query.eq("region", selectedRegion);
    if (selectedArea) query = query.eq("area", selectedArea);

    const { data: fetchedData, error } = await query;
    if (fetchedData) setData(fetchedData);
    if (error) console.error("Could not fetch data:", error);
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedMovie, selectedRegion, selectedArea]);

  const filteredData = data.filter((entry) =>
    Object.values(entry)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalDay1 = filteredData.reduce((sum, d) => sum + (d.day1 || 0), 0);
  const totalWeek1 = filteredData.reduce((sum, d) => sum + (d.week1 || 0), 0);
  const totalFinal = filteredData.reduce((sum, d) => sum + (d.final_gross || 0), 0);

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      <input
        type="text"
        placeholder="Search movie / region / area..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="filters">
        <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)}>
          <option value="">Movie (exact)</option>
          {movies.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
          <option value="">Region (exact)</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
          <option value="">Area (exact)</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
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
          <h3>Entries (loaded)</h3>
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
          {filteredData.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.movie}</td>
              <td>{entry.region}</td>
              <td>{entry.area}</td>
              <td>₹{toIndianFormat(entry.day1)}</td>
              <td>₹{toIndianFormat(entry.week1)}</td>
              <td>₹{toIndianFormat(entry.final_gross)}</td>
              <td>{entry.last_updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
