import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const LOGO =
  "/assets/mahara_common_logo_png-019d5f08-56b5-75e2-b21e-90232b0e5415.png";

interface Props {
  onLogin: (username: string, password: string) => Promise<boolean>;
  actorReady?: boolean;
}

export default function LoginPage({ onLogin, actorReady = true }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actorReady) {
      toast.error("Still connecting to the server. Please wait a moment.");
      return;
    }
    setLoading(true);
    try {
      const ok = await onLogin(username, password);
      if (!ok) {
        toast.error(
          "Invalid credentials. Please check your username and password.",
        );
      }
    } catch {
      toast.error("Connection error. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.80 0.07 189)" }}
    >
      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, oklch(0.82 0.09 356 / 0.45) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, oklch(0.74 0.07 293 / 0.4) 0%, transparent 55%), radial-gradient(ellipse at 60% 85%, oklch(0.68 0.13 243 / 0.35) 0%, transparent 50%)",
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-30 pointer-events-none"
        style={{ background: "oklch(0.93 0.19 105)" }}
      />
      <div
        className="absolute bottom-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-25 pointer-events-none"
        style={{ background: "oklch(0.85 0.18 125)" }}
      />

      <div className="w-full max-w-sm relative z-10 px-4">
        {/* Logo + brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-xl mb-5 overflow-hidden">
            <img
              src={LOGO}
              alt="Mahara Schools"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                const parent = t.parentElement;
                if (parent && !parent.querySelector(".logo-fallback")) {
                  const span = document.createElement("span");
                  span.className = "logo-fallback";
                  span.textContent = "M";
                  span.style.cssText =
                    "font-size:2.2rem;font-weight:800;color:#65A0E3;display:flex;align-items:center;justify-content:center;width:100%;height:100%;";
                  parent.appendChild(span);
                }
              }}
            />
          </div>
          <h1
            className="text-white text-2xl tracking-tight drop-shadow-sm"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontWeight: 800,
            }}
          >
            Mahara Schools
          </h1>
          <p
            className="text-white/85 text-sm mt-1.5"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            International Pre-School &amp; Day Care
          </p>
          <p
            className="text-white/65 text-xs mt-0.5"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            CRM &amp; Staff Portal
          </p>
        </div>

        {/* Login card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle
              className="text-lg"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                color: "oklch(0.22 0.015 250)",
              }}
            >
              Welcome back
            </CardTitle>
            <CardDescription
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                >
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  data-ocid="login.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  data-ocid="login.password.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full font-semibold text-sm border-0"
                style={{
                  background: "oklch(0.93 0.19 105)",
                  color: "oklch(0.22 0.015 250)",
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  fontWeight: 700,
                }}
                disabled={loading || !actorReady}
                data-ocid="login.submit_button"
              >
                {loading
                  ? "Signing in..."
                  : !actorReady
                    ? "Connecting..."
                    : "Sign In"}
              </Button>
            </form>

            {/* Demo credentials */}
            <div
              className="mt-4 rounded-lg px-3 py-2.5 text-[11px] space-y-1"
              style={{
                background: "oklch(0.95 0.02 240)",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              <p
                className="font-semibold mb-1"
                style={{ color: "oklch(0.22 0.015 250)" }}
              >
                Demo Credentials
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Founder: <strong>founder / founder123</strong>
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Admin: <strong>admin / admin123</strong>
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Centre Head (Kondapur): <strong>centrehead1 / ch123</strong>
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Centre Head (Bachupally): <strong>centrehead2 / ch456</strong>
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Teacher (Nursery): <strong>teacher1 / teacher123</strong>
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Parent Portal: <strong>parent1 / parent123</strong>
              </p>
              <p style={{ color: "oklch(0.55 0.015 250)" }}>
                Counselor: <strong>counselor / counselor123</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <p
          className="text-center text-white/55 text-[10px] mt-4"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          Kondapur: +91 628170-8102 &nbsp;|&nbsp; Bachupally: +91 7488-456789
        </p>
      </div>
    </div>
  );
}
