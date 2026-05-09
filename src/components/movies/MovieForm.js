// src/components/movies/MovieForm.js  
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
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export default function MovieForm({ show, onHide, onSubmit }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("Watchlist");
  const [poster, setPoster] = useState("");
  const [manualPoster, setManualPoster] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState("");

  // 🔍 Fetch movie suggestions  
  useEffect(() => {
    if (title.length > 2) {
      setLoading(true);
      setError("");
      fetch(
        `https://tmdb-proxy-server-ten.vercel.app/search?q=${encodeURIComponent(
          title
        )}&type=movie`
      )
        .then((res) => res.json())
        .then((data) => {
          const results = (data.results || []).map((item) => ({
            id: item.id,
            title: item.title || "",
            year: item.release_date ? item.release_date.split("-")[0] : "",
            genre_ids: item.genre_ids || [],
            poster: item.poster_path
              ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
              : "",
          }));
          setSuggestions(results.slice(0, 10));
          setLoading(false);
        })
        .catch((err) => {
          console.error("API Error:", err);
          setError("Unable to fetch movie suggestions. Please enter details manually.");
          setLoading(false);
        });
    } else {
      setSuggestions([]);
    }
  }, [title]);

  // 🎬 When user selects a movie  
  const handleSelectMovie = (movie) => {
    fetch(`https://tmdb-proxy-server-ten.vercel.app/movie/${movie.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title || "");
        setYear(data.release_date ? data.release_date.split("-")[0] : "");
        setPoster(
          data.poster_path
            ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
            : ""
        );

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
        console.error("Error fetching movie details", err);
        setGenre("Unknown");
      });

    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate year if provided
    if (year && (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5)) {
      setError("Please enter a valid year (movies started in 1888)");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const finalPoster = manualPoster.trim() || poster;
      await onSubmit({ 
        title: title.trim(), 
        year, 
        genre: genre.trim(), 
        status, 
        poster: finalPoster 
      });
      
      // Reset form
      setTitle("");
      setYear("");
      setGenre("");
      setPoster("");
      setManualPoster("");
      setStatus("Watchlist");
      setShowManualInput(false);
      setError("");
      onHide();
    } catch (err) {
      console.error("Error adding movie:", err);
      setError("Failed to add movie. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setYear("");
    setGenre("");
    setPoster("");
    setManualPoster("");
    setStatus("Watchlist");
    setSuggestions([]);
    setShowManualInput(false);
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="custom-close">
        <Modal.Title>🎬 Add New Movie</Modal.Title>
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
                  placeholder="Search movie..."
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
                        onClick={() => handleSelectMovie(s)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center">
                          {s.poster && (
                            <img
                              src={s.poster}
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
                <Form.Label>Release Year</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1888"
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
              placeholder="e.g., Action, Comedy, Drama"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>

          {/* Manual Poster URL */}
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
                value={manualPoster}
                onChange={(e) => setManualPoster(e.target.value)}
                disabled={submitting}
              />
            )}
          </Form.Group>

          {/* Poster Preview */}
          {(poster || manualPoster) && (
            <div className="text-center p-3 bg-light rounded">
              <p className="text-muted mb-2"><small>Poster Preview</small></p>
              <img
                src={manualPoster || poster}
                alt="Poster"
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
            ) : (
              <>Add Movie</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}