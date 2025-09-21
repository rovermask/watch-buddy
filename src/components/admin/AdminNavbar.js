// src/admin/Navbar.js  
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { NavLink } from "react-router-dom";
import "../../App.css";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Sun, Moon } from "lucide-react"; // optional icons (install lucide-react)
import { useTheme } from "../../ThemeContext";

export default function AdminNavbar() {
  const { darkMode, setDarkMode } = useTheme();
  return (
    <>
      <Navbar expand="lg" bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} style={{ position: "sticky", top: "0", zIndex: "1000", height: "60px" }}>
        <Container>
          <Navbar.Brand as={NavLink} to="/" className='fw-bold'>
            📺 WatchBuddy
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/users">
                🎬 Users
              </Nav.Link>
              <Nav.Link as={NavLink} to="/entries">
                📺 Entries
              </Nav.Link>
            </Nav>
            <Button
              variant={darkMode ? "outline-light" : "outline-light"}
              onClick={() => setDarkMode(!darkMode)}
              className="ms-2 ml-3"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {/* Logout button */}
            <Button
              variant={darkMode ? "outline-light" : "outline-light"}
              className="ms-2 fw-bold"
              onClick={() => signOut(auth)}
            >
              🚪 Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>

  );
}