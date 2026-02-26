import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Tracker from "./Tracker";

function isLoggedIn() {
  return Boolean(localStorage.getItem("it_username"));
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Tracker />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={isLoggedIn() ? "/" : "/login"} replace />} />
    </Routes>
  );
}