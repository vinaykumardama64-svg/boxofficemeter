import React, { useEffect, useState } from "react";

type Row = { movie: string; state: string; area: string; gross: number; shows: number; tickets: number };

export default function App() {
  const CSV_URL = (window as any)?.BOXMETER_CSV_URL || "";
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCSV() {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const lines = text.split("\n");
        const parsed = lines.slice(1).map(line => {
          const [movie, state, area, gross, shows, tickets] = line.split(",");
          return {
            movie,
            state,
            area,
            gross: Number(gross),
            shows: Number(shows),
            tickets: Number(tickets),
          };
        });
        setRows(parsed);
      } catch (err) {
        setError("Failed to load data.");
      }
    }
    if (CSV_URL) fetchCSV();
  }, [CSV_URL]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Boxmeter — Live Box Office Tracker</h1>
      {error && <p>{error}</p>}
      <table border={1} cellPadding={8}>
        <thead>
          <tr><th>Movie</th><th>State</th><th>Area</th><th>Gross</th><th>Shows</th><th>Tickets</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.movie}</td>
              <td>{r.state}</td>
              <td>{r.area}</td>
              <td>{r.gross.toLocaleString()}</td>
              <td>{r.shows}</td>
              <td>{r.tickets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
