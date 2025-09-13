// src/components/movies/MovieForm.js  
import { useState, useEffect } from "react";  
import Modal from "react-bootstrap/Modal";  
import Button from "react-bootstrap/Button";  
import Form from "react-bootstrap/Form";  
import Row from "react-bootstrap/Row";  
import Col from "react-bootstrap/Col";  
import ListGroup from "react-bootstrap/ListGroup";  
  
const TMDB_API_KEY = process.env.REACT_APP_MOVIE_API_KEY;   
  
export default function MovieForm({ show, handleClose, handleSave }) {  
  const [title, setTitle] = useState("");  
  const [year, setYear] = useState("");  
  const [genre, setGenre] = useState("");  
  const [status, setStatus] = useState("Watchlist");  
  const [poster, setPoster] = useState("");  
  const [suggestions, setSuggestions] = useState([]);  
  const [loading, setLoading] = useState(false);  
  
  // Fetch movie suggestions from TMDb  
  useEffect(() => {  
    if (title.length > 2) {  
      setLoading(true);  
      fetch(  
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(  
          title  
        )}`  
      )  
        .then((res) => res.json())  
        .then((data) => {  
          setSuggestions(data.results || []);  
          setLoading(false);  
        })  
        .catch(() => setLoading(false));  
    } else {  
      setSuggestions([]);  
    }  
  }, [title]);  
  
  // When user picks a movie from suggestions  
  const handleSelectMovie = (movie) => {  
    setTitle(movie.title);  
    setYear(movie.release_date ? movie.release_date.split("-")[0] : "");  
  
    // Fetch full details for genres & poster  
    fetch(  
      `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`  
    )  
      .then((res) => res.json())  
      .then((data) => {  
        setGenre(data.genres.map((g) => g.name).join(", "));  
        setPoster(  
          data.poster_path  
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`  
            : ""  
        );  
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
      <Modal.Header closeButton>  
        <Modal.Title>🎬 Add New Movie</Modal.Title>  
      </Modal.Header>  
      <Form onSubmit={onSubmit}>  
        <Modal.Body>  
          <Row className="g-2">  
            <Col md={12} style={{ position: "relative" }}>  
              <Form.Control  
                type="text"  
                placeholder="Search movie title..."  
                value={title}  
                onChange={(e) => setTitle(e.target.value)}  
                required  
              />  
              {loading && (  
                <div style={{ fontSize: "0.8rem" }}>Searching...</div>  
              )}  
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
                  {suggestions.map((s) => (  
                    <ListGroup.Item  
                      key={s.id}  
                      action  
                      onClick={() => handleSelectMovie(s)}  
                    >  
                      {s.title}{" "}  
                      {s.release_date ? `(${s.release_date.split("-")[0]})` : ""}  
                    </ListGroup.Item>  
                  ))}  
                </ListGroup>  
              )}  
            </Col>  
          </Row>  
  
          <Form.Control  
            className="mt-2"  
            type="number"  
            placeholder="Year"  
            value={year}  
            onChange={(e) => setYear(e.target.value)}  
            required  
          />  
          <Form.Control  
            className="mt-2"  
            type="text"  
            placeholder="Genre"  
            value={genre}  
            onChange={(e) => setGenre(e.target.value)}  
            required  
          />  
          <Form.Select  
            className="mt-2"  
            value={status}  
            onChange={(e) => setStatus(e.target.value)}  
          >  
            <option value="Watchlist">Watchlist</option>  
            <option value="Watched">Watched</option>  
          </Form.Select>  
  
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