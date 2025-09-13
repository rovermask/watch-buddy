// src/components/books/BookRow.js  
import { useState } from "react";  
import Button from "react-bootstrap/Button";  
import Form from "react-bootstrap/Form";  
import { FaCheckCircle, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";  
  
export default function BookRow({ index, book, onDelete, onToggleStatus, onUpdate }) {  
  const [editMode, setEditMode] = useState(false);  
  const [editData, setEditData] = useState({  
    title: book.title,  
    author: book.author,  
    year: book.year,  
    genre: book.genre,  
  });  
  
  const saveEdit = () => {  
    onUpdate(book.id, editData);  
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
          book.title  
        )}  
      </td>  
      <td>  
        {editMode ? (  
          <Form.Control  
            value={editData.author}  
            onChange={(e) => setEditData({ ...editData, author: e.target.value })}  
          />  
        ) : (  
          book.author  
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
          book.year  
        )}  
      </td>  
      <td>  
        {editMode ? (  
          <Form.Control  
            value={editData.genre}  
            onChange={(e) => setEditData({ ...editData, genre: e.target.value })}  
          />  
        ) : (  
          book.genre  
        )}  
      </td>  
      <td style={{ textAlign: "center", display: "flex", justifyContent: "space-evenly" }}>  
        {editMode ? (  
          <>  
            <Button variant="success" size="sm" onClick={saveEdit}>  
              <FaSave />  
            </Button>  
            <Button  
              variant="secondary"  
              size="sm"  
              onClick={() => {  
                setEditData({  
                  title: book.title,  
                  author: book.author,  
                  year: book.year,  
                  genre: book.genre,  
                });  
                setEditMode(false);  
              }}  
            >  
              <FaTimes />  
            </Button>  
          </>  
        ) : (  
          <>  
            {book.status === "To Read" && (  
              <Button  
                variant="success"  
                size="sm"  
                onClick={() => onToggleStatus(book.id, book.status)}  
              >  
                <FaCheckCircle />  
              </Button>  
            )}  
            <Button variant="warning" size="sm" onClick={() => setEditMode(true)}>  
              <FaEdit />  
            </Button>  
            <Button variant="danger" size="sm" onClick={() => onDelete(book.id)}>  
              <FaTrashAlt />  
            </Button>  
          </>  
        )}  
      </td>  
    </tr>  
  );  
}  