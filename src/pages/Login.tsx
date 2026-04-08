import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Mail, Lock, LogIn, AlertTriangle, LoaderCircle } from "lucide-react";
import { authService } from "../services/auth.service";
// IMPORTAMOS TU LOGO OFICIAL
import logoCompletoTransparente from "../assets/images/logo-completo-tu-profesor-transparent.png";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.1 },
  },
};

const errorVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 200, damping: 10 },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "El formato de correo no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate("/admin/dashboard");
    } catch (error: unknown) {
      let errorMessage = "Credenciales inválidas. Intenta de nuevo.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String((error as { message: string }).message);
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 selection:bg-brand-green selection:text-white">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#21425e 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <motion.div
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(33,66,94,0.15)] p-10 relative z-10 border border-gray-100"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ENCABEZADO CON TU LOGO */}
        <div className="text-center mb-10">
          <motion.img
            src={logoCompletoTransparente}
            alt="Logo Tu Profesor Particular"
            className="w-11/12 mx-auto h-auto drop-shadow-sm mb-6"
            whileHover={{ scale: 1.02 }}
          />
          <h2 className="text-2xl font-extrabold text-brand-blue tracking-tight">
            Acceso Privado
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {errors.general && (
            <motion.div
              className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-8 text-center border border-red-200 flex items-center justify-center gap-2 font-medium"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={errorVariants}
            >
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              {errors.general}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-7">
          <div className="group relative">
            <label
              className="block text-sm font-semibold text-brand-blue mb-2 ml-1"
              htmlFor="email"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-green transition-colors" />
              <input
                id="email"
                type="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-brand-dark outline-none transition-all duration-200 font-medium placeholder:text-gray-300 placeholder:font-normal
                  ${errors.email ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100" : "border-gray-200 bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green"}
                  ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:border-gray-300"}
                `}
                placeholder="admin@tuprofesor.com"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 ml-2 font-medium block">
                {errors.email}
              </span>
            )}
          </div>

          <div className="group relative">
            <label
              className="block text-sm font-semibold text-brand-blue mb-2 ml-1"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-green transition-colors" />
              <input
                id="password"
                type="password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-brand-dark outline-none transition-all duration-200 font-medium placeholder:text-gray-300 placeholder:font-normal
                   ${errors.password ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100" : "border-gray-200 bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green"}
                   ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:border-gray-300"}
                `}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 ml-2 font-medium block">
                {errors.password}
              </span>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue hover:bg-brand-dark text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex justify-center items-center gap-3 text-lg shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoaderCircle className="w-6 h-6 animate-spin text-brand-green" />
                  Autenticando...
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LogIn
                    className="w-6 h-6 text-brand-green"
                    strokeWidth={2.5}
                  />
                  Ingresar al Panel
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-12 font-medium tracking-tight">
          Protección criptográfica avanzada activa © 2026
        </p>
      </motion.div>
    </div>
  );
};
