import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { HighspotImpact } from "./pages/HighspotImpact";

// Use Vite's base URL so routing works on GitHub Pages (e.g. /repo-name/)
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: Landing },
        { path: "general", Component: Dashboard },
        { path: "highspot", Component: HighspotImpact },
      ],
    },
  ],
  { basename }
);
