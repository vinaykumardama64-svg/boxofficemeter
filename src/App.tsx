import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("final_gross");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: fetchedData, error } = await supabase
        .from("box_office_data")
        .select("*")
        .order(sortField, { ascending: sortOrder === "asc" })
        .limit(200000);

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(fetchedData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [sortField, sortOrder]);

  const filteredData = data.filter((entry) =>
    Object.values(entry).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const toIndianFormat = (num: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);

  const totalDay1 = filteredData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = filteredData.reduce((sum, item) => sum + item.week1, 0);
  const totalFinal = filteredData.reduce((sum, item) => sum + item.final_gross, 0);

  const handleSort = (field: keyof MovieData) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

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
            {filteredData.map((entry) => (
              <tr key={entry.id} className="highlight-row">
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
