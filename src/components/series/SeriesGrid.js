// src/components/series/SeriesGrid.js
import { useState } from "react";
import { useTheme } from "../../ThemeContext";
import "../MediaGrid.css";

export default function SeriesGrid({ series, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();

  if (series.length === 0) {
    return (
      <div className="mg-empty">
        <span>📺</span>
        <p>No series here yet.</p>
      </div>
    );
  }

  return (
    <div className="mg-grid">
      {series.map((show, i) => (
        <SeriesCard
          key={show.id}
          show={show}
          index={i}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

function SeriesCard({ show, index, onDelete, onToggleStatus, darkMode }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className={`mg-card ${darkMode ? "mg-card--dark" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="mg-card__poster-wrap">
        <img
          src={
            imgErr || !show.cover
              ? "https://via.placeholder.com/300x440/16162e/6c63ff?text=📺"
              : show.cover
          }
          alt={show.title}
          className="mg-card__poster"
          onError={() => setImgErr(true)}
          loading="lazy"
        />

        <div className="mg-card__overlay">
          <button
            className="mg-card__action-btn mg-card__action-btn--success"
            onClick={() => onToggleStatus(show.id, show.status)}
          >
            {show.status === "Watchlist" ? "✓ Watched" : "↩ Watchlist"}
          </button>
          <button
            className="mg-card__action-btn mg-card__action-btn--danger"
            onClick={() => onDelete(show.id)}
          >
            🗑 Delete
          </button>
        </div>

        <div className={`mg-card__status mg-card__status--${show.status === "Watched" ? "watched" : "watchlist"}`}>
          {show.status === "Watched" ? "✓ Watched" : "⏳ Watchlist"}
        </div>
      </div>

      <div className="mg-card__info">
        <h4 className="mg-card__title" title={show.title}>{show.title}</h4>
        <div className="mg-card__meta">
          {show.year && <span className="mg-card__year">{show.year}</span>}
          {show.genre && (
            <span className="mg-card__genre">{show.genre.split(",")[0].trim()}</span>
          )}
        </div>
      </div>
    </div>
  );
}