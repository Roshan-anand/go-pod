import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import Studio from "@/pages/Studio";
import NotFound from "@/NotFound";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/components/dashboard/Projects";
import Home from "@/components/dashboard/home";

const rootRoute = createRootRoute();

const langingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Landing />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => <Dashboard />,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  loader: () => {
    throw redirect({
      to: "/dashboard/home",
    });
  },
});

const dashboardHomeRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/home",
  component: () => <Home />,
});

const dashboardProjectsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/projects",
  component: () => <Projects />,
});

const roomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio/$studioID",
  component: () => <Studio />,
});

const loginRouter = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <Login />,
});

const routeTree = rootRoute.addChildren([
  langingRoute,
  dashboardRoute.addChildren([
    dashboardHomeRoute,
    dashboardProjectsRoute,
    dashboardIndexRoute,
  ]),
  roomRoute,
  loginRouter,
]);
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
});

export default router;
