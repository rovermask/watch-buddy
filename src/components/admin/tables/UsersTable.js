// src/components/admin/tables/UsersTable.js
import { useOutletContext } from "react-router-dom";
import AdminTable from "./AdminTable";

export default function UsersTable() {
  const { users = [], onDelete } = useOutletContext();

  const columns = [
    {
      key: "name",
      label: "Name",
      className: "admin-table__title",
      render: (u) => (
        <span className="admin-table__owner">
          <span className="admin-table__avatar" aria-hidden="true">
            {(u.name || u.email || "?")[0].toUpperCase()}
          </span>
          {u.name || "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (u) => u.email || "—",
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span
          className={`admin-table__role-badge admin-table__role-badge--${
            u.role === "admin" ? "admin" : "user"
          }`}
        >
          {u.role || "user"}
        </span>
      ),
    },
  ];

  return (
    <AdminTable
      title="👤 Users"
      columns={columns}
      rows={users.map((u) => ({ ...u, id: u.uid }))} // normalize id field
      onDelete={(row) => onDelete("users", row.uid)}
      emptyMsg="No users found."
    />
  );
}