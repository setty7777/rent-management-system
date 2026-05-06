import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // ❌ No token → redirect
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Token exists → allow access
  return children;
};

export default ProtectedRoute;