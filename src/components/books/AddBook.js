// src/components/books/AddBook.js  
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, query, where } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import BookTable from "./BookTable";  
import BookForm from "./BookForm";  
import { FaPlus } from "react-icons/fa";  
import ButtonGroup from "react-bootstrap/ButtonGroup";
import BookGrid from "./BookGrid";
import ToggleButton from "react-bootstrap/ToggleButton";

export default function AddBook() {  
  const [user] = useAuthState(auth);
  const [books, setBooks] = useState([]);  
  const [view, setView] = useState("To Read");  
  const [layout, setLayout] = useState("grid"); // table | grid
  const [search, setSearch] = useState("");  
  const [showModal, setShowModal] = useState(false);  
  
  // Fetch books in realtime  
  useEffect(() => {
    if (!user) return; // wait until user is loaded  
    const q = query(
      collection(db, "books"),
      where("uid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);
  
  // Add new book (from BookForm, which now supports Google Books autofill)  
  const handleAddBook = async (bookData) => {
    try {
      await addDoc(collection(db, "books"), {
        ...bookData,
        uid: user.uid // ✅ Store the logged-in user's ID  
      });
      setShowModal(false);
    } catch (err) {
      alert("Error adding books: " + err.message);
    }
  };
  
  // Delete book  
  const handleDelete = async (id) => {  
    if (window.confirm("Are you sure you want to delete this book?")) {  
      try {  
        await deleteDoc(doc(db, "books", id));  
      } catch (err) {  
        alert("Error deleting book: " + err.message);  
      }  
    }  
  };  
  
  // Toggle Read/To Read  
  const handleToggleStatus = async (id, currentStatus) => {  
    const newStatus = currentStatus === "To Read" ? "Read" : "To Read";  
    await updateDoc(doc(db, "books", id), { status: newStatus });  
  };  
  
  // Update book  
  const handleUpdate = async (id, updatedData) => {  
    await updateDoc(doc(db, "books", id), updatedData);  
  };  
  
  // Filter books (by title/genre/year)  
  const filteredBooks = books.filter((b) =>  
    [b.title,b.author, b.genre, b.year?.toString() || ""].some((field) =>  
      field?.toLowerCase().includes(search.toLowerCase())  
    )  
  );  

    // 🔹 Status filter
  const visibleBooks = filteredBooks.filter(
    (b) => b.status === view
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
          <FaPlus /> Add Book  
        </Button>  
  
        <Form.Check  
          type="switch"  
          id="view-toggle"  
          label={view === "To Read" ? "Showing To Read" : "Showing Read"}  
          checked={view === "Read"}  
          onChange={() => setView(view === "To Read" ? "Read" : "To Read")}  
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
  
      {/* Books Table */}  
      {visibleBooks.length > 0 ? (  
        layout === "table" ? (
        <BookTable  
          books={visibleBooks.filter((b) => b.status === view)}  
          onDelete={handleDelete}  
          onToggleStatus={handleToggleStatus}  
          onUpdate={handleUpdate}  
        />  
      ) : (
          <BookGrid
            books={visibleBooks}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )
      ) : (
        <div className="text-center text-muted py-4">
          No books found
        </div>
      )}

      {/* Add Book Modal — with Google Books API integration */}  
      <BookForm  
        show={showModal}  
        handleClose={() => setShowModal(false)}  
        handleSave={handleAddBook}  
      />  
    </div>  
  );  
}  