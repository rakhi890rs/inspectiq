import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Buildings from "./pages/Buildings.jsx";
import BuildingDetails from "./pages/BuildingDetails.jsx";
import Assets from "./pages/Assets.jsx";
import AssetDetails from "./pages/AssetDetails.jsx";
import SafetyAudits from "./pages/SafetyAudits.jsx";
import AuditDetails from "./pages/AuditDetails.jsx";
import Certificates from "./pages/Certificates.jsx";
import ComingSoon from "./components/ui/ComingSoon.jsx";
import { ROLES } from "./context/AuthContext.jsx";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Private */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/buildings/:id" element={<BuildingDetails />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/:id" element={<AssetDetails />} />
        <Route path="/audits" element={<SafetyAudits />} />
        <Route path="/audits/:id" element={<AuditDetails />} />
        <Route path="/calendar" element={<ComingSoon title="Inspection Calendar" />} />
        <Route path="/noc-applications" element={<ComingSoon title="NOC Applications" />} />
        <Route path="/documents" element={<ComingSoon title="Documents" />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/reports" element={<ComingSoon title="Reports" />} />
        <Route path="/analytics" element={<ComingSoon title="Analytics" />} />
        <Route path="/notifications" element={<ComingSoon title="Notifications" />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
              <ComingSoon title="User Management" />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<ComingSoon title="Settings" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;