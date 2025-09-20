import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Wizard } from "./features/wizard/Wizard";
import { ConfigPage } from "./features/config/ConfigPage";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Wizard />
      </Layout>
    ),
  },
  {
    path: "/config",
    element: (
      <Layout>
        <ConfigPage />
      </Layout>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);