import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import NavBar from "./components/NavBar";
import AddMovie from "./components/movies/AddMovie";
import AddSeries from "./components/series/AddSeries";
import AddBook from "./components/books/AddBook";
import ProtectedRoute from "./ProtectedRoute";
import Signup from "./Signup";
import AdminPage from "./components/admin/AdminPage";
import AdminRoute from "./AdminRoute";
import DashboardRoute from "./DashboardRoute";
import Insights from "./components/admin/Insights";
import UsersTable from "./components/admin/tables/UsersTable";
import MoviesTable from "./components/admin/tables/MoviesTable";
import BooksTable from "./components/admin/tables/BooksTable";
import SeriesTable from "./components/admin/tables/SeriesTable";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      >
        {/* Default dashboard (Insights) */}
        <Route index element={<Insights />} />

        {/* Nested admin pages */}
        <Route path="users_table" element={<UsersTable />} />
        <Route path="movies_table" element={<MoviesTable />} />
        <Route path="series_table" element={<SeriesTable />} />
        <Route path="books_table" element={<BooksTable />} />
      </Route>

      {/* User routes */}
      <Route path="/" element={<DashboardRoute />} />
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <NavBar />
            <AddMovie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/series"
        element={
          <ProtectedRoute>
            <NavBar />
            <AddSeries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute>
            <NavBar />
            <AddBook />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
