// src/components/customlists/CustomLists.js
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Badge,
  InputGroup,
  Dropdown,
  Alert,
} from "react-bootstrap";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Film,
  Tv,
  BookOpen,
  List,
  X,
  Save,
  FolderPlus,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import "./CustomLists.css";

export default function CustomLists() {
  const { darkMode } = useTheme();
  const [user] = useAuthState(auth);
  const [customLists, setCustomLists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaType, setMediaType] = useState("movie");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [userMovies, setUserMovies] = useState([]);
  const [userSeries, setUserSeries] = useState([]);
  const [userBooks, setUserBooks] = useState([]);

  // Fetch custom lists
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "customLists"),
      where("uid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomLists(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return unsubscribe;
  }, [user]);

  // Fetch user's movies, series, and books
  useEffect(() => {
    if (!user) return;
    const fetchUserMedia = async () => {
      const [moviesSnap, seriesSnap, booksSnap] = await Promise.all([
        getDocs(query(collection(db, "movies"), where("uid", "==", user.uid))),
        getDocs(query(collection(db, "series"), where("uid", "==", user.uid))),
        getDocs(query(collection(db, "books"), where("uid", "==", user.uid))),
      ]);
      setUserMovies(moviesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setUserSeries(seriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setUserBooks(booksSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchUserMedia();
  }, [user]);

  // Create new list
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;
    await addDoc(collection(db, "customLists"), {
      uid: user.uid,
      name: listName,
      description: listDescription,
      items: [],
      createdAt: new Date(),
    });
    setListName("");
    setListDescription("");
    setShowCreateModal(false);
  };

  // Delete list
  const handleDeleteList = async (listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      await deleteDoc(doc(db, "customLists", listId));
    }
  };

  // Search TMDB/Google Books
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      if (mediaType === "movie") {
        const res = await fetch(
          `https://tmdb-proxy-server-ten.vercel.app/search?q=${encodeURIComponent(
            searchTerm
          )}&type=movie`
        );
        const data = await res.json();
        setSearchResults(
          (data.results || []).map((item) => ({
            id: item.id,
            title: item.title,
            year: item.release_date?.split("-")[0] || "",
            poster: item.poster_path
              ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
              : "",
            type: "movie",
          }))
        );
      } else if (mediaType === "series") {
        const res = await fetch(
          `https://tmdb-proxy-server-ten.vercel.app/search?q=${encodeURIComponent(
            searchTerm
          )}&type=tv`
        );
        const data = await res.json();
        setSearchResults(
          (data.results || []).map((item) => ({
            id: item.id,
            title: item.name,
            year: item.first_air_date?.split("-")[0] || "",
            poster: item.poster_path
              ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
              : "",
            type: "series",
          }))
        );
      } else {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            searchTerm
          )}&maxResults=20&key=${process.env.REACT_APP_BOOK_API_KEY}`
        );
        const data = await res.json();
        setSearchResults(
          (data.items || []).map((item) => ({
            id: item.id,
            title: item.volumeInfo?.title || "",
            author: item.volumeInfo?.authors?.join(", ") || "",
            year: item.volumeInfo?.publishedDate?.split("-")[0] || "",
            poster:
              item.volumeInfo?.imageLinks?.thumbnail?.replace(
                "http://",
                "https://"
              ) || "",
            type: "book",
          }))
        );
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  // Add item to list
  const handleAddItemToList = async (item) => {
    if (!selectedList) return;
    const currentItems = selectedList.items || [];
    
    // Check if item already exists
    const exists = currentItems.some((i) => i.id === item.id && i.type === item.type);
    if (exists) {
      alert("This item is already in the list!");
      return;
    }

    await updateDoc(doc(db, "customLists", selectedList.id), {
      items: [...currentItems, item],
    });
  };

  // Remove item from list
  const handleRemoveItem = async (listId, itemId, itemType) => {
    const list = customLists.find((l) => l.id === listId);
    if (!list) return;
    const updatedItems = list.items.filter(
      (item) => !(item.id === itemId && item.type === itemType)
    );
    await updateDoc(doc(db, "customLists", listId), {
      items: updatedItems,
    });
  };

  // Update list name/description
  const handleUpdateList = async (e) => {
    e.preventDefault();
    if (!selectedList || !listName.trim()) return;
    await updateDoc(doc(db, "customLists", selectedList.id), {
      name: listName,
      description: listDescription,
    });
    setShowEditModal(false);
    setSelectedList(null);
    setListName("");
    setListDescription("");
  };

  // Add from user's existing collection
  const handleAddFromCollection = (item, type) => {
    if (!selectedList) return;
    const itemToAdd = {
      id: item.id,
      title: item.title,
      year: item.year,
      poster: item.poster || item.cover,
      type: type,
      ...(type === "book" && { author: item.author }),
    };
    handleAddItemToList(itemToAdd);
  };

  return (
    <div className={`custom-lists-page ${darkMode ? "dark-mode" : ""}`}>
      <Container className="py-4">
        {/* Header */}
        <div className="page-header mb-4">
          <div>
            <h1 className="page-title">
              <List className="me-2" size={32} />
              Custom Lists
            </h1>
            <p className="page-subtitle">
              Organize your favorite movies, series, and books into personalized collections
            </p>
          </div>
          <Button
            variant="primary"
            className="create-list-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} className="me-2" />
            Create New List
          </Button>
        </div>

        {/* Lists Grid */}
        {customLists.length === 0 ? (
          <Alert variant="info" className="empty-state">
            <FolderPlus size={48} className="mb-3" />
            <h4>No lists yet!</h4>
            <p>Create your first custom list to start organizing your media collection.</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)} className="mt-3">
              <Plus className="me-2" size={18} />
              Create Your First List
            </Button>
          </Alert>
        ) : (
          <Row className="g-4">
            {customLists.map((list) => (
              <Col key={list.id} xs={12} md={6} lg={4}>
                <Card className="list-card h-100">
                  <Card.Body>
                    <div className="list-header">
                      <h4 className="list-title">{list.name}</h4>
                      <div className="list-actions">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedList(list);
                            setListName(list.name);
                            setListDescription(list.description || "");
                            setShowEditModal(true);
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    {list.description && (
                      <p className="list-description">{list.description}</p>
                    )}
                    <div className="list-stats">
                      <Badge bg="primary" pill>
                        {list.items?.length || 0} items
                      </Badge>
                    </div>

                    {/* Items Preview */}
                    <div className="items-preview">
                      {(list.items || []).slice(0, 6).map((item, idx) => (
                        <div key={idx} className="preview-item">
                          <img
                            src={
                              item.poster ||
                              "https://via.placeholder.com/100x150/667eea/ffffff?text=No+Image"
                            }
                            alt={item.title}
                          />
                          <button
                            className="remove-item-btn"
                            onClick={() => handleRemoveItem(list.id, item.id, item.type)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 mt-3"
                      onClick={() => {
                        setSelectedList(list);
                        setShowAddItemModal(true);
                      }}
                    >
                      <Plus size={16} className="me-2" />
                      Add Items
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Create List Modal */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          centered
          className={darkMode ? "dark-mode" : ""}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New List</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateList}>
              <Form.Group className="mb-3">
                <Form.Label>List Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Summer Movie Marathon"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="What's this list about?"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  <Save className="me-2" size={18} />
                  Create List
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Edit List Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          className={darkMode ? "dark-mode" : ""}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit List</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdateList}>
              <Form.Group className="mb-3">
                <Form.Label>List Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  <Save className="me-2" size={18} />
                  Update List
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add Item Modal */}
        <Modal
          show={showAddItemModal}
          onHide={() => {
            setShowAddItemModal(false);
            setSearchResults([]);
            setSearchTerm("");
          }}
          size="lg"
          centered
          className={darkMode ? "dark-mode" : ""}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Add Items to "{selectedList?.name}"
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Tab Navigation */}
            <div className="add-item-tabs mb-4">
              <Button
                variant={mediaType === "search" ? "primary" : "outline-primary"}
                onClick={() => setMediaType("search")}
                className="me-2"
              >
                <Search size={18} className="me-1" />
                Search Online
              </Button>
              <Button
                variant={mediaType === "collection" ? "primary" : "outline-primary"}
                onClick={() => setMediaType("collection")}
              >
                <Sparkles size={18} className="me-1" />
                From My Collection
              </Button>
            </div>

            {mediaType === "search" || mediaType === "movie" || mediaType === "series" || mediaType === "book" ? (
              <>
                {/* Search Section */}
                <div className="search-section mb-4">
                  <InputGroup className="mb-3">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary">
                        {mediaType === "movie" ? <Film size={18} /> : 
                         mediaType === "series" ? <Tv size={18} /> : 
                         <BookOpen size={18} />}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setMediaType("movie")}>
                          <Film size={18} className="me-2" /> Movies
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setMediaType("series")}>
                          <Tv size={18} className="me-2" /> Series
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setMediaType("book")}>
                          <BookOpen size={18} className="me-2" /> Books
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control
                      type="text"
                      placeholder={`Search for ${mediaType}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button variant="primary" onClick={handleSearch} disabled={searching}>
                      {searching ? "Searching..." : "Search"}
                    </Button>
                  </InputGroup>
                </div>

                {/* Search Results */}
                <div className="search-results">
                  <Row className="g-3">
                    {searchResults.map((item) => (
                      <Col key={item.id} xs={6} md={4} lg={3}>
                        <Card className="search-result-card">
                          <div className="result-poster">
                            <img
                              src={
                                item.poster ||
                                "https://via.placeholder.com/200x300/667eea/ffffff?text=No+Image"
                              }
                              alt={item.title}
                            />
                          </div>
                          <Card.Body className="p-2">
                            <p className="result-title mb-1" title={item.title}>
                              {item.title}
                            </p>
                            <small className="text-muted d-block mb-2">
                              {item.year}
                              {item.author && ` • ${item.author}`}
                            </small>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-100"
                              onClick={() => handleAddItemToList(item)}
                            >
                              <Plus size={14} className="me-1" />
                              Add
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  {searchResults.length === 0 && !searching && (
                    <p className="text-center text-muted py-4">
                      Search for movies, series, or books to add to your list
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* From Collection Section */
              <div className="collection-section">
                <div className="collection-tabs mb-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => setMediaType("collection-movies")}
                  >
                    <Film size={16} className="me-1" />
                    Movies ({userMovies.length})
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => setMediaType("collection-series")}
                  >
                    <Tv size={16} className="me-1" />
                    Series ({userSeries.length})
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setMediaType("collection-books")}
                  >
                    <BookOpen size={16} className="me-1" />
                    Books ({userBooks.length})
                  </Button>
                </div>

                <div className="collection-items">
                  <Row className="g-3">
                    {(mediaType === "collection-movies" ? userMovies :
                      mediaType === "collection-series" ? userSeries :
                      userBooks).map((item) => (
                      <Col key={item.id} xs={6} md={4} lg={3}>
                        <Card className="search-result-card">
                          <div className="result-poster">
                            <img
                              src={
                                item.poster || item.cover ||
                                "https://via.placeholder.com/200x300/667eea/ffffff?text=No+Image"
                              }
                              alt={item.title}
                            />
                          </div>
                          <Card.Body className="p-2">
                            <p className="result-title mb-1" title={item.title}>
                              {item.title}
                            </p>
                            <small className="text-muted d-block mb-2">
                              {item.year}
                              {item.author && ` • ${item.author}`}
                            </small>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-100"
                              onClick={() =>
                                handleAddFromCollection(
                                  item,
                                  mediaType === "collection-movies" ? "movie" :
                                  mediaType === "collection-series" ? "series" : "book"
                                )
                              }
                            >
                              <Plus size={14} className="me-1" />
                              Add
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  {((mediaType === "collection-movies" && userMovies.length === 0) ||
                    (mediaType === "collection-series" && userSeries.length === 0) ||
                    (mediaType === "collection-books" && userBooks.length === 0)) && (
                    <p className="text-center text-muted py-4">
                      No items in your collection yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}