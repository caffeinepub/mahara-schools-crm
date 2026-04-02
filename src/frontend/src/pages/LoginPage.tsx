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
  "/assets/mahara_common_logo_png-019d4d86-52fa-7582-a628-0e0c9b0a7c23.png";

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
          "linear-gradient(135deg, #78C8C8 0%, #64A0A3 40%, #B8A7CC 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-lg mb-4 p-2">
            <img
              src={LOGO}
              alt="Mahara Schools"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight drop-shadow">
            Mahara Schools
          </h1>
          <p className="text-white/80 text-sm mt-1">
            International Pre-School & Day Care
          </p>
          <p className="text-white/60 text-xs mt-0.5">CRM & Staff Portal</p>
        </div>

        <Card className="shadow-xl border-0">
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
                style={{
                  background:
                    "linear-gradient(90deg, #78C8C8 0%, #64A0A3 100%)",
                }}
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
                Centre Head (Kondapur): <strong>centrehead1 / ch123</strong>
              </p>
              <p>
                Centre Head (Bachupally): <strong>centrehead2 / ch456</strong>
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

        <p className="text-center text-white/50 text-[10px] mt-4">
          Kondapur: +91 628170-8102 &nbsp;|&nbsp; Bachupally: +91 7488-456789
        </p>
      </div>
    </div>
  );
}
