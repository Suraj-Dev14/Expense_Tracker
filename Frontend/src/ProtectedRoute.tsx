import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const expenseFlowToken = localStorage.getItem("expenseFlowToken");
  return expenseFlowToken ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
