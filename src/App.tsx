// Updated App.tsx with sorting, label fix, pagination, last updated, etc.
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
  const [movies, setMovies] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase.from("boxoffice").select("*");
    if (error) console.error(error);
    else {
      setData(data);
      const movieList = [...new Set(data.map((d) => d.movie))].sort();
      const regionList = [...new Set(data.map((d) => d.region))].sort();
      const areaList = [...new Set(data.map((d) => d.area))].sort();
      setMovies(movieList);
      setRegions(regionList);
      setAreas(areaList);
    }
  }

  const filteredData = data.filter((item) => {
    return (
      (!selectedMovie || item.movie === selectedMovie) &&
      (!selectedRegion || item.region === selectedRegion) &&
      (!selectedArea || item.area === selectedArea) &&
      item.movie.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const latestUpdate = filteredData.reduce((latest, item) => {
    return latest > item.last_updated ? latest : item.last_updated;
  }, "");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">BoxOfficeTrack</h1>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Input
          placeholder="Search movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
        >
          <option value="">All Movies</option>
          {movies.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="text-sm mb-2">
        Showing {filteredData.length} Records
        {latestUpdate && ` | Last Updated: ${new Date(latestUpdate).toLocaleString()}`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedData.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <h2 className="font-bold text-lg">{item.movie}</h2>
              <p>{item.region} - {item.area}</p>
              <p>Day 1: ₹{item.day1.toLocaleString()}</p>
              <p>Week 1: ₹{item.week1.toLocaleString()}</p>
              <p>Final: ₹{item.final_gross.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Updated: {new Date(item.last_updated).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-4">
          <Button onClick={() => setPage((p) => Math.max(p - 1, 1))}>Prev</Button>
          <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

export default App;
