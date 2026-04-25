// src/components/books/BookGrid.js
import { useState } from "react";
import { useTheme } from "../../ThemeContext";
import "../MediaGrid.css";

export default function BookGrid({ books, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();

  if (books.length === 0) {
    return (
      <div className="mg-empty">
        <span>📺</span>
        <p>No books here yet.</p>
      </div>
    );
  }

  return (
    <div className="mg-grid">
      {books.map((book, i) => (
        <BooksCard
          key={book.id}
          book={book}
          index={i}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

function BooksCard({ book, index, onDelete, onToggleStatus, darkMode }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className={`mg-card ${darkMode ? "mg-card--dark" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="mg-card__poster-wrap">
        <img
          src={
            imgErr || !book.cover
              ? "https://via.placeholder.com/300x440/16162e/6c63ff?text=📺"
              : book.cover
          }
          alt={book.title}
          className="mg-card__poster"
          onError={() => setImgErr(true)}
          loading="lazy"
        />

        <div className="mg-card__overlay">
          <button
            className="mg-card__action-btn mg-card__action-btn--success"
            onClick={() => onToggleStatus(book.id, book.status)}
          >
            {book.status === "To Read" ? "✓ Read" : "↩ Read"}
          </button>
          <button
            className="mg-card__action-btn mg-card__action-btn--danger"
            onClick={() => onDelete(book.id)}
          >
            🗑 Delete
          </button>
        </div>

        <div className={`mg-card__status mg-card__status--${book.status === "Watched" ? "watched" : "watchlist"}`}>
          {book.status === "Read" ? "✓ Read" : "⏳ To Read"}
        </div>
      </div>

      <div className="mg-card__info">
        <h4 className="mg-card__title" title={book.title}>{book.title}</h4>
        <div className="mg-card__meta">
          {book.year && <span className="mg-card__year">{book.year}</span>}
          {book.genre && (
            <span className="mg-card__genre">{book.genre.split(",")[0].trim()}</span>
          )}
        </div>
      </div>
    </div>
  );
}