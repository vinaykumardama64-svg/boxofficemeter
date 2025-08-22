import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

/**
 * Create a mobile-safe Supabase client.
 * (No localStorage -> avoids Safari/Android private-mode issues)
 */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Change this if your table name is different
const TABLE_NAME = "box_office_data";

type MovieData = {
  movie: string;
  region: string;
  area: string;
  day1: number;
  week1: number;
  finalGross: number;
  lastUpdated: string;
};

const toINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export default function App() {
  const [rows, setRows] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select("*")
          .order("id", { ascending: true }) // needs a primary key/unique id
          .range(0, 199_999);               // you increased API cap to 200k

        if (error) throw error;

        const cleaned: MovieData[] = (data ?? []).map((r: any) => ({
          movie: r.movie ?? "",
          region: r.region ?? "",
          area: r.area ?? "",
          day1: Number(r.day1) || 0,
          week1: Number(r.week1) || 0,
          // support snake_case or legacy spaced column
          finalGross: Number(r.final_gross ?? r["final gross"]) || 0,
          lastUpdated: r.last_updated ?? r["last updated"] ?? "N/A",
        }));

        setRows(cleaned);
      } catch (e: any) {
        console.error("Supabase fetch failed:", e);
        setErr(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.movie, r.region, r.area, r.lastUpdated]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const totals = useMemo(
    () => ({
      day1: filtered.reduce((s, r) => s + r.day1, 0),
      week1: filtered.reduce((s, r) => s + r.week1, 0),
      final: filtered.reduce((s, r) => s + r.finalGross, 0),
      count: filtered.length,
    }),
    [filtered]
  );

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

      {/* Error banner */}
      {err && (
        <div
          style={{
            background: "#ffe8e8",
            border: "1px solid #ffb3b3",
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <strong>Couldn’t load data:</strong> {err}
        </div>
      )}

      {/* Search */}
      <input
        className="search-input"
        type="text"
        placeholder="Search by movie, region, area..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* KPIs */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Total Day 1</h3>
          <p>₹{toINR(totals.day1)}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Week 1</h3>
          <p>₹{toINR(totals.week1)}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Final Gross</h3>
          <p>₹{toINR(totals.final)}</p>
        </div>
        <div className="kpi-card">
          <h3>Entries</h3>
          <p>{toINR(totals.count)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="boxoffice-table">
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
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                  No rows match your search.
                </td>
              </tr>
            )}
            {filtered.map((r, i) => (
              <tr key={i}>
                <td>{r.movie}</td>
                <td>{r.region}</td>
                <td>{r.area}</td>
                <td>₹{toINR(r.day1)}</td>
                <td>₹{toINR(r.week1)}</td>
                <td>₹{toINR(r.finalGross)}</td>
                <td>{r.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
    </div>
  );
}
