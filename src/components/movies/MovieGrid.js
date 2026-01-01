import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useTheme } from "../../ThemeContext";

export default function MovieGrid({ movies, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();

  if (movies.length === 0) {
    return <p className="text-center">No movies found.</p>;
  }

  return (
    <Row className="g-4">
      {movies.map((movie) => (
        <Col key={movie.id} xs={6} sm={4} md={3} lg={2}>
          <Card
            className={`h-100 shadow-sm ${
              darkMode ? "bg-dark text-light" : ""
            }`}
          >
            <Card.Img
              variant="top"
              src={
                movie.poster ||
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png"
              }
              style={{ height: "280px", objectFit: "cover" }}
            />

            <Card.Body className="p-2">
              <Card.Title
                className="small text-center"
                title={movie.title}
              >
                {movie.title} {movie.year}
              </Card.Title>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between p-2">
              <Button
                size="sm"
                variant="outline-success"
                onClick={() => onToggleStatus(movie.id,movie.status)}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => onDelete(movie.id)}
              >
                🗑
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
