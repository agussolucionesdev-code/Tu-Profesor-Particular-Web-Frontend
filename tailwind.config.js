/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial extraída de tu logo
        "brand-blue": "#1c3a56", // Azul marino profundo (Compás y texto base)
        "brand-green": "#589b71", // Verde neuroeducativo (Tilde y "Sosa")
        "brand-dark": "#0f1f2e", // Tono extra oscuro para textos primarios
        "brand-light": "#f4f7f9", // Fondo gris/azulado ultra claro para descansar la vista
      },
    },
  },
  plugins: [],
};
