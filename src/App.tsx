import React, { useEffect, useState } from "react";
import Papa from "papaparse";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjCp30NwoHJi0X97M_Xsg7aGqKdHkPPHBzcZMsYkNUr2CB2JFap0f4o5SpcdLLebxHFnG278MBoZX7/pub?gid=0&single=true&output=csv";

interface Row {
  Movie: string;
  Region: string;
  Area: string;
  "Day 1": string;
  "Week 1": string;
  "Final Gross": string;
  "Last Updated": string;
}

export default function App() {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse<Row>(text, {
          header: true,
          skipEmptyLines: true,
          transform: (val) => val.trim().replace(/^"|"$/g, ""),
        });
        setData(parsed.data);
      });
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Box Office Tracker</h1>
      <table className="w-full border-collapse border border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-400 px-2 py-1">Movie</th>
            <th className="border border-gray-400 px-2 py-1">Region</th>
            <th className="border border-gray-400 px-2 py-1">Area</th>
            <th className="border border-gray-400 px-2 py-1">Day 1</th>
            <th className="border border-gray-400 px-2 py-1">Week 1</th>
            <th className="border border-gray-400 px-2 py-1">Final Gross</th>
            <th className="border border-gray-400 px-2 py-1">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="border border-gray-400 px-2 py-1">{row.Movie}</td>
              <td className="border border-gray-400 px-2 py-1">{row.Region}</td>
              <td className="border border-gray-400 px-2 py-1">{row.Area}</td>
              <td className="border border-gray-400 px-2 py-1">{row["Day 1"]}</td>
              <td className="border border-gray-400 px-2 py-1">{row["Week 1"]}</td>
              <td className="border border-gray-400 px-2 py-1">{row["Final Gross"]}</td>
              <td className="border border-gray-400 px-2 py-1">{row["Last Updated"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
