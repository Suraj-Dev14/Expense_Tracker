import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("Token");
  return token ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
