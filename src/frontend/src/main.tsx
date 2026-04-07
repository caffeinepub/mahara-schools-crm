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

// Root-level error boundary to prevent the entire app from going white on crash
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Mahara CRM] Root crash:", error, info);
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
            background: "#65A0E3",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "40px 32px",
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏫</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#1a2237",
                marginBottom: 8,
              }}
            >
              Mahara Schools CRM
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#555",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Something went wrong loading the application. This is usually a
              temporary issue.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: "#FFE600",
                color: "#1a2237",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
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
      retryDelay: 1000,
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
