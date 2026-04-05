import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, type ErrorInfo, type ReactNode } from "react";
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

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Root error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "oklch(0.68 0.13 243)",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2.5rem 2rem",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "oklch(0.93 0.19 105)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: "24px",
              }}
            >
              🏫
            </div>
            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "1.25rem",
                color: "oklch(0.22 0.015 250)",
                marginBottom: "0.5rem",
              }}
            >
              Mahara Schools CRM
            </h1>
            <p
              style={{
                color: "oklch(0.55 0.015 250)",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
                lineHeight: "1.6",
              }}
            >
              Something went wrong. Please refresh the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "oklch(0.80 0.07 189)",
                color: "oklch(0.22 0.015 250)",
                border: "none",
                borderRadius: "8px",
                padding: "0.625rem 1.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </RootErrorBoundary>,
);
