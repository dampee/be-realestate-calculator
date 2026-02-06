# be-realestate-calculator

Single-page Vue 3 + Vite app for Belgian mixed-use real estate investment calculations.

## Live site

Visit the GitHub Pages deployment here: https://dampee.github.io/be-realestate-calculator/

## GitHub Pages deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` or `master` branch.

### Automatic deployment (recommended)

Push your changes to the `main` or `master` branch, and the `.github/workflows/deploy.yml` workflow will:
1. Install dependencies with `npm ci`
2. Build the site with `npm run build`
3. Deploy the `dist` folder to GitHub Pages

You can also trigger a manual deployment from the Actions tab in GitHub.

### Manual deployment (alternative)

If you prefer to deploy manually:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the site:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to the `gh-pages` branch:
   ```bash
   npm run deploy
   ```

> Note: The Vite base path is set to `/be-realestate-calculator/` for GitHub Pages. If you rename the repo, update `vite.config.js` accordingly.
