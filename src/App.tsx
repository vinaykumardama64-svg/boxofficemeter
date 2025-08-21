import React, { useEffect, useState } from "react";
import "./App.css";

interface MovieData {
  movie: string;
  region: string;
  area: string;
  day1: number;
  week1: number;
  finalGross: number;
  lastUpdated: string;
}

const SUPABASE_URL =
  "https://iywdsnvicsgwdwuoqvbz.supabase.co/rest/v1/box_office_data?select=*";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d2RzbnZpY3Nnd2R3dW9xdmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDI0NDgsImV4cCI6MjA3MTM3ODQ0OH0.Epn3h-VXcTBKPXKo8Y_xW3gTzBH6HY15VdksWyPjg3M";

function App() {
  const [data, setData] = useState<MovieData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(SUPABASE_URL, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });

        const json = await res.json();

        const cleanedData: MovieData[] = json.map((row: any) => ({
          movie: row.movie,
          region: row.region,
          area: row.area,
          day1: Number(row.day1) || 0,
          week1: Number(row.week1) || 0,
          finalGross: Number(row.final_gross) || 0,
          lastUpdated: row.last_updated || "N/A",
        }));

        setData(cleanedData);
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      }
    };

    fetchData();
  }, []);

  const toIndianFormat = (num: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);

  const totalDay1 = data.reduce((sum, item) => sum + item.day1, 0);
  const totalWeek1 = data.reduce((sum, item) => sum + item.week1, 0);
  const totalFinal = data.reduce((sum, item) => sum + item.finalGross, 0);

  return (
    <div className="App">
      <h1>🎬 BoxOfficeTrack</h1>

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
          <p>{data.length}</p>
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
          {data.map((entry, index) => (
            <tr key={index}>
              <td>{entry.movie}</td>
              <td>{entry.region}</td>
              <td>{entry.area}</td>
              <td>₹{toIndianFormat(entry.day1)}</td>
              <td>₹{toIndianFormat(entry.week1)}</td>
              <td>₹{toIndianFormat(entry.finalGross)}</td>
              <td>{entry.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
