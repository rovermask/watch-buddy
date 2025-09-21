// src/components/movies/AddMovie.js
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, query, where } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import MovieTable from "./MovieTable";
import MovieForm from "./MovieForm";
import { FaPlus } from "react-icons/fa";

export default function AddMovie() {
  const [user] = useAuthState(auth);
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState("Watchlist");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch movies in realtime  
  useEffect(() => {
    if (!user) return; // wait until user is loaded  
    const q = query(
      collection(db, "movies"),
      where("uid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  // Add new movie  
  const handleAddMovie = async (movieData) => {
    try {
      await addDoc(collection(db, "movies"), {
        ...movieData,
        uid: user.uid // ✅ Store the logged-in user's ID  
      });
      setShowModal(false);
    } catch (err) {
      alert("Error adding movie: " + err.message);
    }
  };

  // Delete movie  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await deleteDoc(doc(db, "movies", id));
      } catch (err) {
        alert("Error deleting movie: " + err.message);
      }
    }
  };

  // Toggle watchlist/watched  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Watchlist" ? "Watched" : "Watchlist";
    await updateDoc(doc(db, "movies", id), { status: newStatus });
  };

  // Update movie  
  const handleUpdate = async (id, updatedData) => {
    await updateDoc(doc(db, "movies", id), updatedData);
  };

  // Filter movies  
  const filteredMovies = movies.filter((m) =>
    [m.title, m.genre, m.year.toString() || ""].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="container py-4">
      {/* Controls */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex me-3 mb-2 align-items-center"
        >
          <FaPlus /> Add Movie
        </Button>

        <Form.Check
          type="switch"
          id="view-toggle"
          label={view === "Watchlist" ? "Showing Watchlist" : "Showing Watched"}
          checked={view === "Watched"}
          onChange={() => setView(view === "Watchlist" ? "Watched" : "Watchlist")}
          className="me-3 mb-2"
        />

        <Form.Control
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "250px" }}
          className="mb-2"
        />
      </div>

      {/* Movie Table */}
      {filteredMovies.length > 0 ? (
        <MovieTable
          movies={filteredMovies.filter((m) => m.status === view)}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onUpdate={handleUpdate}
        />
      ) : (
        <div className="text-center text-muted py-4">No movies found</div>
      )}

      {/* Add Movie Modal */}
      <MovieForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddMovie}
      />
    </div>
  );
}  