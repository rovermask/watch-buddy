// src/components/admin/tables/SeriesTable.js
import { useOutletContext } from "react-router-dom";
import AdminTable from "./AdminTable";

export default function SeriesTable() {
  const { series = [], onDelete } = useOutletContext();

  const columns = [
    {
      key: "title",
      label: "Title",
      className: "admin-table__title",
      render: (s) => s.title || "Untitled",
    },
    {
      key: "ownerName",
      label: "Owner",
      render: (s) => (
        <span className="admin-table__owner">
          <span className="admin-table__avatar" aria-hidden="true">
            {(s.ownerName || s.name || "?")[0].toUpperCase()}
          </span>
          {s.ownerName || s.name || "Unknown"}
        </span>
      ),
    },
    {
      key: "year",
      label: "Year",
      render: (s) => s.year || "—",
    },
  ];

  return (
    <AdminTable
      title="📺 Series"
      columns={columns}
      rows={series}
      onDelete={(row) => onDelete("series", row.id)}
      emptyMsg="No series found."
    />
  );
}