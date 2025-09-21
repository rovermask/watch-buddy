// src/components/admin/tables/SeriesTable.js
import React from "react";
import { Table, Button } from "react-bootstrap";
import { useTheme } from "../../../ThemeContext"; // adjust path if needed
import { useOutletContext } from "react-router-dom";


export default function SeriesTable() {
    const { darkMode } = useTheme();
    const { series = [], onDelete } = useOutletContext();
  
  return (
    <div className="mt-4">
      <h4>📺 Series</h4>
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
          {series.map((s, i) => (
            <tr key={s.id}>
              <td>{i + 1}</td>
              <td style={{fontWeight: 600}}>{s.title || s.name || "Untitled"}</td>
              <td>{s.name || s.ownerName || "Unknown"}</td>
              <td style={{textAlign: "center"}}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete("series", s.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {series.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted py-3">No series found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
