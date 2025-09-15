import { useState } from "react";  
import Button from "react-bootstrap/Button";  
import Form from "react-bootstrap/Form";  
import { FaCheckCircle, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";  
  
export default function SeriesRow({ index, series, onDelete, onToggleStatus, onUpdate }) {  
  const [editMode, setEditMode] = useState(false);  
  const [editData, setEditData] = useState({  
    title: series.title,  
    year: series.year,  
    genre: series.genre,  
  });  
  
  const saveEdit = () => {  
    onUpdate(series.id, editData);  
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
          series.title  
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
          series.year  
        )}  
      </td>  
      <td>  
        {editMode ? (  
          <Form.Control  
            value={editData.genre}  
            onChange={(e) => setEditData({ ...editData, genre: e.target.value })}  
          />  
        ) : (  
          series.genre  
        )}  
      </td>  
      <td style={{ textAlign: "center"}}>  
        <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", gap: "0.5rem"}}>

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
            {series.status === "Watchlist" && (  
              <Button  
                variant="success"  
                size="sm"  
                onClick={() => onToggleStatus(series.id, series.status)}  
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
            <Button variant="danger" size="sm" onClick={() => onDelete(series.id)}>  
              <FaTrashAlt />  
            </Button>  
          </>  
        )}  
        </div>
      </td>  
    </tr>  
  );  
}  