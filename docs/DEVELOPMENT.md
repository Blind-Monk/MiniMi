# Local Development Setup for Minimi

This guide provides instructions for setting up, running, testing, and extending the Minimi application locally.

---

## 1. Prerequisites

Ensure your development workstation has either **Bun** or **Node.js** installed:

### Executable Paths & System Verification:
* **Bun Path:** `bun` (if installed globally) or `~/.bun/bin/bun`
* **BunX Path:** `bunx` or `~/.bun/bin/bunx`
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm / npx:** v9.0.0 or higher
* **Angular CLI binary path:** `./node_modules/.bin/ng`

Verify installations:
```bash
# Verify Bun (if installed)
bun --version || ~/.bun/bin/bun --version

# Verify Node & NPM
node -v
npm -v
git --version
```

---

## 2. Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/areyouroot/minimi.git
   cd minimi
   ```

2. **Install project dependencies:**
   ```bash
   # Using Bun (Recommended - extremely fast dependency resolution)
   bun install

   # Or using npm
   npm install
   ```

---

## 3. Running in Development Mode

To launch the Angular local development server at `http://localhost:4200/`:

```bash
# Using Bun
bun run start
# or using bunx directly:
bunx ng serve

# Using npm
npm start
# or:
npx ng serve
```

* Navigate to **`http://localhost:4200/`** in your browser.
* The application will automatically reload whenever you make edits inside `src/app/`.

---

## 4. Running Unit Tests & Linter

Run the unit test suite:

```bash
# Using Bun
bun run test -- --watch=false

# Using npm
npm test -- --watch=false
```

Tests cover catalog filtering, component initialization, favorite toggling, and game logic.

---

## 5. Adding a New Game or Tool

1. **Create standalone Angular component:**
   Place new game components in `src/app/features/games/<game-name>/` or tool components in `src/app/features/tools/<tool-name>/`.
2. **Implement logic with Angular Signals:**
   Use `signal()`, `computed()`, and Tailwind CSS styling.
3. **Register item in `catalog.model.ts`:**
   Add metadata definition to `CATALOG_ITEMS`:
   ```typescript
   {
     id: 'my-new-tool',
     name: 'My New Tool',
     category: 'tools',
     subcategory: 'Developer',
     description: 'Tool description...',
     icon: '🔧',
     tags: ['Dev', 'Utility']
   }
   ```
4. **Import & Register in `app.ts` & `app.html`:**
   Import component into `app.ts` imports array and add `@case ('my-new-tool')` to the `@switch` statement in `app.html`.
