import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  BookOpen,
  Layers,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  X,
  AlertTriangle,
  Edit2,
  Trash2,
} from "lucide-react";

import { authService } from "../services/auth.service";
import {
  subjectApiService,
  type SubjectResponse,
} from "../services/subject.service";

import logoCompletoTransparente from "../assets/images/logo-completo-tu-profesor-transparent.png";
import perfilImg from "../assets/images/Perfil.png";

// ============================================================================
// ANIMATIONS: Framer Motion Configuration
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
  // STATE MANAGEMENT: UI & Data
  // ============================================================================
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States: Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>("");

  // States: Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [subjectToEdit, setSubjectToEdit] = useState<SubjectResponse | null>(
    null,
  );
  const [editSubjectName, setEditSubjectName] = useState<string>("");

  // States: Delete Alert
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [subjectToDelete, setSubjectToDelete] =
    useState<SubjectResponse | null>(null);

  // ============================================================================
  // LIFECYCLE: Component Mount & Security Verification
  // ============================================================================
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    fetchSubjects();
  }, [navigate]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await subjectApiService.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error: unknown) {
      if (error instanceof Error)
        console.error("Data Fetch Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  // ============================================================================
  // ACTIONS: CRUD Operations
  // ============================================================================

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newSubjectName.trim()) return;

    try {
      const response = await subjectApiService.createSubject(
        newSubjectName.trim(),
      );
      if (response.success && response.data) {
        const createdSubject = response.data;
        setSubjects((prev) => [createdSubject, ...prev]);
        setIsCreateModalOpen(false);
        setNewSubjectName("");
      }
    } catch (error: unknown) {
      if (error instanceof Error) setErrorMsg(error.message);
      else setErrorMsg("Error inesperado de red.");
    }
  };

  const openEditModal = (subject: SubjectResponse) => {
    setSubjectToEdit(subject);
    setEditSubjectName(subject.name);
    setIsEditModalOpen(true);
  };

  const handleEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!subjectToEdit || !editSubjectName.trim()) return;

    try {
      const response = await subjectApiService.updateSubject(
        subjectToEdit.id,
        editSubjectName.trim(),
      );
      if (response.success && response.data) {
        const updatedSubject = response.data;
        setSubjects((prev) =>
          prev.map((s) => (s.id === subjectToEdit.id ? updatedSubject : s)),
        );
        setIsEditModalOpen(false);
        setSubjectToEdit(null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) setErrorMsg(error.message);
      else setErrorMsg("Error inesperado de red.");
    }
  };

  const openDeleteAlert = (subject: SubjectResponse) => {
    setSubjectToDelete(subject);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    setErrorMsg(null);

    try {
      const response = await subjectApiService.deleteSubject(
        subjectToDelete.id,
      );
      if (response.success) {
        setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id));
        setIsDeleteAlertOpen(false);
        setSubjectToDelete(null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) setErrorMsg(error.message);
      else setErrorMsg("Error inesperado de red.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex relative">
      {/* SIDEBAR */}
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
              Panel de Control
            </h2>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Gestiona tu contenido académico
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                setIsCreateModalOpen(true);
                setErrorMsg(null);
              }}
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
                <p className="text-3xl font-bold text-brand-dark">
                  {subjects.length}
                </p>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="text-center text-gray-500 mt-20">
              Cargando datos académicos...
            </div>
          ) : subjects.length === 0 ? (
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <BookOpen
                  className="w-10 h-10 text-gray-400"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">
                Aún no hay materias creadas
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Comienza a construir tu plataforma creando tu primera materia.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-brand-blue hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md mx-auto flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Crear Primera Materia
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 group relative"
                  style={{ borderLeftColor: subject.colorHex }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* ACTIONS: Shown on hover */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="p-1.5 text-gray-400 hover:text-brand-blue bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"
                      title="Editar Materia"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteAlert(subject)}
                      className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"
                      title="Eliminar Materia"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-brand-dark mb-1 pr-14">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {subject._count?.modules || 0} Módulos Activos
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* =====================================================================
          MODALS & ALERTS
          ===================================================================== */}
      <AnimatePresence>
        {/* MODAL: CREAR MATERIA */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSubject} className="p-6">
                {errorMsg && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}
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
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-blue hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: EDITAR MATERIA */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="bg-brand-light px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-brand-green" />
                  Editar Materia
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubject} className="p-6">
                {errorMsg && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-brand-dark mb-2 ml-1">
                    Nuevo Nombre
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editSubjectName}
                    onChange={(e) => setEditSubjectName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all font-medium text-brand-dark"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-blue hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ALERTA: ELIMINAR MATERIA */}
        {isDeleteAlertOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAlertOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden text-center p-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">
                ¿Eliminar materia?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Estás a punto de eliminar{" "}
                <strong>{subjectToDelete?.name}</strong>. Esta acción borrará
                también todos sus módulos y bloques de contenido. No se puede
                deshacer.
              </p>
              {errorMsg && (
                <div className="mb-4 text-red-500 text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteAlertOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteSubject}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
