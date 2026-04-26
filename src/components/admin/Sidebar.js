// src/components/admin/Sidebar.js
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Film, BookOpen, Tv } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import "./Admin.css";

const NAV_ITEMS = [
  { to: "/admin",         end: true, icon: <LayoutDashboard size={15} />, label: "Dashboard",  emoji: "📊" },
  { to: "users_table",   end: false, icon: <Users size={15} />,           label: "Users",      emoji: "👤" },
  { to: "movies_table",  end: false, icon: <Film size={15} />,            label: "Movies",     emoji: "🎬" },
  { to: "books_table",   end: false, icon: <BookOpen size={15} />,        label: "Books",      emoji: "📚" },
  { to: "series_table",  end: false, icon: <Tv size={15} />,              label: "Series",     emoji: "📺" },
];

export default function Sidebar({ isOpen, counts = {} }) {
  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="admin-sidebar__header">
        <p className="admin-sidebar__heading">Navigation</p>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? " active" : ""}`
            }
          >
            <span className="admin-sidebar__link-icon" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="admin-sidebar__link-label">{item.label}</span>
            {counts[item.label.toLowerCase()] !== undefined && (
              <span className="admin-sidebar__link-count">
                {counts[item.label.toLowerCase()]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        WatchBuddy &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}