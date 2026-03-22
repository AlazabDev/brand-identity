import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

window.addEventListener("error", (e) => {
  console.error("Global error:", e.error?.message || e.message, e.error?.stack);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled rejection:", e.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
