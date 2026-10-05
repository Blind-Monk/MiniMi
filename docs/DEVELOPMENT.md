# Local Development Setup for Minimi

This guide provides instructions for setting up, running, testing, and extending the Minimi application locally.

---

## 1. Prerequisites

Ensure your development workstation has the following installed:
* **Node.js:** v18.0.0 or higher (v20+ recommended).
* **npm:** v9.0.0 or higher.
* **Git:** for version control.

Check versions in terminal:
```bash
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
   npm install
   ```

---

## 3. Running in Development Mode

To launch the Angular local development server:

```bash
npm start
# or
npx ng serve
```

* Navigate to **`http://localhost:4200/`** in your browser.
* The application will automatically reload whenever you make edits inside `src/app/`.

---

## 4. Running Unit Tests

Run the unit test suite:

```bash
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
