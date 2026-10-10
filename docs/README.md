# Minimi — Documentation Index

Welcome to the official documentation for **Minimi** ("100 games. 100 tools. Zero backend.").

---

## 📚 Documentation Index

1. [**Architecture Overview (`ARCHITECTURE.md`)**](./ARCHITECTURE.md)
   * Tech Stack & System Architecture
   * Component Hierarchy & Metadata Registry Pattern
   * State Management with Angular Signals
   * Phone & Mobile Control Layer Strategy
   * Open-Source IP Safety Transformation Rules

2. [**Development & Local Setup Guide (`DEVELOPMENT.md`)**](./DEVELOPMENT.md)
   * Prerequisites & Environment Setup
   * Installing Dependencies
   * Launching the App in Development Mode
   * Running Unit Tests & Linter
   * Adding New Games & Tools

3. [**GitHub Pages Deployment Guide (`DEPLOYMENT_GITHUB_PAGES.md`)**](./DEPLOYMENT_GITHUB_PAGES.md)
   * Deploying Static Build to Target `online` Repository
   * Standalone Deployment Script (`scripts/deploy.sh`)
   * Automated GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`)
   * Configuring Custom Base Href & Custom Domains

4. [**Azure Static Web Apps Hosting Guide (`DEPLOYMENT_AZURE.md`)**](./DEPLOYMENT_AZURE.md)
   * Prerequisites for Azure
   * Creating an Azure Static Web App Resource
   * Configuring `.github/workflows/azure-static-web-apps.yml`
   * Environment Variables & Custom Domain Mapping on Azure

---

## 🚀 Quick Commands Summary (Bun & NPM)

Minimi natively supports both **Bun** (`bun` / `~/.bun/bin/bun`) and **Node.js** (`npm` / `npx`).

| Command (Bun) | Command (NPM) | Purpose |
| :--- | :--- | :--- |
| `bun install` | `npm install` | Install all project dependencies |
| `bun run start` | `npm start` / `npx ng serve` | Launch local development server at `http://localhost:4200` |
| `bun run test` | `npm test` | Execute unit test suite with Vitest |
| `bun run build` | `npm run build` | Compile production static web bundle to `dist/minimi/browser` |
| `./scripts/deploy.sh` | `./scripts/deploy.sh` | Build and force-push static pages to `online` GitHub repo |

---

## 🛠 File & Executable Paths

* **Bun Executable:** `bun` (if in system PATH) or `~/.bun/bin/bun`
* **BunX Executable:** `bunx` or `~/.bun/bin/bunx`
* **NPM / NPX:** `npm` / `npx`
* **Angular CLI Executable:** `./node_modules/.bin/ng` or `bunx ng` / `npx ng`
* **Main Script Path:** `scripts/deploy.sh`
* **Build Artifact Output Path:** `dist/minimi/browser` (or `dist/minimi`)
