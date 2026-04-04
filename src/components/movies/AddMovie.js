// src/components/movies/AddMovie.js
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {collection,onSnapshot,deleteDoc,doc,updateDoc,addDoc,query,where} from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import MovieTable from "./MovieTable";
import MovieForm from "./MovieForm";
import { FaPlus } from "react-icons/fa";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import MovieGrid from "./MovieGrid";
import ToggleButton from "react-bootstrap/ToggleButton";

export default function AddMovie() {
  const [user] = useAuthState(auth);
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState("Watchlist"); // Watchlist | Watched
  const [layout, setLayout] = useState("grid"); // table | grid
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 🔹 Fetch movies (realtime)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "movies"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return unsubscribe;
  }, [user]);

  // 🔹 Add movie
  const handleAddMovie = async (movieData) => {
    // Normalize input
    const newTitle = movieData.title.trim().toLowerCase();

    // Check duplicates
    const alreadyExists = movies.some(
      (m) => m.title.trim().toLowerCase() === newTitle
    );

    if (alreadyExists) {
      alert("This movie already exists in your list 🎬");
      return;
    }
    await addDoc(collection(db, "movies"), {
      ...movieData,
      uid: user.uid,
    });
    setShowModal(false);
  };

  // 🔹 Delete movie
  const handleDelete = async (id) => {
    if (window.confirm("Delete this movie?")) {
      await deleteDoc(doc(db, "movies", id));
    }
  };

  // 🔹 Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "Watchlist" ? "Watched" : "Watchlist";
    await updateDoc(doc(db, "movies", id), { status: newStatus });
  };

  // 🔹 Update movie
  const handleUpdate = async (id, updatedData) => {
    await updateDoc(doc(db, "movies", id), updatedData);
  };

  // 🔹 Search filter
  const filteredMovies = movies.filter((m) =>
    [m.title, m.genre, m.year?.toString() || ""]
      .some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  // 🔹 Status filter
  const visibleMovies = filteredMovies.filter(
    (m) => m.status === view
  );

  return (
    <div className="container py-4">
      {/* 🔹 Controls */}
      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlus className="me-2" /> Add Movie
        </Button>

        <Form.Check
          type="switch"
          id="view-toggle"
          label={`Showing ${view}`}
          checked={view === "Watched"}
          onChange={() =>
            setView(view === "Watchlist" ? "Watched" : "Watchlist")
          }
        />

        <Form.Control
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "250px" }}
        />

        {/* 🔹 Table / Grid Toggle */}
        <ButtonGroup className="ms-auto">
          <ToggleButton
            id="layout-table"
            type="radio"
            variant="outline-secondary"
            checked={layout === "table"}
            onChange={() => setLayout("table")}
          >
            ☰
          </ToggleButton>

          <ToggleButton
            id="layout-grid"
            type="radio"
            variant="outline-secondary"
            checked={layout === "grid"}
            onChange={() => setLayout("grid")}
          >
            ⬛
          </ToggleButton>
        </ButtonGroup>
      </div>

      {/* 🔹 Content */}
      {visibleMovies.length > 0 ? (
        layout === "table" ? (
          <MovieTable
            movies={visibleMovies}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onUpdate={handleUpdate}
          />
        ) : (
          <MovieGrid
            movies={visibleMovies}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )
      ) : (
        <div className="text-center text-muted py-4">
          No movies found
        </div>
      )}

      {/* 🔹 Add Movie Modal */}
      <MovieForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddMovie}
      />
    </div>
  );
}
