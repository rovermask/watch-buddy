// src/components/admin/tables/AdminTable.js
// Reusable, responsive table used by all four admin table pages.
import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import "../Admin.css";

/**
 * Props:
 *  title      – string  e.g. "🎬 Movies"
 *  columns    – [{ key, label, render? }]
 *  rows       – array of data objects
 *  onDelete   – (row) => void
 *  emptyMsg   – string
 */
export default function AdminTable({ title, columns, rows, onDelete, emptyMsg = "No records found." }) {
  const [search, setSearch] = useState("");
  const [confirmRow, setConfirmRow] = useState(null); // row pending deletion

  const filtered = rows.filter((row) =>
    columns.some((col) => {
      const val = row[col.key];
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    })
  );

  return (
    <div className="admin-table-section">
      {/* Header */}
      <div className="admin-table-section__header">
        <h4 className="admin-table-section__title">
          {title}
          <span className="admin-table-section__count">{rows.length}</span>
        </h4>

        <label className="admin-table-section__search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search table"
          />
        </label>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table" role="table">
          <thead>
            <tr>
              <th>#</th>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="admin-table__empty"
                >
                  {search ? `No results for "${search}"` : emptyMsg}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={row.id || row.uid || i}>
                  <td className="admin-table__num" data-label="#">{i + 1}</td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      data-label={col.label}
                      className={col.className || ""}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                  <td data-label="Action">
                    <button
                      className="admin-table__del-btn"
                      onClick={() => setConfirmRow(row)}
                      aria-label={`Delete ${row.title || row.name || "record"}`}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm dialog */}
      {confirmRow && (
        <div
          className="admin-confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div className="admin-confirm-box">
            <h5>🗑️ Delete record?</h5>
            <p>
              This will permanently remove{" "}
              <strong>{confirmRow.title || confirmRow.name || "this record"}</strong>.
              This action cannot be undone.
            </p>
            <div className="admin-confirm-box__actions">
              <button
                className="admin-confirm-box__cancel"
                onClick={() => setConfirmRow(null)}
              >
                Cancel
              </button>
              <button
                className="admin-confirm-box__delete"
                onClick={() => {
                  onDelete(confirmRow);
                  setConfirmRow(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}