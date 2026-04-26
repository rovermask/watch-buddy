// src/pages/AdminPage.js
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import Sidebar from "./Sidebar";
import "./Admin.css";

export default function AdminPage() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users,  setUsers]  = useState([]);
  const [movies, setMovies] = useState([]);
  const [books,  setBooks]  = useState([]);
  const [series, setSeries] = useState([]);

  const navigate = useNavigate();

  // Close sidebar when route changes on mobile
  const closeSidebar = () => setSidebarOpen(false);

  const fetchData = useCallback(async () => {
    // 1. Fetch users first so we can map uid → name
    const usersSnap = await getDocs(collection(db, "users"));
    const usersData = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    setUsers(usersData);

    const getUserName = (uid) => {
      const u = usersData.find((u) => u.uid === uid);
      return u ? u.name || u.email || "Unknown" : "Unknown";
    };

    const [moviesSnap, booksSnap, seriesSnap] = await Promise.all([
      getDocs(collection(db, "movies")),
      getDocs(collection(db, "books")),
      getDocs(collection(db, "series")),
    ]);

    setMovies(moviesSnap.docs.map((d) => ({ id: d.id, ...d.data(), ownerName: getUserName(d.data().uid) })));
    setBooks (booksSnap.docs.map ((d) => ({ id: d.id, ...d.data(), ownerName: getUserName(d.data().uid) })));
    setSeries(seriesSnap.docs.map((d) => ({ id: d.id, ...d.data(), ownerName: getUserName(d.data().uid) })));
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const checkRole = async () => {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
          fetchData();
        } else {
          navigate("/");
        }
      };
      checkRole();
    } else if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate, fetchData]);

  const handleDelete = async (collectionName, id) => {
    // NOTE: Actual confirm dialog is handled inside each table component
    await deleteDoc(doc(db, collectionName, id));
    fetchData();
  };

  // Sidebar counts for badges
  const counts = {
    users:  users.length,
    movies: movies.length,
    books:  books.length,
    series: series.length,
  };

  if (loading || (!isAdmin && user))
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Outfit, sans-serif",
          color: "var(--admin-text-muted, #9292b0)",
          fontSize: "1rem",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>🔐</span>
        {loading ? "Loading…" : "Checking permissions…"}
      </div>
    );

  return (
    <>
      <AdminNavbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="admin-shell">
        {/* Mobile overlay */}
        <div
          className={`admin-shell__overlay ${sidebarOpen ? "is-open" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        <Sidebar
          isOpen={sidebarOpen}
          counts={counts}
        />

        <main className="admin-main" onClick={sidebarOpen ? closeSidebar : undefined}>
          <Outlet
            context={{
              users,
              movies,
              books,
              series,
              onDelete: handleDelete,
              onRefresh: fetchData,
            }}
          />
        </main>
      </div>
    </>
  );
}