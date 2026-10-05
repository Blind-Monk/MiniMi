# Minimi — System Architecture & Design

## 1. Executive Summary
**Minimi** is a 100% client-side, zero-backend Web Application built with **Angular 18+**, **Tailwind CSS**, and **Angular Signals**. The application delivers a unified catalog of mini-games and developer/utility tools that execute entirely inside the user's web browser.

---

## 2. Technical Stack

* **Framework:** Angular 18+ (Standalone Components, Zoneless support).
* **State Management:** Angular Signals (`signal()`, `computed()`) for ultra-fast, reactive component reactivity.
* **Styling & Layout:** Tailwind CSS v4 + Custom Dark Theme Color Tokens.
* **Registry Architecture:** Decoupled item metadata registry (`CatalogItem[]`) powering global search, filtering, and dynamic component rendering.
* **Testing Engine:** Vitest / Angular TestBed for component and pure logic unit testing.
* **Mobile / Phone Layer:** Viewport scale lock, touch event handlers (`touchstart`, `touchmove`), on-screen virtual controls, and touch haptic vibration feedback (`navigator.vibrate`).

---

## 3. Directory Structure Architecture

```
minimi/
├── docs/                      # Documentation folder
│   ├── README.md              # Documentation index
│   ├── ARCHITECTURE.md        # Architecture specifications
│   ├── DEVELOPMENT.md         # Dev mode setup and instructions
│   ├── DEPLOYMENT_GITHUB_PAGES.md # Deploying to 'online' repo on GitHub Pages
│   └── DEPLOYMENT_AZURE.md    # Deploying to Azure Static Web Apps
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── models/
│   │   │       └── catalog.model.ts  # Item Registry & Model Types
│   │   ├── features/
│   │   │   ├── games/         # PvZ clone, Snake, 2048, Blockfall, Maze Muncher
│   │   │   └── tools/         # JSON Formatter, Base64, QR, Hash, Password Gen
│   │   ├── app.ts             # Main Shell Component
│   │   ├── app.html           # Layout Template (Header, Switcher, Grid, Detail Modal)
│   │   ├── app.css            # Component Styling
│   │   └── app.spec.ts        # Automated Unit Tests
│   ├── assets/                # Web fonts, icons, audio samples
│   ├── styles.css             # Tailwind theme imports & global CSS variables
│   └── main.ts                # Application Bootstrap Entry
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions deployment to target 'online' repo
├── scripts/
│   └── deploy.sh              # Bash script to build and push static pages
├── plan.md                    # Master Plan Specification
└── angular.json               # Angular CLI Workspace Configuration
```

---

## 4. Metadata Registry Pattern

Every game and tool module in Minimi exports metadata adhering to `CatalogItem`:

```typescript
export interface CatalogItem {
  id: string;
  name: string;
  category: 'games' | 'tools';
  subcategory: string;
  description: string;
  icon: string;
  tags: string[];
  isPopular?: boolean;
}
```

When a user clicks on an app card, `App` component sets `selectedItem` signal, which mounts the standalone component dynamically inside the fullscreen modal view without page reloads.

---

## 5. IP Transformation & Open-Source Rules

To prevent trademark/copyright infringement:
* All games are **genre clones of mechanics only**.
* *Garden vs Groaners:* Plant-vs-Zombie mechanics transformed into Sunblooms (solar generators), Pelt-Pods (seed shooters), Bark Blocks (barricades), and Groaners/Shamblers (zombie enemies).
* *Blockfall:* Polyomino block falling mechanics without trademarked trade dress.
* *Maze Muncher:* Generic dot eating in a maze with 4 custom ghost AI behaviors.
