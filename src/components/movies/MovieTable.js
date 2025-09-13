// src/components/movies/MovieTable.js  
import Table from "react-bootstrap/Table";  
import Card from "react-bootstrap/Card";  
import MovieRow from "./MovieRow";  
  
export default function MovieTable({ movies, onDelete, onToggleStatus, onUpdate }) {  
  return (  
    <Card className="shadow-sm">  
      <Card.Body>  
        {movies.length === 0 ? (  
          <p className="text-muted text-center mb-0">No movies found in this list.</p>  
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
              {movies.map((movie,i) => (  
                <MovieRow  
                  key={movie.id}  
                  index={i+1}  
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