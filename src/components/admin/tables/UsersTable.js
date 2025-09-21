// src/components/admin/tables/UsersTable.js
import { Table, Button } from "react-bootstrap";
import { useTheme } from "../../../ThemeContext"; // adjust path if needed
import { useOutletContext } from "react-router-dom";

export default function UsersTable() {
    const { darkMode } = useTheme();
    const { users, onDelete } = useOutletContext();
  
  return (
    <div className="mt-4">
      <h4>👤 Users</h4>
      <Table striped bordered hover responsive className={darkMode ? "table-dark" : ""}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.uid}>
              <td>{i + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete("users", u.uid)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
