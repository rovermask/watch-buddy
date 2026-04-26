// src/components/NavBar.js  
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { NavLink } from "react-router-dom";
import "../App.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Sun, Moon, Sparkles, Film, Tv, BookOpen, ListChecks, LogOut } from "lucide-react";
import { useTheme } from "../ThemeContext";

function NavBar() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <Navbar expand="lg" bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} className="wb-navbar sticky-top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className='fw-bold d-flex align-items-center gap-2 wb-brand'>
          <span className="wb-brand-icon">📺</span>
          <span className="wb-brand-text">WatchBuddy</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/recommendations" className="wb-nav-link">
              <Sparkles size={18} className="me-1" />
              <span>Recommendations</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/movies" className="wb-nav-link">
              <Film size={18} className="me-1" />
              <span>Movies</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/series" className="wb-nav-link">
              <Tv size={18} className="me-1" />
              <span>Series</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/books" className="wb-nav-link">
              <BookOpen size={18} className="me-1" />
              <span>Books</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/custom-lists" className="wb-nav-link">
              <ListChecks size={18} className="me-1" />
              <span>Custom Lists</span>
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant={darkMode ? "outline-light" : "outline-dark"}
              onClick={() => setDarkMode(!darkMode)}
              className="wb-theme-btn"
              size="sm"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            
            {/* Logout button */}
            <Button
              variant="outline-danger"
              className="wb-logout-btn"
              onClick={() => signOut(auth)}
              size="sm"
            >
              <LogOut size={18} className="me-1" />
              <span className="d-none d-md-inline">Logout</span>
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;