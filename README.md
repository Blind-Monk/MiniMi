# MinimiApp

Minimi is an open-source, client-side front-end web application featuring 100+ games and 100+ developer and productivity tools with zero backend dependencies and 100% phone/mobile compatibility.

## 🚀 Quick Start with Bun or Node.js

Minimi fully supports both **Bun** (`bun`) and **Node.js** (`npm` / `npx`).

### Path & Runtime Locations
* **Bun Binary:** `bun` or `~/.bun/bin/bun`
* **BunX Binary:** `bunx` or `~/.bun/bin/bunx`
* **Node/NPM:** `npm` / `npx`
* **Documentation Directory:** `docs/` (`docs/README.md`, `docs/DEVELOPMENT.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT_GITHUB_PAGES.md`, `docs/DEPLOYMENT_AZURE.md`)

---

### Installing Dependencies

```bash
# Using Bun (Recommended for ultra-fast installs)
bun install

# Or using npm
npm install
```

### Development Server

To start a local development server at `http://localhost:4200/`:

```bash
# Using Bun
bun run start
# or using bunx directly:
bunx ng serve

# Using npm / Angular CLI
npm start
# or:
npx ng serve
```

### Building for Production

To compile the application and generate static assets in `dist/minimi/browser`:

```bash
# Using Bun
bun run build

# Using npm
npm run build
```

### Running Unit Tests

To run the unit tests:

```bash
# Using Bun
bun run test

# Using npm
npm test
```

### Deploying to GitHub Pages (`online` repository)

Run the deployment script which automatically detects Bun or npm and deploys the production static build to the `online` repository:

```bash
# Execute deployment script
./scripts/deploy.sh git@github.com:your-user/online.git
```

---

## 📚 Documentation Index

Detailed documentation for Minimi is located in the `docs/` directory:

1. **[Docs Overview (`docs/README.md`)](docs/README.md)** — Guide to all project documentation.
2. **[Architecture Overview (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md)** — Core structure, standalone components, signals, and routing.
3. **[Development Guide (`docs/DEVELOPMENT.md`)](docs/DEVELOPMENT.md)** — Comprehensive local development workflow with Bun and npm.
4. **[GitHub Pages Deployment (`docs/DEPLOYMENT_GITHUB_PAGES.md`)](docs/DEPLOYMENT_GITHUB_PAGES.md)** — CI/CD Actions and shell scripts targeting the `online` repository.
5. **[Azure Deployment (`docs/DEPLOYMENT_AZURE.md`)](docs/DEPLOYMENT_AZURE.md)** — Deploying static web app builds to Azure Static Web Apps.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
