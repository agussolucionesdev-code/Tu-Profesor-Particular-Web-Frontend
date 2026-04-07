import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard"; // <--- IMPORTAMOS EL DASHBOARD

// ============================================================================
// COMPONENTE: Landing Pública (Temporal)
// ============================================================================
const PublicLanding = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 text-center">
    <div>
      <h1 className="text-6xl font-extrabold text-brand-blue tracking-tighter mb-4">
        Tu Profesor Particular
      </h1>
      <p className="text-2xl text-brand-green font-semibold">
        Plataforma Pública (Neuroeducación Viva) 🚀
      </p>
      <p className="text-gray-500 mt-8 text-sm">
        Intenta acceder a /admin/login para ver la magia.
      </p>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL: Enrutador
// ============================================================================
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLanding />} />

        <Route path="/admin/login" element={<Login />} />

        {/* LA NUEVA RUTA DE TU CUARTEL GENERAL */}
        <Route path="/admin/dashboard" element={<Dashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
