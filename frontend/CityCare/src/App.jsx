import React from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CitizenDashboard from "./Pages/CitizenDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import VolunteerDashboard from "./Pages/volunteerDashboard";
import ReportIssues from "./Pages/ReportIssue";
import CityConnectHomepage from "./Pages/Homepage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CityConnectHomepage />} />
       <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}

          <Route
            path="/citizen"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteer"
            element={
              <ProtectedRoute roles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <ReportIssues />
              </ProtectedRoute>
            }
          />
      </Routes>
    </Router>
  );
}

export default App;
