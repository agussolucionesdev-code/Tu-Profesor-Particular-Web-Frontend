# Tu Profesor Particular Frontend

React and Vite frontend for the Tu Profesor Particular LMS.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- lucide-react

## Commands

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
```

## UI Principles

- Use progressive disclosure to reduce cognitive load.
- Keep motion purposeful and smooth.
- Preserve the brand palette through Tailwind tokens.
- Keep admin workflows clear, accessible, and keyboard-friendly.
- Use Spanish for product-facing copy when targeting the learner/admin audience.
- Keep code, comments, and technical documentation in English.

## API Contract

The frontend sends requests to `/api`. Vite proxies that path to the backend during local development.

Authentication currently stores the admin JWT in browser storage for the local admin flow. A production-ready session model should move toward an HttpOnly cookie strategy once the backend/frontend deployment topology is finalized.
