import { BrowserRouter as Router, Routes, Route } from "react-router-dom";  
import Login from "./Login";  
import NavBar from "./components/NavBar";  
import DashBoard from "./components/DashBoard";  
import AddMovie from "./components/movies/AddMovie";  
import AddSeries from "./components/series/AddSeries";  
import AddBook from "./components/books/AddBook";  
import ProtectedRoute from "./ProtectedRoute";  
import Signup from "./Signup";
  
function App() {  
  return (  
    <Router>  
      <Routes>  
        {/* Public route */}  
        <Route path="/login" element={<Login />} />  
        <Route path="/signup" element={<Signup />} />  
  
        {/* Protected routes - wrapped in ProtectedRoute */}  
        <Route  
          path="/"  
          element={  
            <ProtectedRoute>  
              <NavBar />  
              <DashBoard />  
            </ProtectedRoute>  
          }  
        />  
        <Route  
          path="/movies"  
          element={  
            <ProtectedRoute>  
              <NavBar />  
              <AddMovie />  
            </ProtectedRoute>  
          }  
        />  
        <Route  
          path="/series"  
          element={  
            <ProtectedRoute>  
              <NavBar />  
              <AddSeries />  
            </ProtectedRoute>  
          }  
        />  
        <Route  
          path="/books"  
          element={  
            <ProtectedRoute>  
              <NavBar />  
              <AddBook />  
            </ProtectedRoute>  
          }  
        />  
      </Routes>  
    </Router>  
  );  
}  
  
export default App;  