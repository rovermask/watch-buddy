// src/components/books/BookTable.js  
import Table from "react-bootstrap/Table";  
import Card from "react-bootstrap/Card";  
import BookRow from "./BookRow";  
import { useTheme } from "../../ThemeContext"; // adjust path if needed

  
export default function BookTable({ books, onDelete, onToggleStatus, onUpdate }) {  
  const { darkMode } = useTheme();

  return (  
    <Card
      className={`shadow-sm ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
    >
      <Card.Body>  
        {books.length === 0 ? (  
          <p className={`text-center mb-0 ${darkMode ? "text-light" : "text-muted"}`}>
            No books found in this list.</p>  
        ) : (  
          <Table striped bordered hover responsive className={darkMode ? "table-dark" : ""}>  
            <thead>  
              <tr>  
                <th>#</th>  
                <th>Title</th>  
                <th>Author</th>  
                <th>Genre</th>  
                <th>Actions</th>  
              </tr>  
            </thead>  
            <tbody>  
              {books.map((book, i) => (  
                <BookRow  
                  key={book.id}  
                  index={i + 1}  
                  book={book}  
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