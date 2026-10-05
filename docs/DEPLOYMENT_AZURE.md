# Azure Static Web Apps Deployment Guide

You can easily host **Minimi** on **Microsoft Azure Static Web Apps** for free with global CDN distribution, SSL certificates, and automatic CI/CD.

---

## 1. Prerequisites for Azure
* An active **Azure Account** ([azure.microsoft.com](https://azure.microsoft.com/)).
* GitHub repository connected to your Azure account.

---

## 2. Option A: Deploying via Azure Portal

1. Go to **Azure Portal** (`https://portal.azure.com`).
2. Search for **Static Web Apps** and click **Create**.
3. Configure settings:
   * **Subscription:** Choose your Azure subscription.
   * **Resource Group:** Create or select a resource group (e.g., `rg-minimi`).
   * **Name:** `minimi-app`.
   * **Plan Type:** Free.
   * **Region:** Select closest region (e.g. East US or West Europe).
   * **Deployment Source:** Select **GitHub**.
4. Authenticate GitHub and select:
   * **Organization:** Your GitHub Username.
   * **Repository:** `minimi`.
   * **Branch:** `main` or `master`.
5. **Build Details Presets:** Select **Angular**.
   * **App location:** `/`
   * **Api location:** *(Leave empty as Minimi has zero backend)*
   * **Output location:** `dist/minimi-app/browser` (or `dist/minimi-app`)
6. Click **Review + Create**, then **Create**.

---

## 3. Option B: Azure Static Web Apps GitHub Workflow File

Azure will automatically commit `.github/workflows/azure-static-web-apps.yml` to your repo. Here is the recommended configuration:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist/minimi-app/browser"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Job
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

## 4. Single Page Application (SPA) Routing Configuration on Azure

To ensure page reloads work correctly without 404 errors on Azure Static Web Apps, add a `staticwebapp.config.json` file to `src/`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{png,jpg,gif,ico,css,js}"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

Include `"src/staticwebapp.config.json"` in the `assets` array of `angular.json`.
