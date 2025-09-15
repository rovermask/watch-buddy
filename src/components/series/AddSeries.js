// src/components/series/AddSeries.js
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, query, where } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import SeriesTable from "./SeriesTable";
import SeriesForm from "./SeriesForm";
import { FaPlus } from "react-icons/fa";

export default function AddSeries() {
  const [user] = useAuthState(auth);
  const [series, setSeries] = useState([]);
  const [view, setView] = useState("Watchlist"); // internal lowercase status  
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch series in realtime  
  useEffect(() => {
    if (!user) return; // wait until user is loaded  
    const q = query(
      collection(db, "series"),
      where("uid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  // Add new series  
  const handleAddSeries = async (seriesData) => {
    try {
      await addDoc(collection(db, "series"), {
        ...seriesData,
        uid: user.uid // ✅ Store the logged-in user's ID  
      });
      setShowModal(false);
    } catch (err) {
      alert("Error adding series: " + err.message);
    }
  };

  // Delete series  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this series?")) {
      try {
        await deleteDoc(doc(db, "series", id));
      } catch (err) {
        alert("Error deleting series: " + err.message);
      }
    }
  };

  // Toggle watchlist/watched  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Watchlist" ? "Watched" : "Watchlist";
    await updateDoc(doc(db, "series", id), { status: newStatus });
  };

  // Update series  
  const handleUpdate = async (id, updatedData) => {
    await updateDoc(doc(db, "series", id), updatedData);
  };

  // Filter series  
  const filteredSeries = series.filter((s) =>
    [s.title || "", s.genre || "", String(s.year || "")]
      .some((field) => field.toLowerCase().includes(search.toLowerCase()))
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
          <FaPlus /> Add Series
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

      {/* Series Table */}
      {filteredSeries.length > 0 ? (
        <SeriesTable
          series={filteredSeries.filter((s) => s.status === view)}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onUpdate={handleUpdate}
        />
      ) : (
        <div className="text-center text-muted py-4">No series found</div>
      )}

      {/* Add Series Modal */}
      <SeriesForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddSeries}
      />
    </div>
  );
}  