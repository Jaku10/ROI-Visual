# Deploy to GitHub Pages

## 1. Create a GitHub repo and push your code

If you haven’t already:

```bash
cd "Interactive KPI Visualization"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 2. Match the base path to your repo name

The app is configured for a repo named **`Interactive-KPI-Visualization`**.

- If your repo has a **different name**, set it when building:

  ```bash
  BASE_PATH=your-repo-name npm run build:gh
  ```

  Then deploy:

  ```bash
  npx gh-pages -d dist
  ```

- If your repo **is** `Interactive-KPI-Visualization`, skip to step 3.

## 3. Install dependencies and deploy

```bash
npm install
npm run deploy
```

This will:

1. Build the app for production (with the correct base path).
2. Copy `index.html` to `404.html` so direct links and refresh work on GitHub Pages.
3. Push the `dist` folder to the `gh-pages` branch.

## 4. Turn on GitHub Pages

1. Open your repo on GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Branch: **gh-pages** (or whatever branch `gh-pages` created).
5. Folder: **/ (root)**.
6. Save.

After a minute or two, the site will be at:

**https://YOUR_USERNAME.github.io/Interactive-KPI-Visualization/**

(Use your actual repo name in the URL if it’s different.)

## Later deploys

After code changes:

```bash
npm run deploy
```

No need to change GitHub Pages settings again.
