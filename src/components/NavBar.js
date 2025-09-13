// src/components/NavBar.js  
import Container from "react-bootstrap/Container";  
import Nav from "react-bootstrap/Nav";  
import Navbar from "react-bootstrap/Navbar";  
import Button from "react-bootstrap/Button";  
import { NavLink } from "react-router-dom";  
import "../App.css";  
import { signOut } from "firebase/auth";  
import { auth } from "../firebase";  
  
function NavBar() {  
  return (  
    <Navbar expand="lg" bg="dark" variant="dark" sticky="top">  
      <Container>  
        {/* Brand */}  
        <Navbar.Brand as={NavLink} to="/" className="fw-bold">  
          📺 WatchBuddy  
        </Navbar.Brand>  
  
        {/* Mobile Toggle */}  
        <Navbar.Toggle aria-controls="basic-navbar-nav" />  
  
        {/* Menu Items */}  
        <Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="me-auto">  
            <Nav.Link  
              as={NavLink}  
              to="/movies"  
              className={({ isActive }) => (isActive ? "active-nav" : "")}  
            >  
              🎬 Movies  
            </Nav.Link>  
            <Nav.Link  
              as={NavLink}  
              to="/series"  
              className={({ isActive }) => (isActive ? "active-nav" : "")}  
            >  
              📺 Series  
            </Nav.Link>  
            <Nav.Link  
              as={NavLink}  
              to="/books"  
              className={({ isActive }) => (isActive ? "active-nav" : "")}  
            >  
              📚 Books  
            </Nav.Link>  
          </Nav>  
  
          {/* Logout Button aligned right */}  
          <Button  
            variant="outline-light"  
            onClick={() => signOut(auth)}  
            className="ms-lg-3"  
          >  
            🚪 Logout  
          </Button>  
        </Navbar.Collapse>  
      </Container>  
    </Navbar>  
  );  
}  
  
export default NavBar;  