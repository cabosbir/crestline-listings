import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
// Preserve the visible homepage HTML instead of discarding it on startup.
// Other routes still use the unchanged, empty SPA shell.
if (root.dataset.prerendered === "homepage") {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
