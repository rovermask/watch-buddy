// src/components/recommendations/Recommendations.js
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useTheme } from "../../ThemeContext";
import "./Recommendations.css";

// ─── TMDB genre name → ID map (extended) ───────────────────────────────────
const TMDB_GENRE_MAP = {
  "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35,
  "Crime": 80, "Documentary": 99, "Drama": 18, "Family": 10751,
  "Fantasy": 14, "History": 36, "Horror": 27, "Music": 10402,
  "Mystery": 9648, "Romance": 10749, "Science Fiction": 878,
  "Sci-Fi & Fantasy": 10765, "Thriller": 53, "War": 10752,
  "Western": 37, "Action & Adventure": 10759, "Kids": 10762,
  "News": 10763, "Reality": 10764, "Soap": 10766, "Talk": 10767,
  "War & Politics": 10768,
};

// ─── Google Books genre → subject query ────────────────────────────────────
const BOOK_GENRE_MAP = {
  "Action": "action+adventure", "Adventure": "adventure+fiction",
  "Animation": "animated+stories", "Comedy": "humor+comedy",
  "Crime": "crime+thriller", "Documentary": "nonfiction+documentary",
  "Drama": "literary+fiction", "Family": "family+fiction",
  "Fantasy": "fantasy", "History": "history", "Horror": "horror",
  "Music": "music+biography", "Mystery": "mystery+detective",
  "Romance": "romance+fiction", "Science Fiction": "science+fiction",
  "Sci-Fi & Fantasy": "science+fiction+fantasy", "Thriller": "psychological+thriller",
  "War": "war+historical+fiction", "Western": "western+fiction",
};

// ─── Helper: compute genre frequency across all user items ─────────────────
function computeGenreFrequency(items) {
  const freq = {};
  items.forEach(item => {
    if (!item.genre) return;
    item.genre.split(",").forEach(g => {
      const genre = g.trim();
      if (genre) freq[genre] = (freq[genre] || 0) + 1;
    });
  });
  return freq;
}

// ─── Helper: pick top N genres ─────────────────────────────────────────────
function getTopGenres(freq, n = 3) {
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([genre]) => genre);
}

// ─── Toast component ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`wb-toast wb-toast--${type}`}>
      <span>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
    </div>
  );
}

// ─── Genre pill ─────────────────────────────────────────────────────────────
function GenrePill({ genre, count, active, onClick }) {
  return (
    <button
      className={`wb-genre-pill ${active ? "wb-genre-pill--active" : ""}`}
      onClick={() => onClick(genre)}
    >
      {genre}
      {count && <span className="wb-genre-pill__count">{count}</span>}
    </button>
  );
}

