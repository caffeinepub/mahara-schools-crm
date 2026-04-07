import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import ParentPortal from "./components/ParentPortal";
import { useActor } from "./hooks/useActor";
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import { clearAuth, getAuthUser, setAuthUser } from "./store";
import type { AuthUser } from "./types";
import { setupSecurity } from "./utils/security";

export type Page =
  | "dashboard"
  | "leads"
  | "campaigns"
  | "management"
  | "ai-reply"
  | "academics"
  | "reports"
  | "tasks"
  | "integrations"
  | "whatsapp-history"
  | "attendance"
  | "teacher-performance"
  | "activities"
  | "forms"
  | "blog";

export default function App() {
  const { actor, isFetching, isError } = useActor();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [seeded, setSeeded] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Security hardening: run once on mount, wrapped in try/catch so it can never crash the app
  useEffect(() => {
    try {
      setupSecurity();
    } catch {
      // Security setup failing should never crash the app
    }
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = getAuthUser();
      if (stored) setUser(stored as AuthUser);
    } catch {
      // ignore storage errors
    }
    setAppReady(true);
  }, []);

  // Seed data once actor is available
  useEffect(() => {
    if (actor && !seeded) {
      actor
        .initSeedData()
        .then(() => setSeeded(true))
        .catch(() => setSeeded(true)); // Ignore seed errors — never crash
    }
  }, [actor, seeded]);

  async function handleLogin(
    username: string,
    password: string,
  ): Promise<boolean> {
    if (!actor) return false;
    try {
      const result = await actor.login({ username, password });
      if (result) {
        const authUser: AuthUser = {
          username: result.username,
          role: result.role as AuthUser["role"],
          name: result.name,
        };
        try {
          setAuthUser(authUser);
        } catch {
          // localStorage may be unavailable
        }
        setUser(authUser);
        return true;
      }
    } catch {
      // fall through
    }
    return false;
  }

  function handleLogout() {
    try {
      clearAuth();
    } catch {
      // ignore
    }
    setUser(null);
  }

  // Show a branded loading screen while the actor initializes.
  // Only show it on the first load (appReady=false) or if still fetching.
  // Once we have an actor or an error, proceed to login.
  const isInitialLoading = !appReady || (isFetching && !actor && !isError);

  if (isInitialLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.80 0.07 189)",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          <img
            src="/assets/mahara_common_logo_png-019d5f08-56b5-75e2-b21e-90232b0e5415.png"
            alt="Mahara"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 6,
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <p
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.9,
          }}
        >
          Mahara Schools CRM
        </p>
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} actorReady={!!actor} />
        <Toaster />
      </>
    );
  }

  if (user.role === "Parent") {
    return (
      <>
        <ParentPortal user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  if (user.role === "Teacher") {
    return (
      <>
        <TeacherDashboard user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AppShell
        user={user}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  );
}
