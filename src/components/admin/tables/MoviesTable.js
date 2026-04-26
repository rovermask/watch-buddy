// src/components/admin/tables/MoviesTable.js
import { useOutletContext } from "react-router-dom";
import AdminTable from "./AdminTable";

export default function MoviesTable() {
  const { movies = [], onDelete } = useOutletContext();

  const columns = [
    {
      key: "title",
      label: "Title",
      className: "admin-table__title",
      render: (m) => m.title || "Untitled",
    },
    {
      key: "ownerName",
      label: "Owner",
      render: (m) => (
        <span className="admin-table__owner">
          <span className="admin-table__avatar" aria-hidden="true">
            {(m.ownerName || m.name || "?")[0].toUpperCase()}
          </span>
          {m.ownerName || m.name || "Unknown"}
        </span>
      ),
    },
    {
      key: "year",
      label: "Year",
      render: (m) => m.year || "—",
    },
  ];

  return (
    <AdminTable
      title="🎬 Movies"
      columns={columns}
      rows={movies}
      onDelete={(row) => onDelete("movies", row.id)}
      emptyMsg="No movies found."
    />
  );
}