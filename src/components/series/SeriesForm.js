// src/components/series/SeriesForm.js
import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

// Genre ID to name mapping from TMDB
const GENRE_MAP = {
  10759: "Action & Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 10762: "Kids",
  9648: "Mystery", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics", 37: "Western"
};

export default function SeriesForm({ show, onHide, onSubmit, initialData, isEditing }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("Watchlist");
  const [cover, setCover] = useState("");
  const [manualCover, setManualCover] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState("");

  // Populate fields when opening in edit mode
  useEffect(() => {
    if (show && isEditing && initialData) {
      setTitle(initialData.title || "");
      setYear(initialData.year || "");
      setGenre(initialData.genre || "");
      setStatus(initialData.status || "Watchlist");
      setCover(initialData.cover || initialData.poster || "");
      setManualCover("");
      setSuggestions([]);
      setShowManualInput(false);
      setError("");
    }
  }, [show, isEditing, initialData]);

  useEffect(() => {
    if (title.length > 2) {
      setLoading(true);
      setError("");
      fetch(
        `https://tmdb-proxy-server-ten.vercel.app/search?q=${encodeURIComponent(
          title)}&type=tv`
      )
        .then((res) => res.json())
        .then((data) => {
          const results = (data.results || []).map((item) => ({
            id: item.id,
            title: item.name || "",
            year: item.first_air_date ? item.first_air_date.split("-")[0] : "",
            genre_ids: item.genre_ids || [],
            cover: item.poster_path
              ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
              : "",
          }));
          setSuggestions(results.slice(0, 10));
          setLoading(false);
        })
        .catch((err) => {
          console.error("API Error:", err);
          setError("Unable to fetch series suggestions. Please enter details manually.");
          setLoading(false);
        });
    } else {
      setSuggestions([]);
    }
  }, [title]);

  const handleSelectSeries = (series) => {
    fetch(`https://tmdb-proxy-server-ten.vercel.app/tv/${series.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.name || "");
        setYear(data.first_air_date ? data.first_air_date.split("-")[0] : "");
        setCover(
          data.poster_path
            ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
            : ""
        );

        // ✅ robust handling
        if (data.genres && data.genres.length > 0) {
          setGenre(data.genres.map((g) => g.name).join(", "));
        } else if (data.genre_ids && data.genre_ids.length > 0) {
          const genreNames = data.genre_ids
            .map((id) => GENRE_MAP[id])
            .filter(Boolean)
            .join(", ");
          setGenre(genreNames || "Unknown");
        } else {
          setGenre("Unknown");
        }
      })
      .catch((err) => {
        console.error("Error fetching series details", err);
        setGenre("Unknown");
      });

    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate year if provided
    if (year && (isNaN(year) || year < 1920 || year > new Date().getFullYear() + 5)) {
      setError("Please enter a valid year");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const finalCover = manualCover.trim() || cover;
      await onSubmit({
        title: title.trim(),
        year,
        genre: genre.trim(),
        status,
        cover: finalCover
      });

      // Reset form
      setTitle("");
      setYear("");
      setGenre("");
      setCover("");
      setManualCover("");
      setStatus("Watchlist");
      setShowManualInput(false);
      setError("");
      onHide();
    } catch (err) {
      console.error("Error adding series:", err);
      setError("Failed to save series. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setYear("");
    setGenre("");
    setCover("");
    setManualCover("");
    setStatus("Watchlist");
    setSuggestions([]);
    setShowManualInput(false);
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="custom-close">
        <Modal.Title>{isEditing ? "✏️ Edit Series" : "📺 Add New Series"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

          {/* Search */}
          <Form.Group className="mb-3">
            <Form.Label>Title <span className="text-danger">*</span></Form.Label>
            <Row className="g-2">
              <Col md={12} style={{ position: "relative" }}>
                <Form.Control
                  type="text"
                  placeholder="Search series..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
                {loading && (
                  <div className="mt-1" style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Searching...
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ListGroup
                    style={{
                      position: "absolute",
                      zIndex: 999,
                      width: "100%",
                      maxHeight: "250px",
                      overflowY: "auto",
                      marginTop: "4px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}
                  >
                    {suggestions.map((s, idx) => (
                      <ListGroup.Item
                        key={idx}
                        action
                        onClick={() => handleSelectSeries(s)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center">
                          {s.cover && (
                            <img
                              src={s.cover}
                              alt=""
                              style={{
                                width: "30px",
                                height: "45px",
                                objectFit: "cover",
                                marginRight: "10px",
                                borderRadius: "2px"
                              }}
                            />
                          )}
                          <div className="flex-grow-1">
                            <div><strong>{s.title}</strong> {s.year && `(${s.year})`}</div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Col>
            </Row>
          </Form.Group>

          <Row>
            <Col md={6}>
              {/* Year */}
              <Form.Group className="mb-3">
                <Form.Label>First Air Date</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1920"
                  max={new Date().getFullYear() + 5}
                  disabled={submitting}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              {/* Status */}
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={submitting}
                >
                  <option value="Watchlist">Watchlist</option>
                  <option value="Watched">Watched</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Genre */}
          <Form.Group className="mb-3">
            <Form.Label>Genre</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Drama, Thriller, Sci-Fi"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>

          {/* Manual Cover URL */}
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">Poster Image</Form.Label>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowManualInput(!showManualInput)}
                disabled={submitting}
              >
                {showManualInput ? "Hide" : "Add"} Manual URL
              </Button>
            </div>
            {showManualInput && (
              <Form.Control
                type="url"
                placeholder="https://example.com/poster.jpg"
                value={manualCover}
                onChange={(e) => setManualCover(e.target.value)}
                disabled={submitting}
              />
            )}
          </Form.Group>

          {/* Cover Preview */}
          {(cover || manualCover) && (
            <div className="text-center p-3 bg-light rounded">
              <p className="text-muted mb-2"><small>Poster Preview</small></p>
              <img
                src={manualCover || cover}
                alt="Cover"
                style={{ maxWidth: "120px", maxHeight: "180px", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setError("Poster image failed to load. Please check the URL.");
                }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="success" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : isEditing ? (
              "Save Changes" 
            ) : (
              "Add Series"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}