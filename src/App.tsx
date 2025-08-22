import React, { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

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
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string>("movie");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: fetchedData, error } = await supabase
        .from("box_office_data")
        .select("*")
        .limit(100000);

      if (!error && fetchedData) {
        setData(fetchedData);
      } else {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSort = (key: keyof MovieData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortKey as keyof MovieData];
    const valB = b[sortKey as keyof MovieData];

    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }

    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const filteredData = sortedData.filter((entry) =>
    Object.values(entry).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const toIndianFormat = (num: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalFinal = filteredData.reduce((sum, item) => sum + item.final_gross, 0);

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

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
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
            {filteredData.map((entry, index) => (
              <tr key={index} className="highlighted-row">
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
      )}
    </div>
  );
}

export default App;
