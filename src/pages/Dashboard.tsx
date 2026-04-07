import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// IMPORTANTE: Agregamos 'type Variants' para solucionar el error ts(2322)
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  BookOpen,
  Layers,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import { authService } from "../services/auth.service";

import logoCompletoTransparente from "../assets/images/logo-completo-tu-profesor-transparent.png";
import perfilImg from "../assets/images/Perfil.png";

// ============================================================================
// ANIMATIONS: Tipado estricto con ': Variants'
// ============================================================================
const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const Dashboard = () => {
  const navigate = useNavigate();

  // ============================================================================
  // ESTADO: Control del Modal de Nueva Materia
  // ============================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creando materia:", newSubjectName);
    setIsModalOpen(false);
    setNewSubjectName("");
  };

  return (
    <div className="min-h-screen bg-brand-light flex relative">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-brand-blue text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-white/10">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center mb-2">
            <img
              src={logoCompletoTransparente}
              alt="Logo Oficial"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-brand-green text-sm font-semibold text-center mt-3 uppercase tracking-wider">
            Panel de Administración
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl font-medium transition-colors shadow-inner"
          >
            <LayoutDashboard className="w-5 h-5 text-brand-green" />
            Inicio
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Materias
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
          >
            <Layers className="w-5 h-5" />
            Bloques de Contenido
          </a>
          {/* Aquí agregamos el botón de Configuración para usar el ícono 'Settings' */}
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            Configuración
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white px-10 py-5 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Gestiona tu contenido educativo
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-green hover:bg-[#48825e] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Nueva Materia
            </button>
            <div className="w-12 h-12 rounded-full border-2 border-brand-green overflow-hidden shadow-sm bg-brand-light">
              <img
                src={perfilImg}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="p-10">
          {/* Tarjetas de Estadísticas */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total de Materias
                </p>
                <p className="text-3xl font-bold text-brand-dark">0</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-green-50 text-brand-green rounded-xl flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Módulos Activos
                </p>
                <p className="text-3xl font-bold text-brand-dark">0</p>
              </div>
            </div>
          </motion.div>

          {/* Estado Vacío */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <BookOpen className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">
              Aún no hay materias creadas
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Comienza a construir tu plataforma creando tu primera materia (ej.
              Análisis Matemático, Química).
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-blue hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md mx-auto flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Crear Primera Materia
            </button>
          </motion.div>
        </div>
      </main>

      {/* =====================================================================
          MODAL DE CREACIÓN (Pop-up)
          ===================================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo desenfocado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />

            {/* Contenedor del formulario */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="bg-brand-light px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-green" />
                  Nueva Materia
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubject} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-brand-dark mb-2 ml-1">
                    Nombre de la Materia
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Ej: Análisis Matemático I"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium text-brand-dark"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-blue hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    Crear Materia
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
