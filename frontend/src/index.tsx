import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import { env } from "./lib/clientenvschemas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </QueryClientProvider>
    ,
  </React.StrictMode>
);
