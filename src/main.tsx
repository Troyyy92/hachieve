import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./lib/i18n"; // Import to initialize i18next

createRoot(document.getElementById("root")!).render(<App />);