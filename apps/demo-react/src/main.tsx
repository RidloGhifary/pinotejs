import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PinoteProvider } from "pinotejs/react";
import "pinotejs/style.css";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PinoteProvider storageKey="pinote-demo-react">
      <App />
    </PinoteProvider>
  </StrictMode>,
);
