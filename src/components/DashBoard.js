// src/components/DashBoard.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Pie, Line } from "react-chartjs-2";
import { useTheme } from "../ThemeContext";
import { Film, Tv, BookOpen, TrendingUp, Clock, CheckCircle, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  ChartDataLabels,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [books, setBooks] = useState([]);
  const [customLists, setCustomLists] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubMovies = onSnapshot(
      query(collection(db, "movies"), where("uid", "==", user.uid)),
      (snap) => setMovies(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    const unsubSeries = onSnapshot(
      query(collection(db, "series"), where("uid", "==", user.uid)),
      (snap) => setSeries(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    const unsubBooks = onSnapshot(
      query(collection(db, "books"), where("uid", "==", user.uid)),
      (snap) => setBooks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    const unsubLists = onSnapshot(
      query(collection(db, "customLists"), where("uid", "==", user.uid)),
      (snap) => setCustomLists(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    return () => {
      unsubMovies();
      unsubSeries();
      unsubBooks();
      unsubLists();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-5" style={{ background: "var(--wb-bg)", minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const countStatus = (arr, watchKey = "status") => {
    const watchlist = arr.filter((item) => {
      const val = String(item[watchKey] || "").toLowerCase();
      return val === "watchlist" || val === "to read";
    }).length;
    const watched = arr.length - watchlist;
    return { watchlist, watched };
  };

  const movieCounts = countStatus(movies);
  const seriesCounts = countStatus(series);
  const bookCounts = countStatus(books);

  const totalItems = movies.length + series.length + books.length;

  const pieData = (counts, labels) => ({
    labels,
    datasets: [
      {
        label: "Count",
        data: [counts.watchlist, counts.watched],
        backgroundColor: ["#f59e0b", "#10b981"],
        borderColor: darkMode ? "#16162e" : "#ffffff",
        borderWidth: 3,
      },
    ],
  });

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: darkMode ? "#e8e8f8" : "#12122a",
          font: { size: 12, weight: "600" },
          padding: 15,
        },
      },
      datalabels: {
        color: "#ffffff",
        formatter: (value) => value,
        font: { weight: "bold", size: 18 },
      },
    },
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
    <Card 
      className="stat-card h-100" 
      style={{ 
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease"
      }}
      onClick={onClick}
    >
      <Card.Body className="d-flex align-items-center">
        <div 
          className="stat-icon me-3" 
          style={{ 
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            padding: "1rem",
            borderRadius: "12px"
          }}
        >
          <Icon size={28} style={{ color }} />
        </div>
        <div className="flex-grow-1">
          <p className="stat-title mb-1">{title}</p>
          <h3 className="stat-value mb-0">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div style={{ background: "var(--wb-bg)", minHeight: "100vh" }}>
      <Container className="py-4">
        {/* Welcome Section */}
        <div className="dashboard-header mb-4">
          <div>
            <h1 className="dashboard-title mb-2">
              Welcome back! 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your watch and reading list
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <Row className="g-3 mb-4">
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={Film}
              title="Movies"
              value={movies.length}
              subtitle={`${movieCounts.watched} watched`}
              color="#f59e0b"
              onClick={() => navigate("/movies")}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={Tv}
              title="Series"
              value={series.length}
              subtitle={`${seriesCounts.watched} watched`}
              color="#8b5cf6"
              onClick={() => navigate("/series")}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={BookOpen}
              title="Books"
              value={books.length}
              subtitle={`${bookCounts.watched} read`}
              color="#10b981"
              onClick={() => navigate("/books")}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={ListChecks}
              title="Custom Lists"
              value={customLists.length}
              subtitle="Organized collections"
              color="#6c63ff"
              onClick={() => navigate("/custom-lists")}
            />
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4 mb-4">
          <Col xs={12} md={6} lg={4}>
            <Card className="chart-card h-100">
              <Card.Body>
                <div className="chart-header mb-3">
                  <Film size={24} style={{ color: "#f59e0b" }} />
                  <h5 className="chart-title mb-0">Movies</h5>
                </div>
                {movies.length > 0 ? (
                  <Pie data={pieData(movieCounts, ["Watchlist", "Watched"])} options={pieOptions} />
                ) : (
                  <div className="empty-chart">
                    <p className="text-muted">No movies added yet</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate("/movies")}
                    >
                      Add Movies
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Card className="chart-card h-100">
              <Card.Body>
                <div className="chart-header mb-3">
                  <Tv size={24} style={{ color: "#8b5cf6" }} />
                  <h5 className="chart-title mb-0">Series</h5>
                </div>
                {series.length > 0 ? (
                  <Pie data={pieData(seriesCounts, ["Watchlist", "Watched"])} options={pieOptions} />
                ) : (
                  <div className="empty-chart">
                    <p className="text-muted">No series added yet</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate("/series")}
                    >
                      Add Series
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Card className="chart-card h-100">
              <Card.Body>
                <div className="chart-header mb-3">
                  <BookOpen size={24} style={{ color: "#10b981" }} />
                  <h5 className="chart-title mb-0">Books</h5>
                </div>
                {books.length > 0 ? (
                  <Pie data={pieData(bookCounts, ["To Read", "Read"])} options={pieOptions} />
                ) : (
                  <div className="empty-chart">
                    <p className="text-muted">No books added yet</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate("/books")}
                    >
                      Add Books
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Activity Summary */}
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <Card className="activity-card">
              <Card.Body>
                <h5 className="mb-3">
                  <TrendingUp size={20} className="me-2" style={{ color: "var(--wb-purple)" }} />
                  Overview
                </h5>
                <div className="activity-stats">
                  <div className="activity-item">
                    <div className="d-flex align-items-center mb-2">
                      <Clock size={18} className="me-2" style={{ color: "#f59e0b" }} />
                      <span className="activity-label">Pending</span>
                    </div>
                    <div className="activity-value">
                      {movieCounts.watchlist + seriesCounts.watchlist + bookCounts.watchlist} items
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="d-flex align-items-center mb-2">
                      <CheckCircle size={18} className="me-2" style={{ color: "#10b981" }} />
                      <span className="activity-label">Completed</span>
                    </div>
                    <div className="activity-value">
                      {movieCounts.watched + seriesCounts.watched + bookCounts.watched} items
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="d-flex align-items-center mb-2">
                      <ListChecks size={18} className="me-2" style={{ color: "#6c63ff" }} />
                      <span className="activity-label">Total Collection</span>
                    </div>
                    <div className="activity-value">{totalItems} items</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="quick-actions-card">
              <Card.Body>
                <h5 className="mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" onClick={() => navigate("/recommendations")}>
                    <TrendingUp size={18} className="me-2" />
                    Discover Recommendations
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate("/custom-lists")}>
                    <ListChecks size={18} className="me-2" />
                    Manage Custom Lists
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate("/movies")}>
                    <Film size={18} className="me-2" />
                    Add Movies
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}