// ─── Media card ─────────────────────────────────────────────────────────────
function MediaCard({ item, type, isAdded, onAdd, darkMode }) {
  const [imgError, setImgError] = useState(false);
  const poster = item.poster || item.cover;
  const fallback = "https://via.placeholder.com/300x440/1e1e2e/667eea?text=No+Image";

  return (
    <div className={`wb-card ${darkMode ? "wb-card--dark" : ""}`}>
      <div className="wb-card__poster-wrap">
        <img
          src={imgError || !poster ? fallback : poster}
          alt={item.title}
          className="wb-card__poster"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {item.rating > 0 && (
          <div className="wb-card__rating">
            ⭐ {Number(item.rating).toFixed(1)}
          </div>
        )}
        {item.year && (
          <div className="wb-card__year">{item.year}</div>
        )}
        {item.matchedGenre && (
          <div className="wb-card__match-badge">✨ {item.matchedGenre}</div>
        )}
      </div>

      <div className="wb-card__body">
        <h4 className="wb-card__title" title={item.title}>{item.title}</h4>
        {type === "book" && item.author && (
          <p className="wb-card__author">by {item.author}</p>
        )}
        {item.genre && (
          <p className="wb-card__genres">{item.genre.split(",").slice(0, 2).join(" · ")}</p>
        )}
      </div>

      <div className="wb-card__footer">
        <button
          className={`wb-card__btn ${isAdded ? "wb-card__btn--added" : ""}`}
          onClick={() => !isAdded && onAdd(item, type)}
          disabled={isAdded}
        >
          {isAdded ? "✓ Added" : "+ Add to List"}
        </button>
      </div>
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ emoji, title, subtitle, count }) {
  return (
    <div className="wb-section-header">
      <div className="wb-section-header__left">
        <span className="wb-section-header__emoji">{emoji}</span>
        <div>
          <h3 className="wb-section-header__title">{title}</h3>
          {subtitle && <p className="wb-section-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {count > 0 && <span className="wb-section-header__count">{count} results</span>}
    </div>
  );
}

// ─── Skeleton loader ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="wb-skeleton">
      <div className="wb-skeleton__img" />
      <div className="wb-skeleton__line wb-skeleton__line--long" />
      <div className="wb-skeleton__line wb-skeleton__line--short" />
      <div className="wb-skeleton__btn" />
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function Recommendations() {
  const { darkMode } = useTheme();
  const [user] = useAuthState(auth);

  // User history
  const [userMovies, setUserMovies] = useState([]);
  const [userSeries, setUserSeries] = useState([]);
  const [userBooks, setUserBooks] = useState([]);

  // Genre state
  const [genreFreq, setGenreFreq] = useState({});
  const [topGenres, setTopGenres] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);

  // Recommendation results
  const [movieRecs, setMovieRecs] = useState([]);
  const [seriesRecs, setSeriesRecs] = useState([]);
  const [bookRecs, setBookRecs] = useState([]);

  // UI state
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [addedItems, setAddedItems] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("movies");
  const [hasHistory, setHasHistory] = useState(false);

  // ── Fetch user history ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const [moviesSnap, seriesSnap, booksSnap] = await Promise.all([
        getDocs(query(collection(db, "movies"), where("uid", "==", user.uid))),
        getDocs(query(collection(db, "series"), where("uid", "==", user.uid))),
        getDocs(query(collection(db, "books"),  where("uid", "==", user.uid))),
      ]);
      const movies = moviesSnap.docs.map(d => d.data());
      const series = seriesSnap.docs.map(d => d.data());
      const books  = booksSnap.docs.map(d => d.data());

      setUserMovies(movies);
      setUserSeries(series);
      setUserBooks(books);

      const allItems = [...movies, ...series, ...books];
      setHasHistory(allItems.length > 0);

      const freq = computeGenreFrequency(allItems);
      setGenreFreq(freq);
      const top = getTopGenres(freq, 5);
      setTopGenres(top);
      if (top.length > 0) setActiveGenre(top[0]);
    };
    fetchHistory();
  }, [user]);

  // ── Fetch movie recommendations when activeGenre changes ──────────────────
  useEffect(() => {
    if (!activeGenre) return;
    const genreId = TMDB_GENRE_MAP[activeGenre];
    if (!genreId) return;

    const fetchMovies = async () => {
      setLoadingMovies(true);
      setMovieRecs([]);
      try {
        const res = await fetch(
          `https://tmdb-proxy-server-ten.vercel.app/discover/movie?genre_id=${genreId}`
        );
        const data = await res.json();
        const results = (data.results || []).map(item => ({
          id: item.id,
          title: item.title || "",
          year: item.release_date?.split("-")[0] || "",
          genre: activeGenre,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "",
          rating: item.vote_average || 0,
          matchedGenre: activeGenre,
        }));
        setMovieRecs(results);
      } catch (err) {
        console.error("Error fetching movie recs:", err);
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchMovies();
  }, [activeGenre]);

  // ── Fetch series recommendations when activeGenre changes ─────────────────
  useEffect(() => {
    if (!activeGenre) return;
    const genreId = TMDB_GENRE_MAP[activeGenre];
    if (!genreId) return;

    const fetchSeries = async () => {
      setLoadingSeries(true);
      setSeriesRecs([]);
      try {
        const res = await fetch(
          `https://tmdb-proxy-server-ten.vercel.app/discover/tv?genre_id=${genreId}`
        );
        const data = await res.json();
        const results = (data.results || []).map(item => ({
          id: item.id,
          title: item.name || "",
          year: item.first_air_date?.split("-")[0] || "",
          genre: activeGenre,
          cover: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "",
          rating: item.vote_average || 0,
          matchedGenre: activeGenre,
        }));
        setSeriesRecs(results);
      } catch (err) {
        console.error("Error fetching series recs:", err);
      } finally {
        setLoadingSeries(false);
      }
    };
    fetchSeries();
  }, [activeGenre]);

  // ── Fetch book recommendations when activeGenre changes ───────────────────
  useEffect(() => {
    if (!activeGenre) return;
    const subject = BOOK_GENRE_MAP[activeGenre] || activeGenre.toLowerCase().replace(/ /g, "+");

    const fetchBooks = async () => {
      setLoadingBooks(true);
      setBookRecs([]);
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&orderBy=relevance&maxResults=12&key=${process.env.REACT_APP_BOOK_API_KEY}`
        );
        const data = await res.json();
        const results = (data.items || []).map(item => ({
          id: item.id,
          title: item.volumeInfo?.title || "",
          author: item.volumeInfo?.authors?.join(", ") || "Unknown",
          year: item.volumeInfo?.publishedDate?.split("-")[0] || "",
          genre: item.volumeInfo?.categories?.join(", ") || activeGenre,
          cover: item.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") || "",
          rating: item.volumeInfo?.averageRating || 0,
          matchedGenre: activeGenre,
        }));
        setBookRecs(results);
      } catch (err) {
        console.error("Error fetching book recs:", err);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [activeGenre]);

  // ── Check if item already in user's list ─────────────────────────────────
  const isAlreadyAdded = useCallback((item, type) => {
    const t = item.title.toLowerCase();
    if (type === "movie")  return userMovies.some(m => m.title?.toLowerCase() === t);
    if (type === "series") return userSeries.some(s => s.title?.toLowerCase() === t);
    if (type === "book")   return userBooks.some(b => b.title?.toLowerCase() === t);
    return false;
  }, [userMovies, userSeries, userBooks]);

  // ── Add to watchlist ──────────────────────────────────────────────────────
  const handleAdd = async (item, type) => {
    if (!user) { setToast({ message: "Please log in first.", type: "error" }); return; }
    const key = `${type}-${item.id}`;
    if (addedItems.has(key) || isAlreadyAdded(item, type)) {
      setToast({ message: "Already in your list!", type: "error" });
      return;
    }
    try {
      const col = type === "movie" ? "movies" : type === "series" ? "series" : "books";
      const payload = {
        uid: user.uid,
        title: item.title,
        year: item.year,
        genre: item.genre,
        status: type === "book" ? "To Read" : "Watchlist",
        ...(type === "movie"  ? { poster: item.poster } : {}),
        ...(type === "series" ? { cover: item.cover }  : {}),
        ...(type === "book"   ? { author: item.author, cover: item.cover } : {}),
      };
      await addDoc(collection(db, col), payload);
      setAddedItems(prev => new Set([...prev, key]));
      setToast({ message: `"${item.title}" added to your ${type === "book" ? "reading" : "watch"}list!`, type: "success" });
    } catch (err) {
      setToast({ message: "Failed to add. Try again.", type: "error" });
    }
  };

  // ── Render grid ───────────────────────────────────────────────────────────
  const renderGrid = (items, type, loading) => {
    if (loading) {
      return (
        <div className="wb-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="wb-empty">
          <span>🎭</span>
          <p>No results found for this genre.</p>
        </div>
      );
    }
    return (
      <div className="wb-grid">
        {items.map(item => (
          <MediaCard
            key={item.id}
            item={item}
            type={type}
            isAdded={addedItems.has(`${type}-${item.id}`) || isAlreadyAdded(item, type)}
            onAdd={handleAdd}
            darkMode={darkMode}
          />
        ))}
      </div>
    );
  };

  // ── No history state ──────────────────────────────────────────────────────
  if (!hasHistory && userMovies !== undefined) {
    return (
      <div className={`wb-page ${darkMode ? "wb-page--dark" : ""}`}>
        <div className="wb-no-history">
          <div className="wb-no-history__icon">🎬</div>
          <h2>Build Your Taste Profile</h2>
          <p>Add some movies, series, or books to your list first. We'll recommend content based on your favorite genres!</p>
          <div className="wb-no-history__steps">
            <div className="wb-no-history__step">
              <span>1</span> Go to Movies, Series, or Books
            </div>
            <div className="wb-no-history__step">
              <span>2</span> Add what you've watched or read
            </div>
            <div className="wb-no-history__step">
              <span>3</span> Come back here for personalized picks!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`wb-page ${darkMode ? "wb-page--dark" : ""}`}>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Hero Header ── */}
      <div className="wb-hero">
        <div className="wb-hero__content">
          <h1 className="wb-hero__title">
            <span className="wb-hero__spark">✨</span>
            Your Personal Picks
          </h1>
          <p className="wb-hero__subtitle">
            Recommendations crafted from your watch & reading history
          </p>
        </div>

        {/* Genre frequency stats */}
        {topGenres.length > 0 && (
          <div className="wb-taste-profile">
            <p className="wb-taste-profile__label">🎯 Your taste profile</p>
            <div className="wb-taste-profile__bars">
              {topGenres.slice(0, 4).map(genre => {
                const maxCount = genreFreq[topGenres[0]] || 1;
                const pct = Math.round((genreFreq[genre] / maxCount) * 100);
                return (
                  <div key={genre} className="wb-taste-bar">
                    <span className="wb-taste-bar__label">{genre}</span>
                    <div className="wb-taste-bar__track">
                      <div className="wb-taste-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="wb-taste-bar__count">{genreFreq[genre]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Genre filter pills ── */}
      {topGenres.length > 0 && (
        <div className="wb-genre-filter">
          <span className="wb-genre-filter__label">Filter by genre:</span>
          <div className="wb-genre-filter__pills">
            {topGenres.map(genre => (
              <GenrePill
                key={genre}
                genre={genre}
                count={genreFreq[genre]}
                active={activeGenre === genre}
                onClick={setActiveGenre}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="wb-tabs">
        {[
          { key: "movies", label: "🎬 Movies", count: movieRecs.length },
          { key: "series", label: "📺 Series", count: seriesRecs.length },
          { key: "books",  label: "📚 Books",  count: bookRecs.length  },
        ].map(tab => (
          <button
            key={tab.key}
            className={`wb-tab ${activeTab === tab.key ? "wb-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && <span className="wb-tab__badge">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="wb-content">
        {activeTab === "movies" && (
          <>
            <SectionHeader
              emoji="🎬"
              title={`${activeGenre} Movies for You`}
              subtitle={`Based on your ${genreFreq[activeGenre] || 0} ${activeGenre} items`}
              count={movieRecs.length}
            />
            {renderGrid(movieRecs, "movie", loadingMovies)}
          </>
        )}

        {activeTab === "series" && (
          <>
            <SectionHeader
              emoji="📺"
              title={`${activeGenre} Series for You`}
              subtitle={`Picked from your ${activeGenre} preference`}
              count={seriesRecs.length}
            />
            {renderGrid(seriesRecs, "series", loadingSeries)}
          </>
        )}

        {activeTab === "books" && (
          <>
            <SectionHeader
              emoji="📚"
              title={`${activeGenre} Books for You`}
              subtitle={`Reading picks matched to your taste`}
              count={bookRecs.length}
            />
            {renderGrid(bookRecs, "book", loadingBooks)}
          </>
        )}
      </div>
    </div>
  );
}