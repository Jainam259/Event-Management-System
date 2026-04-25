// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ── Public ────────────────────────────────────────────────
import Login       from "./pages/Login";
import Signup      from "./pages/Signup";
import Home        from "./pages/Home";
import EventDetail from "./pages/EventDetail";

// ── User ──────────────────────────────────────────────────
import Dashboard    from "./pages/Dashboard";
import CreateEvent  from "./pages/CreateEvent";
import ManageEvents from "./pages/ManageEvents";
import Participants from "./pages/Participants";
import Analytics    from "./pages/Analytics";

// ── Admin ─────────────────────────────────────────────────
import AdminLogin        from "./pages/Admin/AdminLogin";
import AdminDashboard    from "./pages/Admin/Dashboard";
import AdminManageEvents from "./pages/Admin/ManageEvents";
import AdminParticipants from "./pages/Admin/Participants";   // ⭐
import AdminAnalytics    from "./pages/Admin/Analytics";
import AdminRoute        from "./pages/Admin/AdminRoute";
import EmailLogs from "./pages/Admin/EmailLogs";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"       element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home"   element={<Home />} />

      {/* User Protected */}
      <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/create-event"  element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
      <Route path="/manage-events" element={<PrivateRoute><ManageEvents /></PrivateRoute>} />
      <Route path="/events/:id"    element={<PrivateRoute><EventDetail /></PrivateRoute>} />
      <Route path="/participants"  element={<PrivateRoute><Participants /></PrivateRoute>} />
      <Route path="/analytics"     element={<PrivateRoute><Analytics /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/login"        element={<AdminLogin />} />
      <Route path="/admin/dashboard"    element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/events"       element={<AdminRoute><AdminManageEvents /></AdminRoute>} />
      <Route path="/admin/participants" element={<AdminRoute><AdminParticipants /></AdminRoute>} />  {/* ⭐ */}
      <Route path="/admin/analytics"    element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/email-logs" element={<AdminRoute><EmailLogs /></AdminRoute>} />
      <Route path="/admin"              element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;