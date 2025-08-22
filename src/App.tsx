// App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iywdsnvicsgwdwuoqvbz.supabase.co";
const supabaseKey = "YOUR_ANON_KEY_HERE"; // or env vars
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,        // <- critical for mobile/private mode
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

interface MovieData {
  movie: string;
  region: string;
  area: string;
  day1: number;
  week1: number;
  finalGross: number;
  lastUpdated: string;
}

const toINR = (n: number) =>
  (Intl && Intl.NumberFormat
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)
    : Math.round(n).toLocaleString());

export default function App() {
  const [data, setData] = useState<MovieData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("box_office_data")
          .select("*")
          .order("id", { ascending: true }) // stable ordering helps with large ranges
          .range(0, 200000);                 // you raised API limit to 200000

        if (error) throw error;

        const cleaned = (rows || []).map((r: any) => ({
          movie: r.movie,
          region: r.region,
          area: r.area,
          day1: Number(r.day1) || 0,
          week1: Number(r.week1) || 0,
          finalGross: Number(r.final_gross ?? r["final gross"]) || 0,
          lastUpdated: r.last_updated ?? r["last updated"] ?? "N/A",
        }));

        setData(cleaned);
        setError(null);
      } catch (e: any) {
        console.error("Supabase fetch failed:", e);
        setError(e?.message || "Failed to load data");
      }
    })();
  }, []);

  const totalDay1 = data.reduce((s, d) => s + d.day1, 0);
  const totalWeek1 = data.reduce((s, d) => s + d.week1, 0);
  const totalFinal = data.reduce((s, d) => s + d.finalGross, 0);

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      {error && (
        <div style={{background:"#ffe8e8",border:"1px solid #ffb3b3",padding:"10px",borderRadius:8,marginBottom:12}}>
          <strong>Couldn’t load data.</strong> {error}
        </div>
      )}

      <div className="kpi-container">
        <div className="kpi-card"><h3>Total Day 1</h3><p>₹{toINR(totalDay1)}</p></div>
        <div className="kpi-card"><h3>Total Week 1</h3><p>₹{toINR(totalWeek1)}</p></div>
        <div className="kpi-card"><h3>Total Final Gross</h3><p>₹{toINR(totalFinal)}</p></div>
        <div className="kpi-card"><h3>Entries</h3><p>{data.length}</p></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Movie</th><th>Region</th><th>Area</th>
            <th>Day 1</th><th>Week 1</th><th>Final Gross</th><th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.movie}</td>
              <td>{d.region}</td>
              <td>{d.area}</td>
              <td>₹{toINR(d.day1)}</td>
              <td>₹{toINR(d.week1)}</td>
              <td>₹{toINR(d.finalGross)}</td>
              <td>{d.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
