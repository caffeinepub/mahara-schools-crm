import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import ParentPortal from "./components/ParentPortal";
import { useActor } from "./hooks/useActor";
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import { clearAuth, getAuthUser, setAuthUser } from "./store";
import type { AuthUser } from "./types";

export type Page =
  | "dashboard"
  | "leads"
  | "campaigns"
  | "management"
  | "ai-reply"
  | "academics";

export default function App() {
  const { actor } = useActor();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const stored = getAuthUser();
    if (stored) setUser(stored as AuthUser);
  }, []);

  useEffect(() => {
    if (actor && !seeded) {
      actor
        .initSeedData()
        .then(() => setSeeded(true))
        .catch(() => setSeeded(true));
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
        setAuthUser(authUser);
        setUser(authUser);
        return true;
      }
    } catch {
      // fall through
    }
    return false;
  }

  function handleLogout() {
    clearAuth();
    setUser(null);
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
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
