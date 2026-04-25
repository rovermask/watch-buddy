// src/components/movies/MovieGrid.js
import { useState } from "react";
import { useTheme } from "../../ThemeContext";
import "../MediaGrid.css";

export default function MovieGrid({ movies, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();

  if (movies.length === 0) {
    return (
      <div className="mg-empty">
        <span>🎬</span>
        <p>No movies here yet.</p>
      </div>
    );
  }

  return (
    <div className="mg-grid">
      {movies.map((movie, i) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          index={i}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

function MovieCard({ movie, index, onDelete, onToggleStatus, darkMode }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className={`mg-card ${darkMode ? "mg-card--dark" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Poster */}
      <div className="mg-card__poster-wrap">
        <img
          src={
            imgErr || !movie.poster
              ? "https://via.placeholder.com/300x440/16162e/6c63ff?text=🎬"
              : movie.poster
          }
          alt={movie.title}
          className="mg-card__poster"
          onError={() => setImgErr(true)}
          loading="lazy"
        />

        {/* Hover overlay with actions */}
        <div className="mg-card__overlay">
          <button
            className="mg-card__action-btn mg-card__action-btn--success"
            onClick={() => onToggleStatus(movie.id, movie.status)}
            title={movie.status === "Watchlist" ? "Mark as Watched" : "Move to Watchlist"}
          >
            {movie.status === "Watchlist" ? "✓ Watched" : "↩ Watchlist"}
          </button>
          <button
            className="mg-card__action-btn mg-card__action-btn--danger"
            onClick={() => onDelete(movie.id)}
            title="Delete"
          >
            🗑 Delete
          </button>
        </div>

        {/* Status badge */}
        <div className={`mg-card__status mg-card__status--${movie.status === "Watched" ? "watched" : "watchlist"}`}>
          {movie.status === "Watched" ? "✓ Watched" : "⏳ Watchlist"}
        </div>
      </div>

      {/* Info */}
      <div className="mg-card__info">
        <h4 className="mg-card__title" title={movie.title}>{movie.title}</h4>
        <div className="mg-card__meta">
          {movie.year && <span className="mg-card__year">{movie.year}</span>}
          {movie.genre && (
            <span className="mg-card__genre">
              {movie.genre.split(",")[0].trim()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}