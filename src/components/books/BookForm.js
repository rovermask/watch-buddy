// src/components/books/BookForm.js
import { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Camera, Search, Upload, CheckCircle, X, Barcode } from "lucide-react";

const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_BOOK_API_KEY;

export default function BookForm({ show, onHide, onSubmit, initialData, isEditing }) {
  // Form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("To Read");
  const [cover, setCover] = useState("");
  const [manualCover, setManualCover] = useState("");

  // Search state
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState("");

  // Scan state
  const [inputMode, setInputMode] = useState("search"); // "search" | "scan"
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);      // fetching book details
  const [scanSuccess, setScanSuccess] = useState(false);
  const [detectedISBN, setDetectedISBN] = useState("");

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const fileInputRef = useRef(null);

  // Init barcode reader once
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => { codeReaderRef.current?.reset(); };
  }, []);

  // Stop camera when modal closes or mode switches away from scan
  useEffect(() => {
    if (!show || inputMode !== "scan") {
      codeReaderRef.current?.reset();
      setCameraActive(false);
    }
  }, [show, inputMode]);

  // Populate fields when editing
  useEffect(() => {
    if (show && isEditing && initialData) {
      setTitle(initialData.title || "");
      setAuthor(initialData.author || "");
      setYear(initialData.year || "");
      setGenre(initialData.genre || "");
      setStatus(initialData.status || "To Read");
      setCover(initialData.cover || "");
      setManualCover("");
      setSuggestions([]);
      setShowManualInput(false);
      setInputMode("search");
      setError("");
    }
  }, [show, isEditing, initialData]);

  // Search suggestions (search mode only)
  useEffect(() => {
    if (inputMode !== "search") { setSuggestions([]); return; }
    if (title.length > 2) {
      setLoading(true);
      setError("");
      Promise.all([
        fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&key=${GOOGLE_BOOKS_API_KEY}`)
          .then(r => r.json()),
        fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=10`)
          .then(r => r.json()),
      ])
        .then(([googleData, olData]) => {
          const googleResults = (googleData.items || []).map(item => ({
            source: "google",
            title: item.volumeInfo?.title || "",
            author: item.volumeInfo?.authors?.join(", ") || "",
            year: item.volumeInfo?.publishedDate?.split("-")[0] || "",
            genre: item.volumeInfo?.categories?.join(", ") || "",
            cover: item.volumeInfo?.imageLinks?.thumbnail || "",
          }));
          const olResults = (olData.docs || []).map(doc => ({
            source: "openlibrary",
            title: doc.title || "",
            author: doc.author_name?.join(", ") || "",
            year: doc.first_publish_year || "",
            genre: doc.subject?.slice(0, 3).join(", ") || "",
            cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
          }));
          const merged = [...googleResults, ...olResults]
            .filter((b, i, self) =>
              i === self.findIndex(x =>
                x.title.toLowerCase() === b.title.toLowerCase() &&
                x.author.toLowerCase() === b.author.toLowerCase()
              )
            )
            .sort((a, b) => (b.year || 0) - (a.year || 0))
            .slice(0, 10);
          setSuggestions(merged);
          setLoading(false);
        })
        .catch(() => {
          setError("Unable to fetch suggestions. Please enter details manually.");
          setLoading(false);
        });
    } else {
      setSuggestions([]);
    }
  }, [title, inputMode]);

  const handleSelectBook = (book) => {
    setTitle(book.title || "");
    setAuthor(book.author || "");
    setGenre(book.genre || "");
    setYear(book.year || "");
    setCover(book.cover || "");
    setSuggestions([]);
  };

  // ── SCAN: start live camera ──
  const startCamera = async () => {
    setError("");
    setScanSuccess(false);
    setDetectedISBN("");
    setCameraActive(true);

    // Small delay to let the video element mount
    await new Promise(r => setTimeout(r, 100));

    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        null,           // null = default camera
        videoRef.current,
        (result, err) => {
          if (result) {
            const isbn = result.getText().replace(/[^0-9X]/gi, "");
            codeReaderRef.current.reset();
            setCameraActive(false);
            fetchBookByISBN(isbn);
          }
          // NotFoundException fires on every frame with no barcode — safe to ignore
          if (err && !(err instanceof NotFoundException)) {
            console.error("Barcode decode error:", err);
          }
        }
      );
    } catch (err) {
      setCameraActive(false);
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Allow camera in your browser or upload an image of the barcode.");
      } else {
        setError("Camera unavailable. Try uploading an image of the barcode instead.");
      }
    }
  };

  const stopCamera = () => {
    codeReaderRef.current?.reset();
    setCameraActive(false);
  };

  // ── SCAN: from uploaded image ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setScanSuccess(false);
    setScanning(true);

    const imgUrl = URL.createObjectURL(file);
    try {
      const result = await codeReaderRef.current.decodeFromImageUrl(imgUrl);
      const isbn = result.getText().replace(/[^0-9X]/gi, "");
      URL.revokeObjectURL(imgUrl);
      fetchBookByISBN(isbn);
    } catch {
      URL.revokeObjectURL(imgUrl);
      setScanning(false);
      setError("No barcode found in this image. Make sure the ISBN barcode is clearly visible and try again.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Fetch book details by ISBN (Open Library → Google Books fallback) ──
  const fetchBookByISBN = async (isbn) => {
    setDetectedISBN(isbn);
    setScanning(true);
    setError("");

    try {
      // 1. Open Library (completely free, no API key)
      const olRes = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const olData = await olRes.json();
      const olBook = olData[`ISBN:${isbn}`];

      if (olBook) {
        const pubYear = olBook.publish_date
          ? olBook.publish_date.replace(/\D/g, "").slice(0, 4)
          : "";
        setTitle(olBook.title || "");
        setAuthor(olBook.authors?.[0]?.name || "");
        setYear(pubYear);
        setGenre(olBook.subjects?.[0]?.name || "");
        // Prefer OL cover, fall back to ID-based URL
        setCover(
          olBook.cover?.medium ||
          olBook.cover?.small ||
          (olBook.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${olBook.covers[0]}-M.jpg`
            : "")
        );
        setScanSuccess(true);
        setScanning(false);
        return;
      }

      // 2. Google Books fallback (free, key optional but improves quota)
      const gbRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_BOOKS_API_KEY}`
      );
      const gbData = await gbRes.json();
      const item = gbData.items?.[0];

      if (item) {
        const info = item.volumeInfo;
        setTitle(info.title || "");
        setAuthor(info.authors?.join(", ") || "");
        setYear(info.publishedDate?.split("-")[0] || "");
        setGenre(info.categories?.join(", ") || "");
        setCover(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "");
        setScanSuccess(true);
      } else {
        setError(
          `No book found for ISBN ${isbn}. The barcode may not be an ISBN — try the search tab instead.`
        );
      }
    } catch {
      setError("Failed to fetch book details. Check your internet connection and try again.");
    } finally {
      setScanning(false);
    }
  };

  // ── Form submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (year && (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 5)) {
      setError("Please enter a valid year");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        year,
        genre: genre.trim(),
        status,
        cover: manualCover.trim() || cover,
      });
      resetForm();
      onHide();
    } catch {
      setError("Failed to save book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setAuthor(""); setYear(""); setGenre("");
    setCover(""); setManualCover(""); setStatus("To Read");
    setSuggestions([]); setShowManualInput(false);
    setScanSuccess(false); setDetectedISBN("");
    setInputMode("search"); setError("");
    setCameraActive(false);
    codeReaderRef.current?.reset();
  };

  const handleClose = () => { resetForm(); onHide(); };

  const showFormFields = inputMode === "search" || isEditing || (inputMode === "scan" && scanSuccess);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="custom-close">
        <Modal.Title>{isEditing ? "✏️ Edit Book" : "📚 Add New Book"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>
          )}

          {/* Mode toggle */}
          {!isEditing && (
            <div className="d-flex gap-2 mb-4">
              <Button type="button"
                variant={inputMode === "search" ? "primary" : "outline-secondary"}
                onClick={() => setInputMode("search")}
                className="flex-grow-1"
              >
                <Search size={16} className="me-2" />Search by Title
              </Button>
              <Button type="button"
                variant={inputMode === "scan" ? "primary" : "outline-secondary"}
                onClick={() => { setInputMode("scan"); setSuggestions([]); }}
                className="flex-grow-1"
              >
                <Barcode size={16} className="me-2" />Scan Barcode
              </Button>
            </div>
          )}

          {/* ── SCAN MODE ── */}
          {inputMode === "scan" && !isEditing && (
            <div className="mb-4">

              {/* Camera viewfinder */}
              {cameraActive && (
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: "100%", maxHeight: 260,
                      borderRadius: 10, background: "#000",
                      display: "block", objectFit: "cover",
                    }}
                  />
                  {/* Scan line animation */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: 10, overflow: "hidden", pointerEvents: "none",
                  }}>
                    <div style={{
                      position: "absolute", left: "10%", right: "10%", height: 2,
                      background: "rgba(139,92,246,0.85)",
                      boxShadow: "0 0 8px rgba(139,92,246,0.9)",
                      animation: "scanLine 2s linear infinite",
                    }} />
                    {/* Corner brackets */}
                    {[
                      { top: "15%", left: "15%", borderTop: "3px solid #8b5cf6", borderLeft: "3px solid #8b5cf6" },
                      { top: "15%", right: "15%", borderTop: "3px solid #8b5cf6", borderRight: "3px solid #8b5cf6" },
                      { bottom: "15%", left: "15%", borderBottom: "3px solid #8b5cf6", borderLeft: "3px solid #8b5cf6" },
                      { bottom: "15%", right: "15%", borderBottom: "3px solid #8b5cf6", borderRight: "3px solid #8b5cf6" },
                    ].map((s, i) => (
                      <div key={i} style={{ position: "absolute", width: 24, height: 24, ...s }} />
                    ))}
                  </div>
                  <p className="text-center text-muted mt-2" style={{ fontSize: "0.82rem" }}>
                    Point at the barcode on the back of the book
                  </p>
                  <div className="text-center">
                    <Button type="button" variant="outline-danger" size="sm" onClick={stopCamera}>
                      <X size={14} className="me-1" />Stop Camera
                    </Button>
                  </div>
                </div>
              )}

              {/* Fetching details spinner */}
              {scanning && (
                <div className="text-center py-4">
                  <Spinner animation="border" style={{ color: "var(--wb-purple, #8b5cf6)" }} className="mb-3" />
                  <p className="text-muted mb-0">
                    Found ISBN <strong>{detectedISBN}</strong> — fetching details…
                  </p>
                </div>
              )}

              {/* Success banner */}
              {scanSuccess && (
                <Alert variant="success" className="d-flex align-items-center gap-2 py-2">
                  <CheckCircle size={18} />
                  Book identified! Review details below.
                </Alert>
              )}

              {/* Action buttons (when camera is off and not scanning) */}
              {!cameraActive && !scanning && (
                <div className="d-flex gap-2">
                  <Button type="button" variant="outline-primary" onClick={startCamera} className="flex-grow-1">
                    <Camera size={16} className="me-2" />
                    {scanSuccess ? "Scan Another" : "Open Camera"}
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={() => fileInputRef.current?.click()} className="flex-grow-1">
                    <Upload size={16} className="me-2" />Upload Barcode Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>
              )}

              {!cameraActive && !scanning && !scanSuccess && (
                <p className="text-muted text-center mt-3 mb-0" style={{ fontSize: "0.82rem" }}>
                  Scan the ISBN barcode on the back of the book — no API key required
                </p>
              )}

              {/* Scan line CSS */}
              <style>{`
                @keyframes scanLine {
                  0%   { top: 15%; }
                  50%  { top: 80%; }
                  100% { top: 15%; }
                }
              `}</style>
            </div>
          )}

          {/* ── SEARCH MODE: title typeahead ── */}
          {inputMode === "search" && (
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  type="text"
                  placeholder="Search book title…"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
                {loading && (
                  <div className="mt-1" style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                    <Spinner animation="border" size="sm" className="me-2" />Searching…
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ListGroup style={{
                    position: "absolute", zIndex: 999, width: "100%",
                    maxHeight: 250, overflowY: "auto", marginTop: 4,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}>
                    {suggestions.map((s, idx) => (
                      <ListGroup.Item key={idx} action onClick={() => handleSelectBook(s)} style={{ cursor: "pointer" }}>
                        <div className="d-flex align-items-center">
                          {s.cover && (
                            <img src={s.cover} alt="" style={{ width: 30, height: 45, objectFit: "cover", marginRight: 10, borderRadius: 2 }} />
                          )}
                          <div className="flex-grow-1">
                            <div><strong>{s.title}</strong>{s.year && ` (${s.year})`}</div>
                            {s.author && <small className="text-muted">by {s.author}</small>}
                          </div>
                          <small style={{ color: "#888" }}>{s.source === "google" ? "📘" : "📕"}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Form.Group>
          )}

          {/* ── COMMON FIELDS ── */}
          {showFormFields && (
            <>
              {/* Title field in scan mode (editable after detection) */}
              {inputMode === "scan" && !isEditing && (
                <Form.Group className="mb-3">
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="Book title" value={title}
                    onChange={e => setTitle(e.target.value)} required disabled={submitting} />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Author(s) <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" placeholder="Author name(s)" value={author}
                  onChange={e => setAuthor(e.target.value)} required disabled={submitting} />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Publication Year</Form.Label>
                    <Form.Control type="number" placeholder="e.g., 2024" value={year}
                      onChange={e => setYear(e.target.value)}
                      min="1000" max={new Date().getFullYear() + 5} disabled={submitting} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={status} onChange={e => setStatus(e.target.value)} disabled={submitting}>
                      <option value="To Read">To Read</option>
                      <option value="Read">Read</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
                <Form.Control type="text" placeholder="e.g., Fiction, Mystery, Science Fiction"
                  value={genre} onChange={e => setGenre(e.target.value)} disabled={submitting} />
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="mb-0">Cover Image</Form.Label>
                  <Button type="button" variant="link" size="sm"
                    onClick={() => setShowManualInput(!showManualInput)} disabled={submitting}>
                    {showManualInput ? "Hide" : "Add"} Manual URL
                  </Button>
                </div>
                {showManualInput && (
                  <Form.Control type="url" placeholder="https://example.com/cover.jpg"
                    value={manualCover} onChange={e => setManualCover(e.target.value)} disabled={submitting} />
                )}
              </Form.Group>

              {(cover || manualCover) && (
                <div className="text-center p-3 bg-light rounded">
                  <p className="text-muted mb-2"><small>Cover Preview</small></p>
                  <img src={manualCover || cover} alt="Cover"
                    style={{ maxWidth: 120, maxHeight: 180, borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                    onError={e => { e.target.style.display = "none"; }} />
                </div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button variant="success" type="submit"
            disabled={submitting || scanning || cameraActive || (inputMode === "scan" && !scanSuccess && !isEditing)}>
            {submitting ? (
              <><Spinner animation="border" size="sm" className="me-2" />{isEditing ? "Saving…" : "Adding…"}</>
            ) : isEditing ? "Save Changes" : "Add Book"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}