
import { useEffect, useState } from "react";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjCp30NwoHJi0X97M_Xsg7aGqKdHkPPHBzcZMsYkNUr2CB2JFap0f4o5SpcdLLebxHFnG278MBoZX7/pub?gid=0&single=true&output=csv";

export default function App() {
  const [data, setData] = useState<string[][]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCSV = async () => {
      const res = await fetch(CSV_URL);
      const text = await res.text();
      const lines = text.split("\n");
      const parsed = lines.slice(1).map(line => {
        const parts = line.split(",");
        return parts.length === 7 ? parts : null;
      }).filter(Boolean) as string[][];
      setData(parsed);
    };

    fetchCSV();
  }, []);

  const filteredData = data.filter(row =>
    row[0].toLowerCase().includes(search.toLowerCase()) ||
    row[1].toLowerCase().includes(search.toLowerCase()) ||
    row[2].toLowerCase().includes(search.toLowerCase())
  );

  const formatNum = (val: string) => {
    const num = parseInt(val);
    return isNaN(num) ? val : num.toLocaleString("en-IN");
  };

  const totalFinalGross = filteredData.reduce((sum, row) => {
    const val = parseInt(row[5]);
    return isNaN(val) ? sum : sum + val;
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>🎬 Box Office Tracker</h1>
      <input
        type="text"
        placeholder="Search by Movie / Region / Area"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 10, padding: 5, width: "60%" }}
      />
      <h3>Total Final Gross: ₹ {totalFinalGross.toLocaleString("en-IN")}</h3>
      <table border={1} cellPadding={6} cellSpacing={0}>
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
          {filteredData.map((row, idx) => (
            <tr key={idx}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{formatNum(row[3])}</td>
              <td>{formatNum(row[4])}</td>
              <td>{formatNum(row[5])}</td>
              <td>{row[6]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
