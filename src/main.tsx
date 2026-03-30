
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { setupMockInterceptor } from "./mocks";

  // Enable mock API in development (always on for now until real backend exists)
  setupMockInterceptor();

  createRoot(document.getElementById("root")!).render(<App />);