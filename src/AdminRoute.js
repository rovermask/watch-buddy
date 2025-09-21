// src/AdminRoute.js
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
      setLoadingRole(false);
    };
    fetchRole();
  }, [user]);

  if (loading || loadingRole) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/" />;

  return children;
}
