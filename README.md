# Pinote

Pinote is a framework-agnostic JavaScript library for adding Figma-style feedback and annotations directly on top of any website or web app.

It works with React, Next.js, Vue, Nuxt, Angular, Svelte, SvelteKit, Solid, Astro, Laravel, and plain HTML - as long as it runs in the browser.

## Key Features

- **Comment Mode**: Enable a specialized mode to capture UI elements.
- **Intelligent Anchoring**: Pins attach to DOM elements using stable selectors and relative percentage offsets. Pins move automatically when layout reflows or window resizes.
- **Local Persistence**: Comments are stored in `localStorage` scoped by projectId.
- **Cross-Page Support**: Comments are automatically filtered by the current URL pathname.
- **JSON Export**: Download all feedback for offline sharing.
- **Framework Agnostic**: Pure Vanilla JS engine that works anywhere.
- **React Wrapper**: First-class support for React and Next.js.

## Installation

```bash
# Using pnpm
pnpm add pinote

# Using npm
npm install pinote
```

## Quick Start (Vanilla JS)

```javascript
import { createPinote } from "pinote";
import "pinote/style.css";

const pinote = createPinote({
  storageKey: "my-project",
});

pinote.mount();
```

## Quick Start (React)

```tsx
import { PinoteProvider, PinoteToolbar, PinoteLayer } from "pinote/react";
import "pinote/style.css";

function App() {
  return (
    <PinoteProvider storageKey="my-project">
      <PinoteToolbar />
      <YourAppContent />
      <PinoteLayer />
    </PinoteProvider>
  );
}
```

## Development

```bash
pnpm install
pnpm build # Builds the package
pnpm dev:react   # Runs the React demo
pnpm dev:vanilla # Runs the Vanilla demo
```

## Local Testing

To test the library in an external project before publishing to npm:

1. **Pack the package**:
   ```bash
   pnpm pack
   ```
2. **Install in your project**:
   Navigate to your external project and install the generated `.tgz` file:
   ```bash
   pnpm add /path/to/pinote/packages/pinote/pinote-0.1.0.tgz
   ```

## Known Limitations (MVP)

- **Local Only**: Data is stored in the browser. No cloud sync or real-time collaboration.
- **Browser-Only**: Does not work in non-DOM environments (SSR, Node.js).
- **Canvas/Shadow DOM**: May not work perfectly with complex Canvas UIs or closed Shadow DOMs.

## License

MIT
