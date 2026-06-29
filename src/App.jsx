import { Routes, Route, Navigate } from "react-router-dom";
import Reportar from "./pages/Reportar.jsx";
import Login from "./pages/Login.jsx";
import Painel from "./pages/Painel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Reportar />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/painel"
        element={
          <ProtectedRoute>
            <Painel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
