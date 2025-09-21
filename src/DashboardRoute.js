// src/DashboardRoute.js
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import NavBar from "./components/NavBar";
import DashBoard from "./components/DashBoard";

export default function DashboardRoute() {
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

  // 🔑 If admin → redirect to admin panel
  if (role === "admin") return <Navigate to="/admin" />;

  // Normal user → show dashboard
  return (
    <>
      <NavBar />
      <DashBoard />
    </>
  );
}
