import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMsg: error instanceof Error ? error.message : String(error),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "oklch(0.80 0.07 189)",
            padding: "2rem",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src="/assets/mahara_common_logo_png-019d5f08-56b5-75e2-b21e-90232b0e5415.png"
              alt="Mahara Schools"
              style={{
                width: 72,
                height: 72,
                objectFit: "contain",
                margin: "0 auto 1rem",
              }}
            />
            <h2
              style={{
                fontWeight: 800,
                fontSize: "1.25rem",
                color: "#1a1a2e",
                marginBottom: "0.5rem",
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              The app encountered an unexpected error. Please reload the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "oklch(0.93 0.19 105)",
                color: "#1a1a2e",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem 2rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </RootErrorBoundary>,
);
