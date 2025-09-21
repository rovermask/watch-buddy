// src/components/series/SeriesTable.js  
import Table from "react-bootstrap/Table";  
import Card from "react-bootstrap/Card";  
import SeriesRow from "./SeriesRow";  
import { useTheme } from "../../ThemeContext"; // adjust path if needed

  
export default function SeriesTable({ series, onDelete, onToggleStatus, onUpdate }) {  
  const { darkMode } = useTheme();
  return (  
    <Card
      className={`shadow-sm ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
    > 
      <Card.Body>  
        {series.length === 0 ? (  
          <p className={`text-center mb-0 ${darkMode ? "text-light" : "text-muted"}`}>
            No series found in this list.</p>  
        ) : (  
          <Table striped bordered hover responsive
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
              {series.map((seriesObj, i) => (  
                <SeriesRow  
                  key={seriesObj.id}  
                  index={i + 1}  
                  series={seriesObj} // ✅ fixed prop name  
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