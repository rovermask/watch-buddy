// src/components/books/BookGrid.js
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { MoreVertical, Edit2, Trash2, CheckCircle, Clock, User } from "lucide-react";
import BookForm from "./BookForm";
import "../MediaGrid.css";

export default function BookGrid({ books, onDelete, onToggleStatus, onUpdate }) {
  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleUpdate = (updatedData) => {
    onUpdate(editingBook.id, updatedData);
    setShowEditModal(false);
    setEditingBook(null);
  };

  if (!books || books.length === 0) {
    return (
      <div className="mg-empty">
        <span>📚</span>
        <p>No books yet — add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mg-grid">
        {books.map((book) => {
          // BUG FIX: books store image in `cover` not `poster`
          const isRead = book.status === "Read";

          const coverSrc =
            book.cover ||
            book.poster ||
            "https://via.placeholder.com/300x450/10b981/ffffff?text=No+Cover";

          // BUG FIX: safely handle genre as string or array
          const genres = Array.isArray(book.genre)
            ? book.genre
            : typeof book.genre === "string" && book.genre.trim()
            ? book.genre.split(",").map((g) => g.trim())
            : [];

          return (
            <div key={book.id} className="mg-card">
              {/* Cover */}
              <div className="mg-card__poster-wrap">
                <img
                  src={coverSrc}
                  alt={book.title}
                  className="mg-card__poster"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x450/10b981/ffffff?text=No+Cover";
                  }}
                />

                {/* Status badge — BUG FIX: use correct status classes for books */}
                <span
                  className={`mg-card__status ${
                    isRead
                      ? "mg-card__status--read"
                      : "mg-card__status--toread"
                  }`}
                >
                  {isRead ? "Read" : "To Read"}
                </span>

                {/* Hover overlay */}
                <div className="mg-card__overlay">
                  <button
                    className={`mg-card__action-btn ${
                      isRead
                        ? "mg-card__action-btn--danger"
                        : "mg-card__action-btn--success"
                    }`}
                    onClick={() => onToggleStatus(book.id, book.status)}
                  >
                    {isRead ? (
                      <>
                        <Clock size={13} style={{ marginRight: 4 }} />
                        Move to To Read
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} style={{ marginRight: 4 }} />
                        Mark as Read
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
                  <p className="mg-card__title" title={book.title}>
                    {book.title}
                  </p>

                  {/* Context menu */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="link"
                      bsPrefix="p-0"
                      style={{ color: "var(--wb-text-muted)", lineHeight: 1 }}
                      aria-label="Book options"
                    >
                      <MoreVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEdit(book)}>
                        <Edit2 size={14} className="me-2" />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => onToggleStatus(book.id, book.status)}
                      >
                        {isRead ? (
                          <>
                            <Clock size={14} className="me-2" />
                            Move to To Read
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="me-2" />
                            Mark as Read
                          </>
                        )}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={() => onDelete(book.id)}
                        className="text-danger"
                      >
                        <Trash2 size={14} className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Author */}
                {book.author && (
                  <p className="mg-card__author">
                    <User size={11} style={{ marginRight: 3 }} />
                    {book.author}
                  </p>
                )}

                <div className="mg-card__meta">
                  {book.year && (
                    <span className="mg-card__year">{book.year}</span>
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
      {editingBook && (
        <BookForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingBook(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingBook}
          isEditing
        />
      )}
    </>
  );
}