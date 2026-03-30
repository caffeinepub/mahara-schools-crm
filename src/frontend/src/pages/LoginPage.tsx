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

interface Props {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await onLogin(username, password);
    if (!ok) {
      toast.error(
        "Invalid credentials. Please check your username and password.",
      );
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #4F8F92 0%, #6EA9AA 60%, #EEF2F3 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            MAHARA SCHOOLS
          </h1>
          <p className="text-white/70 text-sm mt-1">CRM & Staff Portal</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
                className="w-full font-semibold"
                style={{ background: "#4F8F92" }}
                disabled={loading}
                data-ocid="login.submit_button"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 rounded-lg bg-muted/60 px-3 py-2.5 text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground/70 mb-1">
                Demo Credentials
              </p>
              <p>
                Founder: <strong>founder / founder123</strong>
              </p>
              <p>
                Admin: <strong>admin / admin123</strong>
              </p>
              <p>
                Agent: <strong>agent / agent123</strong>
              </p>
              <p>
                Centre Head (Dubai): <strong>centrehead1 / ch123</strong>
              </p>
              <p>
                Teacher (Nursery): <strong>teacher1 / teacher123</strong>
              </p>
              <p>
                Parent Portal: <strong>parent1 / parent123</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
