// src/components/admin/tables/BooksTable.js
import React from "react";
import { Table, Button } from "react-bootstrap";
import { useTheme } from "../../../ThemeContext"; // adjust path if needed
import { useOutletContext } from "react-router-dom";


export default function BooksTable() {
  const { books = [], onDelete } = useOutletContext();
    const { darkMode } = useTheme();
  
  return (
    <div className="mt-4">
      <h4>📚 Books</h4>
      <Table striped bordered hover responsive className={darkMode ? "table-dark" : ""}>
        <thead>
          <tr>
            <th style={{width: "60px"}}>#</th>
            <th>Title</th>
            <th style={{width: "200px"}}>Owner</th>
            <th style={{width: "120px", textAlign: "center"}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b, i) => (
            <tr key={b.id}>
              <td>{i + 1}</td>
              <td style={{fontWeight: 600}}>{b.title || b.name || "Untitled"}</td>
              <td>{b.name || b.ownerName || "Unknown"}</td>
              <td style={{textAlign: "center"}}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete("books", b.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {books.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted py-3">No books found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
