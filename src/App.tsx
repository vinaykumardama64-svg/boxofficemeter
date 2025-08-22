import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

type Row = {
  id: number;
  movie: string;
  region: string;
  area: string;
  day1: number | null;
  week1: number | null;
  final_gross?: number | null;
  ["final gross"]?: number | null;     // support legacy column
  last_updated?: string | null;
  ["last updated"]?: string | null;    // support legacy column
};

type MovieData = {
  id: number;
  movie: string;
  region: string;
  area: string;
  day1: number;
  week1: number;
  finalGross: number;
  lastUpdated: string;
};

const PAGE_SIZE = 500;
const TABLE = "box_office_data";

const toINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function App() {
  const [rows, setRows] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // simple server-side search string
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);

  // server-side filters (optional to fill later)
  const [movieFilter, setMovieFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("");

  const mapRow = (r: Row): MovieData => ({
    id: r.id,
    movie: r.movie ?? "",
    region: r.region ?? "",
    area: r.area ?? "",
    day1: Number(r.day1 || 0),
    week1: Number(r.week1 || 0),
    finalGross: Number((r.final_gross ?? r["final gross"]) || 0),
    lastUpdated: (r.last_updated ?? r["last updated"] ?? "N/A") as string,
  });

  const fetchPage = useCallback(
    async (nextPage: number, replace = false) => {
      try {
        setLoading(true);
        setErr(null);

        let query = supabase
          .from(TABLE)
          .select("id,movie,region,area,day1,week1,final_gross,last_updated", {
            count: "exact",
          });

        // server-side search across a few text cols (fast with indexes)
        if (debouncedSearch) {
          const q = `%${debouncedSearch}%`;
          // OR over columns
          query = query.or(
            `movie.ilike.${q},region.ilike.${q},area.ilike.${q}`
          );
        }

        // optional single-value filters (expand later to multi-select)
        if (movieFilter) query = query.eq("movie", movieFilter);
        if (regionFilter) query = query.eq("region", regionFilter);
        if (areaFilter) query = query.eq("area", areaFilter);

        // default sort by id descending (fast with PK)
        query = query.order("id", { ascending: false });

        const from = nextPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error, count } = await query.range(from, to);
        if (error) throw error;

        const mapped = (data ?? []).map(mapRow);

        setRows(prev => (replace ? mapped : [...prev, ...mapped]));
        setHasMore((data?.length ?? 0) === PAGE_SIZE); // if less than page size, no more
      } catch (e: any) {
        console.error(e);
        setErr(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, movieFilter, regionFilter, areaFilter]
  );

  // initial + whenever query changes -> reset and fetch page 0
  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
  }, [debouncedSearch, movieFilter, regionFilter, areaFilter, fetchPage]);

  const totals = useMemo(
    () => ({
      // totals of the **currently loaded page(s)**
      day1: rows.reduce((s, r) => s + r.day1, 0),
      week1: rows.reduce((s, r) => s + r.week1, 0),
      final: rows.reduce((s, r) => s + r.finalGross, 0),
      count: rows.length,
    }),
    [rows]
  );

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

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

      {/* Search (debounced) */}
      <input
        className="search-input"
        type="text"
        placeholder="Search movie / region / area…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Quick single-value filters (optional to use) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <input
          className="filter-chip"
          placeholder="Movie (exact)"
          value={movieFilter}
          onChange={(e) => setMovieFilter(e.target.value)}
        />
        <input
          className="filter-chip"
          placeholder="Region (exact)"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        />
        <input
          className="filter-chip"
          placeholder="Area (exact)"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
        />
      </div>

      {/* KPIs for loaded rows */}
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
          <h3>Entries (loaded)</h3>
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
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.movie}</td>
                <td>{r.region}</td>
                <td>{r.area}</td>
                <td>₹{toINR(r.day1)}</td>
                <td>₹{toINR(r.week1)}</td>
                <td>₹{toINR(r.finalGross)}</td>
                <td>{r.lastUpdated}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                  No rows found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      <div style={{ display: "flex", justifyContent: "center", margin: 16 }}>
        <button
          className="primary-btn"
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchPage(next);
          }}
          disabled={loading || !hasMore}
        >
          {hasMore ? (loading ? "Loading…" : "Load more") : "No more rows"}
        </button>
      </div>
    </div>
  );
}
