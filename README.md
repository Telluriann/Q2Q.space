# Three.js Project

Minimal Three.js setup with **Vite** and **TypeScript**.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — you should see a rotating cube.

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `npm run dev`    | Dev server with HMR      |
| `npm run build`  | Production build to `dist/` |
| `npm run preview`| Preview production build |

## Structure

- `src/main.ts` — Entry point, starts the render loop
- `src/scene.ts` — Scene, camera, renderer, and demo mesh
- `src/main.css` — Full-viewport canvas styles

Edit `src/scene.ts` to add meshes, lights, and controls.
