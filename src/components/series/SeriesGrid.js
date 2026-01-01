import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useTheme } from "../../ThemeContext";
import { FaCheckCircle, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";  

export default function SeriesGrid({ series, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();

  if (series.length === 0) {
    return <p className="text-center">No series found.</p>;
  }

  return (
    <Row className="g-4">
      {series.map((show) => (
        <Col key={show.id} xs={6} sm={4} md={3} lg={2}>
          <Card
            className={`h-100 shadow-sm ${
              darkMode ? "bg-dark text-light" : ""
            }`}
          >
            <Card.Img
              variant="top"
              src={
                show.cover ||
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png"
              }
              style={{ height: "280px", objectFit: "cover" }}
            />

            <Card.Body className="p-2">
              <Card.Title
                className="small text-center"
                title={show.title}
              >
                {show.title} {show.year}
              </Card.Title>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between p-2">
              <Button
                size="sm"
                variant="outline-success"
                onClick={() => onToggleStatus(show.id,show.status)}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => onDelete(show.id)}
              >
                <FaTrashAlt />
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
