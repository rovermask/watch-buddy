// src/components/books/BookForm.js  
import { useState, useEffect } from "react";  
import Modal from "react-bootstrap/Modal";  
import Button from "react-bootstrap/Button";  
import Form from "react-bootstrap/Form";  
import Row from "react-bootstrap/Row";  
import Col from "react-bootstrap/Col";  
import ListGroup from "react-bootstrap/ListGroup";  
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
  
const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_BOOK_API_KEY;
  
export default function BookForm({ show, onHide, onSubmit }) {  
  const [title, setTitle] = useState("");  
  const [author, setAuthor] = useState("");  
  const [year, setYear] = useState("");  
  const [genre, setGenre] = useState("");  
  const [status, setStatus] = useState("To Read");  
  const [cover, setCover] = useState("");  
  const [manualCover, setManualCover] = useState("");
  const [suggestions, setSuggestions] = useState([]);  
  const [loading, setLoading] = useState(false);  
  const [submitting, setSubmitting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState("");  
  
  // Fetch from BOTH APIs at once  
  useEffect(() => {  
    if (title.length > 2) {  
      setLoading(true);  
      setError("");
  
      Promise.all([  
        fetch(  
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(  
            title  
          )}&key=${GOOGLE_BOOKS_API_KEY}`  
        ).then((res) => res.json()),  
        fetch(  
          `https://openlibrary.org/search.json?title=${encodeURIComponent(  
            title  
          )}&limit=10`  
        ).then((res) => res.json()),  
      ])  
        .then(([googleData, olData]) => {  
          const googleResults = (googleData.items || []).map((item) => ({  
            source: "google",  
            title: item.volumeInfo?.title || "",  
            author: item.volumeInfo?.authors  
              ? item.volumeInfo.authors.join(", ")  
              : "",  
            year: item.volumeInfo?.publishedDate  
              ? item.volumeInfo.publishedDate.split("-")[0]  
              : "",  
            genre: item.volumeInfo?.categories  
              ? item.volumeInfo.categories.join(", ")  
              : "",  
            cover: item.volumeInfo?.imageLinks?.thumbnail || "",  
          }));  
  
          const openLibraryResults = (olData.docs || []).map((doc) => ({  
            source: "openlibrary",  
            title: doc.title || "",  
            author: doc.author_name ? doc.author_name.join(", ") : "",  
            year: doc.first_publish_year || "",  
            genre: doc.subject ? doc.subject.slice(0, 3).join(", ") : "",  
            cover: doc.cover_i  
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`  
              : "",  
          }));  
  
          // Merge & remove duplicates by title+author  
          const merged = [...googleResults, ...openLibraryResults].filter(  
            (book, index, self) =>  
              index ===  
              self.findIndex(  
                (b) =>  
                  b.title.toLowerCase() === book.title.toLowerCase() &&  
                  b.author.toLowerCase() === book.author.toLowerCase()  
              )  
          );  
  
          // Sort by year (descending)  
          merged.sort((a, b) => (b.year || 0) - (a.year || 0));  
  
          setSuggestions(merged.slice(0, 10));  
          setLoading(false);  
        })  
        .catch((err) => {
          console.error("API Error:", err);
          setError("Unable to fetch book suggestions. Please enter details manually.");
          setLoading(false);
        });  
    } else {  
      setSuggestions([]);  
    }  
  }, [title]);  
  
  // Autofill  
  const handleSelectBook = (book) => {  
    setTitle(book.title || "");  
    setAuthor(book.author || "");  
    setGenre(book.genre || "");  
    setYear(book.year || "");  
    setCover(book.cover || "");  
    setSuggestions([]);  
  };  
  
  // Submit  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    
    // Validate year if provided
    if (year && (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 5)) {
      setError("Please enter a valid year");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const finalCover = manualCover.trim() || cover;
      await onSubmit({ 
        title: title.trim(), 
        author: author.trim(), 
        year, 
        genre: genre.trim(), 
        status, 
        cover: finalCover 
      });
      
      // Reset form
      setTitle("");  
      setAuthor("");  
      setYear("");  
      setGenre("");  
      setCover("");  
      setManualCover("");
      setStatus("To Read");  
      setShowManualInput(false);
      setError("");
      onHide();
    } catch (err) {
      console.error("Error adding book:", err);
      setError("Failed to add book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };  

  const handleClose = () => {
    setTitle("");  
    setAuthor("");  
    setYear("");  
    setGenre("");  
    setCover("");  
    setManualCover("");
    setStatus("To Read");
    setSuggestions([]);
    setShowManualInput(false);
    setError("");
    onHide();
  };  
  
  return (  
    <Modal show={show} onHide={handleClose} centered size="lg">  
      <Modal.Header closeButton className="custom-close">  
        <Modal.Title>📚 Add New Book</Modal.Title>  
      </Modal.Header>  
      <Form onSubmit={handleSubmit}>  
        <Modal.Body>  
          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
          
          {/* Title search */}  
          <Form.Group className="mb-3">
            <Form.Label>Title <span className="text-danger">*</span></Form.Label>
            <Row className="g-2">  
              <Col md={12} style={{ position: "relative" }}>  
                <Form.Control  
                  type="text"  
                  placeholder="Search book title..."  
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
                        onClick={() => handleSelectBook(s)}  
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
                            {s.author && <small className="text-muted">by {s.author}</small>}
                          </div>
                          <small style={{ color: "#888" }}>  
                            {s.source === "google" ? "📘" : "📕"}  
                          </small>
                        </div>
                      </ListGroup.Item>  
                    ))}  
                  </ListGroup>  
                )}  
              </Col>  
            </Row>
          </Form.Group>  
  
          {/* Author */}  
          <Form.Group className="mb-3">
            <Form.Label>Author(s) <span className="text-danger">*</span></Form.Label>
            <Form.Control  
              type="text"  
              placeholder="Author name(s)"  
              value={author}  
              onChange={(e) => setAuthor(e.target.value)}  
              required  
              disabled={submitting}
            />  
          </Form.Group>
  
          <Row>
            <Col md={6}>
              {/* Year */}  
              <Form.Group className="mb-3">
                <Form.Label>Publication Year</Form.Label>
                <Form.Control  
                  type="number"  
                  placeholder="e.g., 2024"  
                  value={year}  
                  onChange={(e) => setYear(e.target.value)}  
                  min="1000"
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
                  <option value="To Read">To Read</option>  
                  <option value="Read">Read</option>  
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
  
          {/* Genre */}  
          <Form.Group className="mb-3">
            <Form.Label>Genre</Form.Label>
            <Form.Control  
              type="text"  
              placeholder="e.g., Fiction, Mystery, Science Fiction"  
              value={genre}  
              onChange={(e) => setGenre(e.target.value)}
              disabled={submitting}  
            />  
          </Form.Group>

          {/* Manual Cover URL */}
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">Cover Image</Form.Label>
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
                placeholder="https://example.com/cover.jpg"
                value={manualCover}
                onChange={(e) => setManualCover(e.target.value)}
                disabled={submitting}
              />
            )}
          </Form.Group>
  
          {/* Cover Preview */}  
          {(cover || manualCover) && (  
            <div className="text-center p-3 bg-light rounded">  
              <p className="text-muted mb-2"><small>Cover Preview</small></p>
              <img  
                src={manualCover || cover}  
                alt="Cover"  
                style={{ maxWidth: "120px", maxHeight: "180px", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setError("Cover image failed to load. Please check the URL.");
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
              <>Add Book</>
            )}
          </Button>  
        </Modal.Footer>  
      </Form>  
    </Modal>  
  );  
}