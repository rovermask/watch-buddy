// src/components/books/BookTable.js  
import Table from "react-bootstrap/Table";  
import Card from "react-bootstrap/Card";  
import BookRow from "./BookRow";  
  
export default function BookTable({ books, onDelete, onToggleStatus, onUpdate }) {  
  return (  
    <Card className="shadow-sm">  
      <Card.Body>  
        {books.length === 0 ? (  
          <p className="text-muted text-center mb-0">No books found in this list.</p>  
        ) : (  
          <Table striped bordered hover responsive>  
            <thead>  
              <tr>  
                <th>#</th>  
                <th>Title</th>  
                <th>Author</th>  
                <th>Year</th>  
                <th>Genre</th>  
                <th style={{ textAlign: "center" }}>Actions</th>  
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