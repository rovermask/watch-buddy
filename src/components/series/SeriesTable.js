// src/components/series/SeriesTable.js  
import Table from "react-bootstrap/Table";  
import Card from "react-bootstrap/Card";  
import SeriesRow from "./SeriesRow";  
  
export default function SeriesTable({ series, onDelete, onToggleStatus, onUpdate }) {  
  return (  
    <Card className="shadow-sm">  
      <Card.Body>  
        {series.length === 0 ? (  
          <p className="text-muted text-center mb-0">No series found in this list.</p>  
        ) : (  
          <Table striped bordered hover responsive>  
            <thead>  
              <tr>  
                <th>#</th>  
                <th>Title</th>  
                <th>Year</th>  
                <th>Genre</th>  
                <th style={{ textAlign: "center" }}>Actions</th>  
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