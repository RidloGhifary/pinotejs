import { createPinote } from "pinote";
import "pinote/style.css";

const pinote = createPinote({
  storageKey: "vanilla-demo",
});

pinote.mount();
