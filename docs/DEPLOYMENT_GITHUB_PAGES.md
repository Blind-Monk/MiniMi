# GitHub Pages Deployment Guide

Minimi includes automated scripts and GitHub Actions workflows to compile static pages and push them to a target repository called **`online`**.

---

## 1. Automated Deployment via GitHub Actions

The repository includes `.github/workflows/deploy.yml`. When code is pushed to `main` or `master`, GitHub Actions automatically:
1. Checks out source code and installs dependencies using **Bun**.
2. Executes unit tests (`bun run test -- --watch=false`).
3. Compiles production Angular static app with base href `/online/`:
   ```bash
   bun run build -- --base-href "/online/"
   # or with npm:
   npm run build -- --base-href "/online/"
   ```
4. Creates `.nojekyll` to bypass Jekyll processing on GitHub Pages.
5. Force pushes static output to the `gh-pages` branch of the `online` target repository.

### GitHub Secret Configuration
Ensure your repository has a secret named `GH_PAT` (Personal Access Token with `repo` scope) or uses default `GITHUB_TOKEN` permissions if deploying within the same organization.

---

## 2. Manual Deployment via Shell Script

You can manually trigger a build and push to the `online` repository using `scripts/deploy.sh`:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Execute deployment script
./scripts/deploy.sh git@github.com:areyouroot/online.git
```

### Script Execution Steps:
1. Detects runtime: Checks for `bun` (`~/.bun/bin/bun`), falling back to `npm`.
2. Builds production output: `$RUNNER build -- --base-href "/online/"`.
3. Locates build directory: `dist/minimi/browser`.
3. Adds `.nojekyll` file.
4. Initializes temporary git repo, commits static artifacts, and force-pushes to `main:gh-pages` on the target `online` repository.
