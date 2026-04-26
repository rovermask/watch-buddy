// src/components/series/AddSeries.js
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {collection,onSnapshot,deleteDoc,doc,updateDoc,addDoc,query,where} from "firebase/firestore";
import { Container, Button, Form, InputGroup, ButtonGroup, ToggleButton, Badge, Card, Row, Col } from "react-bootstrap";
import SeriesTable from "./SeriesTable";
import SeriesForm from "./SeriesForm";
import SeriesGrid from "./SeriesGrid";
import { Plus, Search, Grid3x3, List, Filter, Tv, Clock, CheckCircle } from "lucide-react";

export default function AddSeries() {
  const [user] = useAuthState(auth);
  const [series, setSeries] = useState([]);
  const [view, setView] = useState("Watchlist");
  const [layout, setLayout] = useState("grid");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "series"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeries(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return unsubscribe;
  }, [user]);

  const handleAddSeries = async (seriesData) => {
    const newTitle = seriesData.title.trim().toLowerCase();
    const alreadyExists = series.some(
      (s) => s.title.trim().toLowerCase() === newTitle
    );

    if (alreadyExists) {
      alert("This series already exists in your list 📺");
      return;
    }
    await addDoc(collection(db, "series"), {
      ...seriesData,
      uid: user.uid,
    });
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this series?")) {
      await deleteDoc(doc(db, "series", id));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "Watchlist" ? "Watched" : "Watchlist";
    await updateDoc(doc(db, "series", id), { status: newStatus });
  };

  const handleUpdate = async (id, updatedData) => {
    await updateDoc(doc(db, "series", id), updatedData);
  };

  const filteredSeries = series.filter((s) =>
    [s.title, s.genre, s.year?.toString() || ""]
      .some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  const visibleSeries = filteredSeries.filter(
    (s) => s.status === view
  );

  const watchlistCount = series.filter(s => s.status === "Watchlist").length;
  const watchedCount = series.filter(s => s.status === "Watched").length;

  return (
    <div className="media-page" style={{ background: "var(--wb-bg)", minHeight: "100vh" }}>
      <Container className="py-4">
        {/* Header */}
        <div className="page-header-section mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h1 className="page-main-title mb-2">
                <Tv className="me-2" size={32} style={{ color: "var(--wb-purple)" }} />
                My Series
              </h1>
              <p className="page-main-subtitle">
                Keep track of your favorite TV shows and series
              </p>
            </div>
            <Button
              variant="primary"
              className="add-media-btn"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} className="me-2" />
              Add Series
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <Clock size={24} className="mb-2" style={{ color: "#f59e0b" }} />
                <h4 className="mb-0">{watchlistCount}</h4>
                <small className="text-muted">Watchlist</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <CheckCircle size={24} className="mb-2" style={{ color: "#10b981" }} />
                <h4 className="mb-0">{watchedCount}</h4>
                <small className="text-muted">Watched</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <Tv size={24} className="mb-2" style={{ color: "#8b5cf6" }} />
                <h4 className="mb-0">{series.length}</h4>
                <small className="text-muted">Total Series</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="stat-mini-card">
              <Card.Body className="text-center">
                <Filter size={24} className="mb-2" style={{ color: "#6c63ff" }} />
                <h4 className="mb-0">{visibleSeries.length}</h4>
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
                    placeholder="Search series..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </div>

              {/* Status Filter */}
              <ButtonGroup>
                <ToggleButton
                  id="series-status-watchlist"
                  type="radio"
                  variant={view === "Watchlist" ? "primary" : "outline-primary"}
                  name="status"
                  value="Watchlist"
                  checked={view === "Watchlist"}
                  onChange={(e) => setView(e.currentTarget.value)}
                  className="filter-btn"
                >
                  <Clock size={16} className="me-1" />
                  Watchlist
                  <Badge bg="warning" className="ms-2">{watchlistCount}</Badge>
                </ToggleButton>
                <ToggleButton
                  id="series-status-watched"
                  type="radio"
                  variant={view === "Watched" ? "primary" : "outline-primary"}
                  name="status"
                  value="Watched"
                  checked={view === "Watched"}
                  onChange={(e) => setView(e.currentTarget.value)}
                  className="filter-btn"
                >
                  <CheckCircle size={16} className="me-1" />
                  Watched
                  <Badge bg="success" className="ms-2">{watchedCount}</Badge>
                </ToggleButton>
              </ButtonGroup>

              {/* Layout Toggle */}
              <ButtonGroup>
                <ToggleButton
                  id="series-layout-grid"
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
                  id="series-layout-table"
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
        {visibleSeries.length === 0 ? (
          <Card className="empty-state-card">
            <Card.Body className="text-center py-5">
              <Tv size={64} className="mb-3" style={{ color: "var(--wb-text-muted)" }} />
              <h4>No series found</h4>
              <p className="text-muted mb-3">
                {search
                  ? "Try adjusting your search terms"
                  : `You don't have any series in your ${view.toLowerCase()} yet`}
              </p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <Plus size={18} className="me-2" />
                Add Your First Series
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            {layout === "grid" ? (
              <SeriesGrid
                series={visibleSeries}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onUpdate={handleUpdate}
              />
            ) : (
              <SeriesTable
                series={visibleSeries}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onUpdate={handleUpdate}
              />
            )}
          </>
        )}

        {/* Add Series Modal */}
        <SeriesForm
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={handleAddSeries}
        />
      </Container>
    </div>
  );
}