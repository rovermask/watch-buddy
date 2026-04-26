// src/components/admin/AdminNavbar.js
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Sun, Moon, LogOut, Menu, Tv } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import "./Admin.css"; // ← single admin stylesheet

export default function AdminNavbar({ onToggleSidebar }) {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <nav className="admin-navbar">
      {/* Hamburger — visible on mobile */}
      <button
        className="admin-navbar__hamburger"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Brand */}
      <NavLink to="/" className="admin-navbar__brand">
        <span className="admin-navbar__brand-icon">
          <Tv size={17} color="#fff" />
        </span>
        WatchBuddy
      </NavLink>

      {/* Admin badge */}
      <span className="admin-navbar__badge">Admin</span>

      <div className="admin-navbar__spacer" />

      {/* Actions */}
      <div className="admin-navbar__actions">
        {/* Theme toggle */}
        <button
          className="admin-navbar__icon-btn"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle theme"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Logout */}
        <button
          className="admin-navbar__logout"
          onClick={() => signOut(auth)}
          aria-label="Logout"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}