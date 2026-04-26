// src/components/books/AddBook.js
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {collection,onSnapshot,deleteDoc,doc,updateDoc,addDoc,query,where} from "firebase/firestore";
import { Container, Button, Form, InputGroup, ButtonGroup, ToggleButton, Badge, Card, Row, Col } from "react-bootstrap";
import BookTable from "./BookTable";
import BookForm from "./BookForm";
import BookGrid from "./BookGrid";
import { Plus, Search, Grid3x3, List, Filter, BookOpen, Clock, CheckCircle } from "lucide-react";

export default function AddBook() {
  const [user] = useAuthState(auth);
  const [books, setBooks] = useState([]);
  const [view, setView] = useState("To Read");
  const [layout, setLayout] = useState("grid");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "books"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return unsubscribe;
  }, [user]);

  const handleAddBook = async (bookData) => {
    const newTitle = bookData.title.trim().toLowerCase();
    const alreadyExists = books.some(
      (b) => b.title.trim().toLowerCase() === newTitle
    );

    if (alreadyExists) {
      alert("This book already exists in your list 📚");
      return;
    }
    await addDoc(collection(db, "books"), {
      ...bookData,
      uid: user.uid,
    });
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this book?")) {
      await deleteDoc(doc(db, "books", id));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "To Read" ? "Read" : "To Read";
    await updateDoc(doc(db, "books", id), { status: newStatus });
  };

  const handleUpdate = async (id, updatedData) => {
    await updateDoc(doc(db, "books", id), updatedData);
  };

  const filteredBooks = books.filter((b) =>
    [b.title, b.author, b.genre, b.year?.toString() || ""]
      .some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  const visibleBooks = filteredBooks.filter(
    (b) => b.status === view
  );

  const toReadCount = books.filter(b => b.status === "To Read").length;
  const readCount = books.filter(b => b.status === "Read").length;

  return (
    <div className="media-page" style={{ background: "var(--wb-bg)", minHeight: "100vh" }}>
      <Container className="py-4">
        {/* Header */}
        <div className="page-header-section mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h1 className="page-main-title mb-2">
                <BookOpen className="me-2" size={32} style={{ color: "var(--wb-purple)" }} />
                My Books
              </h1>
              <p className="page-main-subtitle">
                Track your reading journey and discover new books
              </p>
            </div>
            <Button
              variant="primary"
              className="add-media-btn"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} className="me-2" />
              Add Book
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <Clock size={24} className="mb-2" style={{ color: "#f59e0b" }} />
                <h4 className="mb-0">{toReadCount}</h4>
                <small className="text-muted">To Read</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <CheckCircle size={24} className="mb-2" style={{ color: "#10b981" }} />
                <h4 className="mb-0">{readCount}</h4>
                <small className="text-muted">Read</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <BookOpen size={24} className="mb-2" style={{ color: "#8b5cf6" }} />
                <h4 className="mb-0">{books.length}</h4>
                <small className="text-muted">Total Books</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <Filter size={24} className="mb-2" style={{ color: "#6c63ff" }} />
                <h4 className="mb-0">{visibleBooks.length}</h4>
                <small className="text-muted">Showing</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Card className="controls-card mb-4">
          <Card.Body>
            <div className="d-flex flex-wrap align-items-center gap-3">
              {/* Search */}
              <div className="flex-grow-1" style={{ minWidth: "200px", maxWidth: "400px" }}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </div>

              {/* Status Filter */}
              <ButtonGroup>
                <ToggleButton
                  id="book-status-toread"
                  type="radio"
                  variant={view === "To Read" ? "primary" : "outline-primary"}
                  name="status"
                  value="To Read"
                  checked={view === "To Read"}
                  onChange={(e) => setView(e.currentTarget.value)}
                  className="filter-btn"
                >
                  <Clock size={16} className="me-1" />
                  To Read
                  <Badge bg="warning" className="ms-2">{toReadCount}</Badge>
                </ToggleButton>
                <ToggleButton
                  id="book-status-read"
                  type="radio"
                  variant={view === "Read" ? "primary" : "outline-primary"}
                  name="status"
                  value="Read"
                  checked={view === "Read"}
                  onChange={(e) => setView(e.currentTarget.value)}
                  className="filter-btn"
                >
                  <CheckCircle size={16} className="me-1" />
                  Read
                  <Badge bg="success" className="ms-2">{readCount}</Badge>
                </ToggleButton>
              </ButtonGroup>

              {/* Layout Toggle */}
              <ButtonGroup>
                <ToggleButton
                  id="book-layout-grid"
                  type="radio"
                  variant={layout === "grid" ? "primary" : "outline-primary"}
                  name="layout"
                  value="grid"
                  checked={layout === "grid"}
                  onChange={(e) => setLayout(e.currentTarget.value)}
                  className="layout-btn"
                >
                  <Grid3x3 size={18} />
                </ToggleButton>
                <ToggleButton
                  id="book-layout-table"
                  type="radio"
                  variant={layout === "table" ? "primary" : "outline-primary"}
                  name="layout"
                  value="table"
                  checked={layout === "table"}
                  onChange={(e) => setLayout(e.currentTarget.value)}
                  className="layout-btn"
                >
                  <List size={18} />
                </ToggleButton>
              </ButtonGroup>
            </div>
          </Card.Body>
        </Card>

        {/* Content */}
        {visibleBooks.length === 0 ? (
          <Card className="empty-state-card">
            <Card.Body className="text-center py-5">
              <BookOpen size={64} className="mb-3" style={{ color: "var(--wb-text-muted)" }} />
              <h4>No books found</h4>
              <p className="text-muted mb-3">
                {search
                  ? "Try adjusting your search terms"
                  : `You don't have any books in your ${view.toLowerCase()} list yet`}
              </p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <Plus size={18} className="me-2" />
                Add Your First Book
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            {layout === "grid" ? (
              <BookGrid
                books={visibleBooks}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onUpdate={handleUpdate}
              />
            ) : (
              <BookTable
                books={visibleBooks}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onUpdate={handleUpdate}
              />
            )}
          </>
        )}

        {/* Add Book Modal */}
        <BookForm
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={handleAddBook}
        />
      </Container>
    </div>
  );
}