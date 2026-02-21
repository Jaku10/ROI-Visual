# ROI-Visual

  # Interactive KPI Visualization

  This is a code bundle for Interactive KPI Visualization. The original project is available at https://www.figma.com/design/yARHHucKJrRdKwp3W7wtTp/Interactive-KPI-Visualization.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Create a new GitHub repo and push

  1. **Create the repo on GitHub**  
     Go to [github.com/new](https://github.com/new). Name it e.g. `interactive-kpi-visualization` (or any name). Do **not** add a README, .gitignore, or license—this project already has them.

  2. **Point this repo at GitHub and push** (use your repo name in the URL):
     ```bash
     cd "Interactive KPI Visualization"
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     git branch -M main
     git push -u origin main
     ```

  3. **Deploy to GitHub Pages**  
     In `vite.config.ts` the default base path is `philo-app`. If your new repo has a **different name**, either change that default or deploy with:
     ```bash
     BASE_PATH=your-repo-name npm run deploy
     ```
     Then in GitHub: **Settings → Pages →** Source: **Deploy from a branch** → Branch: **gh-pages** → **/** → Save.
  