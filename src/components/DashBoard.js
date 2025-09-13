import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  ChartDataLabels
);

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [books, setBooks] = useState([]);

  // ✅ Hooks always at top level  
  useEffect(() => {
    // Run only when we have a user  
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

    return () => {
      unsubMovies();
      unsubSeries();
      unsubBooks();
    };
  }, [user]); // ✅ Runs when user changes  

  // ✅ Early return for loading state  
  if (loading) {
    return <div className="text-center py-5">Loading Dashboard...</div>;
  }

  // Status counting helper  
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

  console.log("Movies:", movies);
  console.log("Series:", series);
  console.log("Books:", books);
  const pieData = (counts, labels) => ({
    labels,
    datasets: [
      {
        label: "Count",
        data: [counts.watchlist, counts.watched],
        backgroundColor: ["#ff6384", "#36a2eb"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 5,
      },
    ],
  });

  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value) => value,
        font: { weight: "bold", size: 20 },
      },
    },
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">📊 My Dashboard</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">🎬 Movies</h5>
            <Pie data={pieData(movieCounts, ["Watchlist", "Watched"])} options={pieOptions} />
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">📺 Series</h5>
            <Pie data={pieData(seriesCounts, ["Watchlist", "Watched"])} options={pieOptions} />
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">📚 Books</h5>
            <Pie data={pieData(bookCounts, ["To Read", "Read"])} options={pieOptions} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
}  