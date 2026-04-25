import React from "react";
import { Navigate } from "react-router-dom";

/**
 * AdminRoute — protects all /admin/* routes
 * Checks localStorage for adminToken.
 * If not found, redirects to /admin/login.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;