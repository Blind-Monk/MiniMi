# Minimi — Full-Stack Application Plan & Architecture Specification

> **Tagline:** "100 Games. 100 Tools. Enterprise Backend & Developer APIs."
> **Repository:** `minimi` (Main Source) / Deployment target repository: `online`
> **License:** MIT (Code) + CC0 1.0 (Art/Audio Assets generated/packaged in-house)

---

## 1. System Architecture Overview

Minimi is a high-performance hybrid application combining an Angular 18+ client-side web application and a Node.js / Express / TypeScript backend API service.

```
+-----------------------------------------------------------------------+
|                         MINIMI WEB APP (Angular 18)                  |
|  +---------------------+  +--------------------+  +----------------+  |
|  | 13 Mini-Games (3D)  |  | 7 Developer Tools  |  | Premium Portal |  |
|  +---------------------+  +--------------------+  +----------------+  |
+-----------------------------------||----------------------------------+
                                    || REST API Requests
                                    \/
+-----------------------------------------------------------------------+
|                  EXPRESS / TYPESCRIPT BACKEND SERVER (`server/`)       |
|  +---------------------+  +--------------------+  +----------------+  |
|  | Premium Key Checker |  | PDF / QR API Engine|  | Highscores API |  |
|  +---------------------+  +--------------------+  +----------------+  |
+-----------------------------------------------------------------------+
```

---

## 2. Key Modules & Services

### 2.1 Angular Frontend (`src/app/`)
* **3D WebGL Games (Three.js):**
  * *Garden vs Groaners 3D*: 5-lane tactical zombie defense game with animated plants and zombies.
  * *Turbo Speed II SE 3D*: Split-screen 1–4 player racing simulator with custom keybindings and gamepad support.
  * *3D Battle Chess*: PBR metallic/marble chessboard and piece sets.
  * *Project Vanguard FPS*: Tactical target shooting with health bar, raycasting, and enemy targets.
  * *Mario 3D, Horror 3D, City Sprint, etc.*
* **Developer & Security Utilities:**
  * PDF Tools Suite, Dynamic QR Code Generator, Password Entropy Estimator, Regex Visualizer, Hash Calculator, JSON Formatter.
* **Get Premium Access Modal:**
  * Integrated dialog for key validation, 30-day trial token generation, and PDF documentation download.

### 2.2 Express Backend (`server/`)
* **Service Location:** `server/`
* **Main Entry Point:** `server/src/index.ts` (compiled to `server/dist/index.js`)
* **API Routes:**
  * `GET /api/v1/health` - Cluster readiness & status.
  * `POST /api/v1/premium/access` - Key verification & instant trial provisioning.
  * `POST /api/v1/tools/pdf/process` - High-speed backend PDF operations.
  * `POST /api/v1/tools/qr/generate` - Dynamic SVG/PNG QR code rendering.
  * `GET/POST /api/v1/games/highscores` - Cross-device leaderboard tracking.

---

## 3. GitHub Pages & Deployment Pipeline

* **Workflow:** `.github/workflows/deploy.yml`
* **Target Repository:** `online` (`gh-pages` branch)
* **Build Command:** `npm run build`
* **Deploy Script:** `scripts/deploy.sh`
* **Output Path:** Static distribution directory published automatically upon changes to `main`.
