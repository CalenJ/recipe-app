import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { AuthProvider } from "./components/auth/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Router
        root={props => (
          <MetaProvider>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </AuthProvider>
  );
}
