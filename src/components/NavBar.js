// src/components/NavBar.js  
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { NavLink } from "react-router-dom";
import "../App.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Sun, Moon } from "lucide-react"; // optional icons (install lucide-react)
import { useTheme } from "../ThemeContext";


function NavBar() {
  const { darkMode, setDarkMode } = useTheme();
  // const user = auth.currentUser;
  // console.log(user)

  return (
    <Navbar expand="lg" bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"}>
      <Container>
        <Navbar.Brand as={NavLink} to="/" className='fw-bold'>
          📺 WatchBuddy
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/movies">
              🎬 Movies
            </Nav.Link>
            <Nav.Link as={NavLink} to="/series">
              📺 Series
            </Nav.Link>
            <Nav.Link as={NavLink} to="/books">
              📚 Books
            </Nav.Link>
          </Nav>

          <Button
            variant={darkMode ? "outline-light" : "outline-light"}
            onClick={() => setDarkMode(!darkMode)}
            className="ms-2"
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
  );
}

export default NavBar;  