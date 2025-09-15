// src/components/movies/MovieTable.js
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import MovieRow from "./MovieRow";
import { useTheme } from "../../ThemeContext"; // adjust path if needed

export default function MovieTable({ movies, onDelete, onToggleStatus, onUpdate }) {
  const { darkMode } = useTheme();

  return (
    <Card
      className={`shadow-sm ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
    >
      <Card.Body>
        {movies.length === 0 ? (
          <p className={`text-center mb-0 ${darkMode ? "text-light" : "text-muted"}`}>
            No movies found in this list.
          </p>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className={darkMode ? "table-dark" : ""}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Year</th>
                <th>Genre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie, i) => (
                <MovieRow
                  key={movie.id}
                  index={i + 1}
                  movie={movie}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onUpdate={onUpdate}
                />
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
