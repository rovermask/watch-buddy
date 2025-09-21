// src/components/books/BookForm.js  
import { useState, useEffect } from "react";  
import Modal from "react-bootstrap/Modal";  
import Button from "react-bootstrap/Button";  
import Form from "react-bootstrap/Form";  
import Row from "react-bootstrap/Row";  
import Col from "react-bootstrap/Col";  
import ListGroup from "react-bootstrap/ListGroup";  
  
const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_BOOK_API_KEY;
  
export default function BookForm({ show, handleClose, handleSave }) {  
  const [title, setTitle] = useState("");  
  const [author, setAuthor] = useState("");  
  const [year, setYear] = useState("");  
  const [genre, setGenre] = useState("");  
  const [status, setStatus] = useState("To Read");  
  const [cover, setCover] = useState("");  
  const [suggestions, setSuggestions] = useState([]);  
  const [loading, setLoading] = useState(false);  
  
  // Fetch from BOTH APIs at once  
  useEffect(() => {  
    if (title.length > 2) {  
      setLoading(true);  
  
      Promise.all([  
        fetch(  
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(  
            title  
          )}&key=${GOOGLE_BOOKS_API_KEY}`  
        ).then((res) => res.json()),  
        fetch(  
          `https://openlibrary.org/search.json?title=${encodeURIComponent(  
            title  
          )}`  
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
            genre: "",  
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
  
          // Optional: sort by year (descending)  
          merged.sort((a, b) => (b.year || 0) - (a.year || 0));  
  
          setSuggestions(merged);  
          setLoading(false);  
        })  
        .catch(() => setLoading(false));  
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
  const onSubmit = (e) => {  
    e.preventDefault();  
    handleSave({ title, author, year, genre, status, cover });  
    setTitle("");  
    setAuthor("");  
    setYear("");  
    setGenre("");  
    setCover("");  
    setStatus("To Read");  
    handleClose();  
  };  
  
  return (  
    <Modal show={show} onHide={handleClose} centered>  
      <Modal.Header closeButton className="custom-close">  
        <Modal.Title>📚 Add New Book</Modal.Title>  
      </Modal.Header>  
      <Form onSubmit={onSubmit}>  
        <Modal.Body>  
          {/* Title search */}  
          <Row className="g-2">  
            <Col md={12} style={{ position: "relative" }}>  
              <Form.Control  
                type="text"  
                placeholder="Search book title..."  
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
                  {suggestions.map((s, idx) => (  
                    <ListGroup.Item  
                      key={idx}  
                      action  
                      onClick={() => handleSelectBook(s)}  
                    >  
                      {s.cover && (  
                        <img  
                          src={s.cover}  
                          alt=""  
                          style={{  
                            width: "30px",  
                            height: "45px",  
                            objectFit: "cover",  
                            marginRight: "8px",  
                          }}  
                        />  
                      )}  
                      {s.title} {s.year && `(${s.year})`}{" "}  
                      <small style={{ color: "#888" }}>  
                        {s.source === "google" ? "📘 Google" : "📕 OpenLibrary"}  
                      </small>  
                    </ListGroup.Item>  
                  ))}  
                </ListGroup>  
              )}  
            </Col>  
          </Row>  
  
          {/* Author */}  
          <Form.Control  
            className="mt-2"  
            type="text"  
            placeholder="Author(s)"  
            value={author}  
            onChange={(e) => setAuthor(e.target.value)}  
            required  
          />  
  
          {/* Year */}  
          <Form.Control  
            className="mt-2"  
            type="number"  
            placeholder="Year"  
            value={year}  
            onChange={(e) => setYear(e.target.value)}  
          />  
  
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
            <option value="To Read">To Read</option>  
            <option value="Read">Read</option>  
          </Form.Select>  
  
          {/* Cover Preview */}  
          {cover && (  
            <div className="mt-3 text-center">  
              <img  
                src={cover}  
                alt="Cover"  
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
            Add Book  
          </Button>  
        </Modal.Footer>  
      </Form>  
    </Modal>  
  );  
}  