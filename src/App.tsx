import React, { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import Select from "react-select";

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
  const [selectedMovie, setSelectedMovie] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof MovieData | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: rows } = await supabase.from("movie_data").select("*");
    if (rows) {
      setData(rows);
      setMovies([...new Set(rows.map((r) => r.movie))].sort());
      setRegions([...new Set(rows.map((r) => r.region))].sort());
      setAreas([...new Set(rows.map((r) => r.area))].sort());
    }
  }

  const filteredData = data.filter(
    (entry) =>
      (selectedMovie.length === 0 || selectedMovie.includes(entry.movie)) &&
      (selectedRegion.length === 0 || selectedRegion.includes(entry.region)) &&
      (selectedArea.length === 0 || selectedArea.includes(entry.area))
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (key: keyof MovieData) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const toIndianFormat = (num: number) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const movieComparison = [...filteredData]
    .reduce((acc: Record<string, any>, curr) => {
      if (!acc[curr.movie]) acc[curr.movie] = { movie: curr.movie, day1: 0, week1: 0, final: 0 };
      acc[curr.movie].day1 += curr.day1;
      acc[curr.movie].week1 += curr.week1;
      acc[curr.movie].final += curr.final_gross;
      return acc;
    }, {})

  const top10Movies = Object.values(movieComparison)
    .sort((a: any, b: any) => b.final - a.final)
    .slice(0, 10);

  return (
    <div className="App">
      <h1>BoxOfficeTrack</h1>
      <div className="filters">
        <Select
          options={movies.map((m) => ({ label: m, value: m }))}
          isMulti
          onChange={(opts) => setSelectedMovie(opts.map((o) => o.value))}
          placeholder="Filter by Movie"
        />
        <Select
          options={regions.map((m) => ({ label: m, value: m }))}
          isMulti
          onChange={(opts) => setSelectedRegion(opts.map((o) => o.value))}
          placeholder="Filter by Region"
        />
        <Select
          options={areas.map((m) => ({ label: m, value: m }))}
          isMulti
          onChange={(opts) => setSelectedArea(opts.map((o) => o.value))}
          placeholder="Filter by Area"
        />
      </div>

      <p>{sortedData.length} Records</p>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("movie")}>Movie</th>
            <th onClick={() => handleSort("region")}>Region</th>
            <th onClick={() => handleSort("area")}>Area</th>
            <th onClick={() => handleSort("day1")}>Day 1</th>
            <th onClick={() => handleSort("week1")}>Week 1</th>
            <th onClick={() => handleSort("final_gross")}>Final Gross</th>
            <th onClick={() => handleSort("last_updated")}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((entry) => (
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

      {sortedData.length > itemsPerPage && (
        <div className="pagination">
          <button onClick={() => setPage(Math.max(page - 1, 1))}>Prev</button>
          <button
            onClick={() =>
              setPage((p) => (p * itemsPerPage < sortedData.length ? p + 1 : p))
            }
          >
            Next
          </button>
        </div>
      )}

      <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Top 10 Movies Comparison</h2>
      <div style={{ width: "100%", height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top10Movies}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="movie" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="day1" fill="#ffc107" name="Day 1">
              <LabelList dataKey="day1" position="right" formatter={toIndianFormat} />
            </Bar>
            <Bar dataKey="week1" fill="#0d6efd" name="Week 1">
              <LabelList dataKey="week1" position="right" formatter={toIndianFormat} />
            </Bar>
            <Bar dataKey="final" fill="#198754" name="Final Gross">
              <LabelList dataKey="final" position="right" formatter={toIndianFormat} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
