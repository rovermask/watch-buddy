// src/components/movies/MovieGrid.js
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { MoreVertical, Edit2, Trash2, CheckCircle, Clock } from "lucide-react";
import MovieForm from "./MovieForm";
import "../MediaGrid.css";

export default function MovieGrid({ movies, onDelete, onToggleStatus, onUpdate }) {
  const [editingMovie, setEditingMovie] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowEditModal(true);
  };

  const handleUpdate = (updatedData) => {
    onUpdate(editingMovie.id, updatedData);
    setShowEditModal(false);
    setEditingMovie(null);
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="mg-empty">
        <span>🎬</span>
        <p>No movies yet — add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mg-grid">
        {movies.map((movie) => {
          const isWatched = movie.status === "Watched";

          // Safely extract genres whether stored as string or array
          const genres = Array.isArray(movie.genre)
            ? movie.genre
            : typeof movie.genre === "string" && movie.genre.trim()
            ? movie.genre.split(",").map((g) => g.trim())
            : [];

          return (
            <div key={movie.id} className="mg-card">
              {/* Poster */}
              <div className="mg-card__poster-wrap">
                <img
                  src={
                    movie.poster ||
                    "https://via.placeholder.com/300x450/6c63ff/ffffff?text=No+Poster"
                  }
                  alt={movie.title}
                  className="mg-card__poster"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x450/6c63ff/ffffff?text=No+Poster";
                  }}
                />

                {/* Status badge */}
                <span
                  className={`mg-card__status ${
                    isWatched
                      ? "mg-card__status--watched"
                      : "mg-card__status--watchlist"
                  }`}
                >
                  {isWatched ? "Watched" : "Watchlist"}
                </span>

                {/* Hover overlay */}
                <div className="mg-card__overlay">
                  <button
                    className={`mg-card__action-btn ${
                      isWatched
                        ? "mg-card__action-btn--danger"
                        : "mg-card__action-btn--success"
                    }`}
                    onClick={() => onToggleStatus(movie.id, movie.status)}
                  >
                    {isWatched ? (
                      <>
                        <Clock size={13} style={{ marginRight: 4 }} />
                        Move to Watchlist
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} style={{ marginRight: 4 }} />
                        Mark as Watched
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mg-card__info">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.25rem",
                  }}
                >
                  <p className="mg-card__title" title={movie.title}>
                    {movie.title}
                  </p>

                  {/* Context menu */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="link"
                      bsPrefix="p-0"
                      style={{ color: "var(--wb-text-muted)", lineHeight: 1 }}
                      aria-label="Movie options"
                    >
                      <MoreVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEdit(movie)}>
                        <Edit2 size={14} className="me-2" />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => onToggleStatus(movie.id, movie.status)}
                      >
                        {isWatched ? (
                          <>
                            <Clock size={14} className="me-2" />
                            Move to Watchlist
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="me-2" />
                            Mark as Watched
                          </>
                        )}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={() => onDelete(movie.id)}
                        className="text-danger"
                      >
                        <Trash2 size={14} className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="mg-card__meta">
                  {movie.year && (
                    <span className="mg-card__year">{movie.year}</span>
                  )}
                  {genres.slice(0, 2).map((g, idx) => (
                    <span key={idx} className="mg-card__genre">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingMovie && (
        <MovieForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingMovie(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingMovie}
          isEditing
        />
      )}
    </>
  );
}