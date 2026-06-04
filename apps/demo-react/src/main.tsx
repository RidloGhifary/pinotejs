import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PinoteProvider } from "pinote/react";
import "pinote/style.css";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PinoteProvider storageKey="react-comment-library-demo">
      <App />
    </PinoteProvider>
  </StrictMode>,
);
