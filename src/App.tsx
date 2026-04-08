import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

const PublicLanding = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 text-center">
    <div>
      <h1 className="mb-4 text-5xl font-extrabold text-brand-blue md:text-6xl">
        Tu Profesor Particular
      </h1>
      <p className="text-2xl font-semibold text-brand-green">
        Plataforma Pública de Neuroeducación Viva
      </p>
      <p className="mt-8 text-sm text-gray-500">
        Accedé a /admin/login para ingresar al panel privado.
      </p>
    </div>
  </div>
);

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
