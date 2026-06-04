import { createPinote } from "pinotejs";
import "pinotejs/style.css";

const feedbackLayer = createPinote({
  storageKey: "vanilla-demo",
});

feedbackLayer.mount();
