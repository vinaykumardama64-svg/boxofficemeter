
import React, { useEffect, useState } from "react";

type Row = {
  movie: string;
  state: string;
  area: string;
  gross: number;
  day1_gross: number;
  week1_total: number;
  closing_gross: number;
};

export default function App() {
  const CSV_URL = (window as any)?.BOXMETER_CSV_URL || "";
  const [rows, setRows] = useState<Row[]>([]);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [sortField, setSortField] = useState<keyof Row>("gross");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function fetchCSV() {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const lines = text.trim().split("\n");
        const data = lines
          .slice(1)
          .map(line => {
            const parts = line.split(",").map(v => v.trim());
            if (parts.length < 7) return null;
            const [movie, state, area, gross, day1, week1, closing] = parts;
            return {
              movie,
              state,
              area,
              gross: Number(gross) || 0,
              day1_gross: Number(day1) || 0,
              week1_total: Number(week1) || 0,
              closing_gross: Number(closing) || 0,
            };
          })
          .filter(Boolean); // remove nulls
        setRows(data as Row[]);
      } catch (err) {
        setError("Failed to load data.");
      }
    }
    if (CSV_URL) fetchCSV();
  }, [CSV_URL]);

  useEffect(() => {
    let data = [...rows];
    if (selectedMovie !== "All") data = data.filter(r => r.movie === selectedMovie);
    if (selectedState !== "All") data = data.filter(r => r.state === selectedState);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(r =>
        r.movie.toLowerCase().includes(s) ||
        r.state.toLowerCase().includes(s) ||
        r.area.toLowerCase().includes(s)
      );
    }

    data.sort((a, b) => {
      if (sortAsc) return a[sortField] - b[sortField];
      else return b[sortField] - a[sortField];
    });

    setFilteredRows(data);
  }, [rows, selectedMovie, selectedState, sortField, sortAsc, search]);

  const movies = Array.from(new Set(rows.map(r => r.movie)));
  const states = Array.from(new Set(rows.map(r => r.state)));

  const totalGross = filteredRows.reduce((sum, r) => sum + r.gross, 0);
  const totalDay1 = filteredRows.reduce((sum, r) => sum + r.day1_gross, 0);
  const totalWeek1 = filteredRows.reduce((sum, r) => sum + r.week1_total, 0);
  const totalClosing = filteredRows.reduce((sum, r) => sum + r.closing_gross, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Boxmeter — Box Office Tracker (Robust)</h1>

      {error && <p>{error}</p>}

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search movie, state, area"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 6, width: 250, marginRight: 16 }}
        />

        <label>Filter by Movie: </label>
        <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)}>
          <option value="All">All</option>
          {movies.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label style={{ marginLeft: 16 }}>Filter by State: </label>
        <select value={selectedState} onChange={e => setSelectedState(e.target.value)}>
          <option value="All">All</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={{ marginLeft: 16 }}>Sort by: </label>
        <select value={sortField} onChange={e => setSortField(e.target.value as keyof Row)}>
          <option value="gross">Gross</option>
          <option value="day1_gross">Day 1 Gross</option>
          <option value="week1_total">Week 1 Total</option>
          <option value="closing_gross">Closing Gross</option>
        </select>

        <button onClick={() => setSortAsc(prev => !prev)} style={{ marginLeft: 8 }}>
          {sortAsc ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      <div style={{ marginBottom: 12, fontWeight: "bold" }}>
        🎯 Total Gross: ₹{totalGross.toLocaleString()} | Day 1: ₹{totalDay1.toLocaleString()} | Week 1: ₹{totalWeek1.toLocaleString()} | Closing: ₹{totalClosing.toLocaleString()}
      </div>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Movie</th><th>State</th><th>Area</th>
            <th>Gross</th><th>Day 1</th><th>Week 1</th><th>Closing</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((r, i) => (
            <tr key={i}>
              <td>{r.movie}</td>
              <td>{r.state}</td>
              <td>{r.area}</td>
              <td>{r.gross.toLocaleString()}</td>
              <td>{r.day1_gross.toLocaleString()}</td>
              <td>{r.week1_total.toLocaleString()}</td>
              <td>{r.closing_gross.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
