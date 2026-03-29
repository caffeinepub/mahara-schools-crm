import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import { useActor } from "./hooks/useActor";
import LoginPage from "./pages/LoginPage";
import { clearAuth, getAuthUser, setAuthUser } from "./store";
import type { AuthUser } from "./types";

export type Page = "dashboard" | "leads" | "campaigns" | "management";

export default function App() {
  const { actor } = useActor();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [seeded, setSeeded] = useState(false);

  // Restore session
  useEffect(() => {
    const stored = getAuthUser();
    if (stored) setUser(stored);
  }, []);

  // Seed backend data (idempotent)
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
          role: result.role as "Admin" | "Agent",
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
