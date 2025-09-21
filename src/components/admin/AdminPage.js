// src/pages/AdminPage.js
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Outlet, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import AdminNavbar from "./AdminNavbar";
import Sidebar from "./Sidebar";
import "../../App.css";

export default function AdminPage() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [books, setBooks] = useState([]);
  const [series, setSeries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const checkRole = async () => {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
          fetchData();
        } else {
          navigate("/"); // not admin → redirect
        }
      };
      checkRole();
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    // 1. Fetch users first
    const usersSnap = await getDocs(collection(db, "users"));
    const usersData = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    setUsers(usersData);

    // Helper: get name by UID
    const getUserName = (uid) => {
      const u = usersData.find((user) => user.uid === uid);
      return u ? u.name : "Unknown";
    };

    // 2. Fetch movies, books, series and enrich with name
    const moviesSnap = await getDocs(collection(db, "movies"));
    const booksSnap = await getDocs(collection(db, "books"));
    const seriesSnap = await getDocs(collection(db, "series"));

    setMovies(moviesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      name: getUserName(d.data().uid)
    })));

    setBooks(booksSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      name: getUserName(d.data().uid)
    })));

    setSeries(seriesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      name: getUserName(d.data().uid)
    })));
  };

  const handleDelete = async (collectionName, id) => {
    if(collectionName==="users"){

    }
    await deleteDoc(doc(db, collectionName, id));
    fetchData(); // refresh after deletion
  };

  if (!user) return <p className="p-6">Loading...</p>;
  if (!isAdmin) return <p className="p-6">Checking permissions...</p>;

  return (
    <>
      <AdminNavbar />
      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col md={2} className="sidebar vh-100 p-0">
            <Sidebar />
          </Col>
          <Col className="m-4">
            <Outlet context={{ users, movies, books, series, onDelete: handleDelete }}/>
          </Col>
        </Row>
      </Container>
    </>
  );
}
