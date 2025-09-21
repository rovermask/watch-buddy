// src/components/admin/Sidebar.js
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../ThemeContext"; // adjust path if needed

export default function Sidebar() {
  const { darkMode } = useTheme();

  return (
    <div className={`d-flex flex-column p-3 sidebar vh-100 p-0 ${darkMode ? "bg-dark text-white" : "light-sidebar"
      }`} style={{ height: "100%" }}>
      <Nav className="flex-column">
        <Nav.Link as={NavLink} to="/admin" end>
          📊 Dashboard
        </Nav.Link>
        <Nav.Link as={NavLink} to="users_table">
          👤 Users
        </Nav.Link>
        <Nav.Link as={NavLink} to="movies_table">
          🎬 Movies
        </Nav.Link>
        <Nav.Link as={NavLink} to="books_table">
          📚 Books
        </Nav.Link>
        <Nav.Link as={NavLink} to="series_table">
          📺 Series
        </Nav.Link>
      </Nav>
    </div>
  );
}
