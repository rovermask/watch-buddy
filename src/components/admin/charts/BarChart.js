// src/components/admin/charts/BarChart.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function BarChart({ users = [], movies = [], books = [], series = [] }) {
  // Build a map uid -> name & counts
  const data = useMemo(() => {
    const map = {}; // uid -> { name, movies, books, series }

    users.forEach((u) => {
      map[u.uid] = { name: u.name || u.email || u.uid.slice(0,6), movies: 0, books: 0, series: 0 };
    });

    movies.forEach((m) => {
      const uid = m.uid || m.userId || m.ownerId;
      if (!map[uid]) map[uid] = { name: m.name || "Unknown", movies: 0, books: 0, series: 0 };
      map[uid].movies = (map[uid].movies || 0) + 1;
    });

    books.forEach((b) => {
      const uid = b.uid || b.userId || b.ownerId;
      if (!map[uid]) map[uid] = { name: b.name || "Unknown", movies: 0, books: 0, series: 0 };
      map[uid].books = (map[uid].books || 0) + 1;
    });

    series.forEach((s) => {
      const uid = s.uid || s.userId || s.ownerId;
      if (!map[uid]) map[uid] = { name: s.name || "Unknown", movies: 0, books: 0, series: 0 };
      map[uid].series = (map[uid].series || 0) + 1;
    });

    // Convert to array for recharts
    return Object.keys(map).map((uid) => ({
      name: map[uid].name,
      movies: map[uid].movies,
      books: map[uid].books,
      series: map[uid].series,
    }));
  }, [users, movies, books, series]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="movies" stackId="a" fill="#8884d8" />
          <Bar dataKey="books" stackId="a" fill="#82ca9d" />
          <Bar dataKey="series" stackId="a" fill="#ffc658" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
