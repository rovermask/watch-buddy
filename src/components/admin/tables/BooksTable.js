// src/components/admin/tables/BooksTable.js
import { useOutletContext } from "react-router-dom";
import AdminTable from "./AdminTable";

export default function BooksTable() {
  const { books = [], onDelete } = useOutletContext();

  const columns = [
    {
      key: "title",
      label: "Title",
      className: "admin-table__title",
      render: (b) => b.title || "Untitled",
    },
    {
      key: "author",
      label: "Author",
      render: (b) => b.author || "—",
    },
    {
      key: "ownerName",
      label: "Owner",
      render: (b) => (
        <span className="admin-table__owner">
          <span className="admin-table__avatar" aria-hidden="true">
            {(b.ownerName || b.name || "?")[0].toUpperCase()}
          </span>
          {b.ownerName || b.name || "Unknown"}
        </span>
      ),
    },
    {
      key: "year",
      label: "Year",
      render: (b) => b.year || "—",
    },
  ];

  return (
    <AdminTable
      title="📚 Books"
      columns={columns}
      rows={books}
      onDelete={(row) => onDelete("books", row.id)}
      emptyMsg="No books found."
    />
  );
}