// src/components/movies/MovieForm.js  
import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";

export default function MovieForm({ show, handleClose, handleSave }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("Watchlist");
  const [poster, setPoster] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genreMap] = useState({});

  // 🔍 Fetch movie suggestions  
  useEffect(() => {
    if (title.length > 2) {
      setLoading(true);
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
          setSuggestions(results);
          setLoading(false);
        })
        .catch(() => setLoading(false));
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
            .map((id) => genreMap[id])
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

  const onSubmit = (e) => {
    e.preventDefault();
    handleSave({ title, year, genre, status, poster });
    setTitle("");
    setYear("");
    setGenre("");
    setPoster("");
    setStatus("Watchlist");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="custom-close">
        <Modal.Title>🎬 Add New Movie</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {/* Search */}
          <Row className="g-2">
            <Col md={12} style={{ position: "relative" }}>
              <Form.Control
                type="text"
                placeholder="Search movie..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {loading && <div style={{ fontSize: "0.8rem" }}>Searching...</div>}
              {suggestions.length > 0 && (
                <ListGroup
                  style={{
                    position: "absolute",
                    zIndex: 999,
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map((s, idx) => (
                    <ListGroup.Item
                      key={idx}
                      action
                      onClick={() => handleSelectMovie(s)}
                    >
                      {s.poster && (
                        <img
                          src={s.poster}
                          alt=""
                          style={{
                            width: "30px",
                            height: "45px",
                            objectFit: "cover",
                            marginRight: "8px",
                          }}
                        />
                      )}
                      {s.title} {s.year && `(${s.year})`}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>
          </Row>

          {/* Genre */}
          <Form.Control
            className="mt-2"
            type="text"
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />

          {/* Status */}
          <Form.Select
            className="mt-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Watchlist">Watchlist</option>
            <option value="Watched">Watched</option>
          </Form.Select>

          {/* Poster Preview */}
          {poster && (
            <div className="mt-3 text-center">
              <img
                src={poster}
                alt="Poster"
                style={{ maxWidth: "150px", borderRadius: "8px" }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" type="submit">
            Add Movie
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
