import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";
import CreateTicket from "./pages/CreateTicket";
import EditTicket from "./pages/EditTicket";
import ManageTickets from "./pages/ManageTickets";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import MsLoginWrapper from "./configs/MsLoginWrapper";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MsLoginWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute>
              <Layout>
                <MyTickets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-ticket"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateTicket />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-ticket/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditTicket />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-tickets"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageTickets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
