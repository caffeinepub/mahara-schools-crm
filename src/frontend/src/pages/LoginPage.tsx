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
      toast.error("Invalid credentials. Try admin/admin123 or agent/agent123.");
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
          <p className="text-white/70 text-sm mt-1">CRM — Admissions Portal</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>Sign in to your CRM account</CardDescription>
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
                  placeholder="admin"
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
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              Demo: <strong>admin / admin123</strong> or{" "}
              <strong>agent / agent123</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
