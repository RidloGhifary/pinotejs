# Pinote

A lightweight JavaScript feedback layer for adding Figma-style comments to any website.

Pinote allows you to add a floating comment layer on top of any web application. Users can enable comment mode, click on UI elements, and leave localized feedback that stays anchored even if the layout reflows or the window is resized.

- **Framework Agnostic**: Pure Vanilla JS engine that works anywhere.
- **First-class React Support**: Includes components and hooks for React and Next.js.
- **Local by Default**: Uses `localStorage` and JSON export without requiring a server.

## Features

- **Precise Targeting**: Comments attach to DOM elements using stable selectors and relative percentage offsets.
- **Dynamic Anchoring**: Pins follow moved or resized elements automatically.
- **Local Persistence**: Comments are stored in the browser, scoped by project ID.
- **Cross-Page Support**: Comments are automatically separated by URL pathname.
- **JSON Export**: Download all feedback for sharing with developers or designers.
- **Lightweight**: Minimal footprint and easy to integrate.

## Installation

```bash
# Using npm
npm install pinotejs

# Using pnpm
pnpm add pinotejs

# Using yarn
yarn add pinotejs
```

## Quick Start

### Vanilla JavaScript

Use Pinote in any DOM-based framework (Vue, Svelte, Angular, etc.) or plain HTML.

```javascript
import { createPinote } from "pinotejs";
import "pinotejs/style.css";

const feedbackLayer = createPinote({
  storageKey: "my-project-id",
});

// Mount the UI layer
feedbackLayer.mount();
```

### React / Next.js

Pinote provides a thin React wrapper around the core engine.

```tsx
import { PinoteProvider, PinoteToolbar, PinoteLayer } from "pinotejs/react";
import "pinotejs/style.css";

function App() {
  return (
    <PinoteProvider storageKey="my-project-id">
      <PinoteToolbar />
      <YourAppContent />
      <PinoteLayer />
    </PinoteProvider>
  );
}
```

> **Note for Next.js App Router**: Wrap your layout or specific page in a Client Component when using Pinote components, or ensure they are mounted only on the client.

## API Reference

### Vanilla API (`pinotejs`)

#### `createPinote(options)`
Initializes a new Pinote instance.
- `options.storageKey` (string): Unique ID for local storage scoping.
- `options.ignoreSelector` (string): CSS selector for elements that should not be clickable.

#### `instance.mount()`
Injects the toolbar and comment layer into the DOM.

#### `instance.unmount()`
Removes the UI layer and cleans up all event listeners and observers.

#### `instance.enableCommentMode()`
Programmatically turns on comment mode.

#### `instance.disableCommentMode()`
Programmatically turns off comment mode.

#### `instance.exportComments()`
Triggers a JSON download of all comments in the project.

### React API (`pinotejs/react`)

#### `<PinoteProvider>`
The context provider that manages the engine lifecycle. Accepts the same options as `createPinote`.

#### `<PinoteToolbar>`
The built-in floating toolbar with toggle and export controls.

#### `<PinoteLayer>`
The visual layer that renders comment pins and popovers. (Optional: `PinoteProvider` can render this automatically).

#### `usePinote()`
A hook to access the current state and methods:
- `isCommentModeEnabled`: boolean
- `comments`: All project comments
- `currentPageComments`: Comments for the current path
- `toggleCommentMode()`: Function to toggle mode
- `exportComments()`: Function to trigger JSON export

## Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storageKey` | `string` | `"default"` | Used to isolate comments in localStorage. |
| `ignoreSelector` | `string` | `undefined` | Additional CSS selectors to ignore during click capture. |
| `onStateChange` | `function` | `undefined` | Callback triggered when internal state updates. |

## Data Export

The exported JSON file contains:
- Full project metadata.
- Comment counts (total, open, resolved).
- List of pages with comments.
- Raw comment data with anchoring metadata and relative positioning.

## Limitations

- **Local Only**: In the current MVP, data is stored in the browser and can be exported as JSON.
- **Browser-Only**: Requires a DOM environment; not compatible with Node.js/SSR environments.
- **Visibility**: Uses a high z-index (`2147483647`), but may be affected by other elements with equal priority.

## Contributing

1. Clone the repo: `git clone https://github.com/RidloGhifary/pinote.git`
2. Install dependencies: `pnpm install`
3. Build the package: `pnpm build`
4. Run demos: `pnpm dev:react` or `pnpm dev:vanilla`

## License

MIT © [Ridlo Ghifary](https://github.com/RidloGhifary)
