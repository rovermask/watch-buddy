// src/components/admin/Insights.js
import PieChart from "./charts/PieChart";
import BarChart from "./charts/BarChart";
import { useOutletContext } from "react-router-dom";
import "./Admin.css";

export default function AdminDashboard() {
  const { users = [], movies = [], books = [], series = [] } = useOutletContext();

  const totalEntries = movies.length + books.length + series.length;

  const stats = [
    { label: "Users",        value: users.length,  emoji: "👤", colorClass: "admin-stat-card__icon--purple"  },
    { label: "Movies",       value: movies.length, emoji: "🎬", colorClass: "admin-stat-card__icon--sky"     },
    { label: "Books",        value: books.length,  emoji: "📚", colorClass: "admin-stat-card__icon--emerald" },
    { label: "Series",       value: series.length, emoji: "📺", colorClass: "admin-stat-card__icon--amber"   },
  ];

  return (
    <div>
      <h1 className="admin-page-title">
        <span>📊</span> Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="admin-stats">
        {stats.map((s) => (
          <div className="admin-stat-card" key={s.label}>
            <div className={`admin-stat-card__icon ${s.colorClass}`}>
              {s.emoji}
            </div>
            <div className="admin-stat-card__body">
              <p className="admin-stat-card__label">{s.label}</p>
              <p className="admin-stat-card__value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts">
        <div className="admin-chart-card">
          <h5>Entries Distribution</h5>
          <PieChart
            data={[
              { name: "Movies", value: movies.length },
              { name: "Books",  value: books.length  },
              { name: "Series", value: series.length },
            ]}
          />
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--admin-text-muted)", marginTop: "0.5rem" }}>
            {totalEntries} total entries across all categories
          </p>
        </div>

        <div className="admin-chart-card">
          <h5>Entries per User</h5>
          <BarChart
            users={users}
            movies={movies}
            books={books}
            series={series}
          />
        </div>
      </div>
    </div>
  );
}