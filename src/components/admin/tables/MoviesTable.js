// src/components/admin/tables/MoviesTable.js
import React from "react";
import { Table, Button } from "react-bootstrap";
import { useTheme } from "../../../ThemeContext"; // adjust path if needed
import { useOutletContext } from "react-router-dom";


export default function MoviesTable() {
  const { movies = [], onDelete } = useOutletContext();
    const { darkMode } = useTheme();
  
  return (
    <div className="mt-4">
      <h4>🎬 Movies</h4>
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
          {movies.map((m, i) => (
            <tr key={m.id}>
              <td>{i + 1}</td>
              <td style={{fontWeight: 600}}>{m.title || m.name || "Untitled"}</td>
              <td>{m.name || m.ownerName || "Unknown"}</td>
              <td style={{textAlign: "center"}}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete("movies", m.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {movies.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted py-3">No movies found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
