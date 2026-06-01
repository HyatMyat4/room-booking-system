import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { BookingsPage } from "./pages/BookingsPage";
import { RoomsPage } from "./pages/RoomsPage";
import { UsersPage } from "./pages/UsersPage";
import { SummaryPage } from "./pages/SummaryPage";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/bookings" replace />;
  }
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? <Navigate to="/bookings" replace /> : <LoginPage />
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner"]}>
              <SummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={currentUser ? "/bookings" : "/login"} replace />
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
