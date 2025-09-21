// src/components/movies/MovieRow.js  
import { useState } from "react";  
import Button from "react-bootstrap/Button";  
import Form from "react-bootstrap/Form";  
import { FaCheckCircle, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";  
  
export default function MovieRow({ index, movie, onDelete, onToggleStatus, onUpdate }) {  
  const [editMode, setEditMode] = useState(false);  
  const [editData, setEditData] = useState({  
    title: movie.title,  
    year: movie.year,  
    genre: movie.genre,  
  });  
  
  const saveEdit = () => {  
    onUpdate(movie.id, editData);  
    setEditMode(false);  
  };  
  
  return (  
    <tr>  
      <td>{index}</td>  
      <td>  
        {editMode ? (  
          <Form.Control  
            value={editData.title}  
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}  
          />  
        ) : (  
          movie.title  
        )}  
      </td>  
      <td>  
        {editMode ? (  
          <Form.Control  
            type="number"  
            value={editData.year}  
            onChange={(e) => setEditData({ ...editData, year: e.target.value })}  
          />  
        ) : (  
          movie.year  
        )}  
      </td>  
      <td>  
        {editMode ? (  
          <Form.Control  
            value={editData.genre}  
            onChange={(e) => setEditData({ ...editData, genre: e.target.value })}  
          />  
        ) : (  
          movie.genre  
        )}  
      </td>  
      <td style={{ textAlign: "center" }}>
        <div style={{display: "flex", justifyContent: "space-around", gap: "0.5rem", alignItems: "center"}}>
          {editMode ? (  
            <>  
              <Button variant="success" size="sm" onClick={saveEdit} className="me-1">  
                <FaSave />  
              </Button>  
              <Button variant="secondary" size="sm" onClick={() => setEditMode(false)}>  
                <FaTimes />  
              </Button>  
            </>  
          ) : (  
            <>  
              {movie.status === "Watchlist" && (  
                <Button  
                  variant="success"  
                  size="sm"  
                  onClick={() => onToggleStatus(movie.id, movie.status)}  
                  className="me-1"  
                >  
                  <FaCheckCircle />  
                </Button>  
              )}  
              <Button  
                variant="warning"  
                size="sm"  
                onClick={() => setEditMode(true)}  
                className="me-1"  
              >  
                <FaEdit />  
              </Button>  
              <Button variant="danger" size="sm" onClick={() => onDelete(movie.id)}>  
                <FaTrashAlt />  
              </Button>  
            </>  
          )}  
        </div>  
      </td>  
    </tr>  
  );  
}  