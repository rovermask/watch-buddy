// src/components/series/SeriesGrid.js
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { MoreVertical, Edit2, Trash2, CheckCircle, Clock } from "lucide-react";
import SeriesForm from "./SeriesForm";
import "../MediaGrid.css";

export default function SeriesGrid({ series, onDelete, onToggleStatus, onUpdate }) {
  const [editingSeries, setEditingSeries] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (seriesItem) => {
    setEditingSeries(seriesItem);
    setShowEditModal(true);
  };

  const handleUpdate = (updatedData) => {
    onUpdate(editingSeries.id, updatedData);
    setShowEditModal(false);
    setEditingSeries(null);
  };

  if (!series || series.length === 0) {
    return (
      <div className="mg-empty">
        <span>📺</span>
        <p>No series yet — add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mg-grid">
        {series.map((seriesItem) => {
          const isWatched = seriesItem.status === "Watched";

          // BUG FIX: series stores image in either `poster` or `cover`
          const posterSrc =
            seriesItem.poster ||
            seriesItem.cover ||
            "https://via.placeholder.com/300x450/8b5cf6/ffffff?text=No+Cover";

          // BUG FIX: safely handle genre as string or array
          const genres = Array.isArray(seriesItem.genre)
            ? seriesItem.genre
            : typeof seriesItem.genre === "string" && seriesItem.genre.trim()
            ? seriesItem.genre.split(",").map((g) => g.trim())
            : [];

          return (
            <div key={seriesItem.id} className="mg-card">
              {/* Poster */}
              <div className="mg-card__poster-wrap">
                <img
                  src={posterSrc}
                  alt={seriesItem.title}
                  className="mg-card__poster"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x450/8b5cf6/ffffff?text=No+Cover";
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
                    onClick={() =>
                      onToggleStatus(seriesItem.id, seriesItem.status)
                    }
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
                  <p className="mg-card__title" title={seriesItem.title}>
                    {seriesItem.title}
                  </p>

                  {/* Context menu */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="link"
                      bsPrefix="p-0"
                      style={{ color: "var(--wb-text-muted)", lineHeight: 1 }}
                      aria-label="Series options"
                    >
                      <MoreVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEdit(seriesItem)}>
                        <Edit2 size={14} className="me-2" />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() =>
                          onToggleStatus(seriesItem.id, seriesItem.status)
                        }
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
                        onClick={() => onDelete(seriesItem.id)}
                        className="text-danger"
                      >
                        <Trash2 size={14} className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="mg-card__meta">
                  {seriesItem.year && (
                    <span className="mg-card__year">{seriesItem.year}</span>
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
      {editingSeries && (
        <SeriesForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingSeries(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingSeries}
          isEditing
        />
      )}
    </>
  );
}