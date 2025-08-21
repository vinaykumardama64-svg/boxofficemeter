import React, { useEffect, useState } from "react";
import "./App.css";

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
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const filteredData = data.filter((entry) =>
    Object.values(entry).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortKey as keyof MovieData] as number;
        const bValue = b[sortKey as keyof MovieData] as number;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      })
    : filteredData;

  const totalDay1 = sortedData.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = sortedData.reduce((sum, item) => sum + item.week1, 0);
  const totalGross = sortedData.reduce((sum, item) => sum + item.finalGross, 0);

  const formatIndianNumber = (num: number): string => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleSort = (key: keyof MovieData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
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
        className="search-bar"
      />

      <div className="totals-row">
        <div className="total-box">
          <h3>Total Day 1</h3>
          <p>₹{formatIndianNumber(totalDay1)}</p>
        </div>
        <div className="total-box">
          <h3>Total Week 1</h3>
          <p>₹{formatIndianNumber(totalWeek1)}</p>
        </div>
        <div className="total-box">
          <h3>Total Final Gross</h3>
          <p>₹{formatIndianNumber(totalGross)}</p>
        </div>
        <div className="total-box">
          <h3>Total Entries</h3>
          <p>{sortedData.length}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Movie</th>
            <th>Region</th>
            <th>Area</th>
            <th onClick={() => handleSort("day1")}>Day 1 ⬍</th>
            <th onClick={() => handleSort("week1")}>Week 1 ⬍</th>
            <th onClick={() => handleSort("finalGross")}>Final Gross ⬍</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.movie}</td>
              <td>{entry.region}</td>
              <td>{entry.area}</td>
              <td>₹{formatIndianNumber(entry.day1)}</td>
              <td>₹{formatIndianNumber(entry.week1)}</td>
              <td>₹{formatIndianNumber(entry.finalGross)}</td>
              <td>{entry.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
