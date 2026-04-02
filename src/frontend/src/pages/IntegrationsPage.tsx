import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Globe,
  Loader2,
  Mail,
  MessageCircle,
  Share2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { IntegrationConfig } from "../backend.d";
import { useActor } from "../hooks/useActor";

const EMPTY_CONFIG: IntegrationConfig = {
  whatsappAccessToken: "",
  whatsappPhoneNumberId: "",
  whatsappApiUrl: "https://graph.facebook.com",
  emailApiKey: "",
  emailFromAddress: "",
  emailFromName: "",
  emailProvider: "SendGrid",
  metaWebhookVerifyToken: "",
  websiteWebhookSecret: "",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`${label} copied!`);
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="shrink-0"
      data-ocid={`integrations.${label.toLowerCase().replace(/\s+/g, "_")}.button`}
    >
      {copied ? (
        <Check size={14} className="text-green-600" />
      ) : (
        <Copy size={14} />
      )}
    </Button>
  );
}

export default function IntegrationsPage() {
  const { actor } = useActor();
  const actorAny = actor as any;

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<IntegrationConfig>(EMPTY_CONFIG);
  const [savedConfig, setSavedConfig] = useState<IntegrationConfig | null>(
    null,
  );
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: actorAny derived from actor
  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actorAny
      .getIntegrationConfig()
      .then((result: IntegrationConfig | null) => {
        if (result) {
          setConfig(result);
          setSavedConfig(result);
        }
      })
      .catch(() => toast.error("Failed to load integration settings"))
      .finally(() => setLoading(false));
  }, [actor]);

  const webhookBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const metaWebhookUrl = `${webhookBaseUrl}/webhook/meta-leads`;
  const websiteWebhookUrl = `${webhookBaseUrl}/webhook/website-leads`;

  const whatsappConnected = !!savedConfig?.whatsappAccessToken;

  async function saveWhatsApp() {
    if (!actor) return;
    setSavingWhatsApp(true);
    try {
      const newConfig = { ...config };
      await actorAny.saveIntegrationConfig(newConfig);
      setSavedConfig(newConfig);
      toast.success("WhatsApp configuration saved!");
    } catch {
      toast.error("Failed to save WhatsApp configuration");
    } finally {
      setSavingWhatsApp(false);
    }
  }

  async function testWhatsApp() {
    if (!actor) return;
    setTestingWhatsApp(true);
    try {
      const result = await actorAny.sendWhatsAppMessage(
        "test",
        "Hello from Mahara Schools CRM — connection test.",
      );
      if (result.success) {
        toast.success("WhatsApp connection successful!");
      } else {
        toast.error(`WhatsApp test failed: ${result.message}`);
      }
    } catch {
      toast.error("WhatsApp test failed — check your credentials");
    } finally {
      setTestingWhatsApp(false);
    }
  }

  async function saveMeta() {
    if (!actor) return;
    setSavingMeta(true);
    try {
      const newConfig = { ...config };
      await actorAny.saveIntegrationConfig(newConfig);
      setSavedConfig(newConfig);
      toast.success("Meta Ads configuration saved!");
    } catch {
      toast.error("Failed to save Meta configuration");
    } finally {
      setSavingMeta(false);
    }
  }

  async function saveWebsite() {
    if (!actor) return;
    setSavingWebsite(true);
    try {
      const newConfig = { ...config };
      await actorAny.saveIntegrationConfig(newConfig);
      setSavedConfig(newConfig);
      toast.success("Website leads configuration saved!");
    } catch {
      toast.error("Failed to save website configuration");
    } finally {
      setSavingWebsite(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="integrations.loading_state">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl" data-ocid="integrations.page">
      <div>
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "#2D6B6B" }}
        >
          Integrations Hub
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect external services to power your CRM workflows.
        </p>
      </div>

      <Tabs defaultValue="whatsapp" data-ocid="integrations.tab">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger
            value="whatsapp"
            className="flex items-center gap-1.5 text-xs"
          >
            <MessageCircle size={13} /> WhatsApp
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="flex items-center gap-1.5 text-xs"
          >
            <Mail size={13} /> Email
          </TabsTrigger>
          <TabsTrigger
            value="meta"
            className="flex items-center gap-1.5 text-xs"
          >
            <Share2 size={13} /> Meta Ads
          </TabsTrigger>
          <TabsTrigger
            value="website"
            className="flex items-center gap-1.5 text-xs"
          >
            <Globe size={13} /> Website
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab */}
        <TabsContent
          value="whatsapp"
          className="mt-4 space-y-4"
          data-ocid="integrations.whatsapp.panel"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle size={16} style={{ color: "#25D366" }} />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Connect your WhatsApp Business account to send messages
                    directly from campaigns.
                  </CardDescription>
                </div>
                <Badge
                  className={
                    whatsappConnected
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }
                  variant="outline"
                  data-ocid="integrations.whatsapp.toggle"
                >
                  {whatsappConnected ? (
                    <>
                      <Wifi size={11} className="mr-1" /> Connected
                    </>
                  ) : (
                    <>
                      <WifiOff size={11} className="mr-1" /> Not Configured
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Access Token</Label>
                <Input
                  type="password"
                  value={config.whatsappAccessToken}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whatsappAccessToken: e.target.value,
                    }))
                  }
                  placeholder="Bearer token from Meta Developer Console"
                  data-ocid="integrations.whatsapp.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone Number ID</Label>
                <Input
                  value={config.whatsappPhoneNumberId}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whatsappPhoneNumberId: e.target.value,
                    }))
                  }
                  placeholder="Your WhatsApp Business phone number ID"
                  data-ocid="integrations.whatsapp.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">API Base URL</Label>
                <Input
                  value={config.whatsappApiUrl}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whatsappApiUrl: e.target.value,
                    }))
                  }
                  placeholder="https://graph.facebook.com"
                  data-ocid="integrations.whatsapp.input"
                />
              </div>

              <div
                className="rounded-lg p-3 text-xs"
                style={{
                  background: "#E8F5F5",
                  color: "#2D6B6B",
                  border: "1px solid #B8DEDE",
                }}
              >
                <p className="font-medium">
                  ℹ️ Once configured, Campaign messages can be sent directly via
                  WhatsApp from the Campaigns page.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testWhatsApp}
                  disabled={testingWhatsApp || !config.whatsappAccessToken}
                  data-ocid="integrations.whatsapp.secondary_button"
                >
                  {testingWhatsApp ? (
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} className="mr-1.5" />
                  )}
                  Test Connection
                </Button>
                <Button
                  size="sm"
                  onClick={saveWhatsApp}
                  disabled={savingWhatsApp}
                  style={{ background: "#4F8F92" }}
                  data-ocid="integrations.whatsapp.save_button"
                >
                  {savingWhatsApp ? (
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                  ) : null}
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent
          value="email"
          className="mt-4 space-y-4"
          data-ocid="integrations.email.panel"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail size={16} style={{ color: "#4F8F92" }} />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="rounded-lg p-3 flex items-start gap-2.5"
                style={{ background: "#FFF8E7", border: "1px solid #F6D860" }}
              >
                <AlertTriangle
                  size={15}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#D97706" }}
                />
                <p className="text-xs" style={{ color: "#92400E" }}>
                  <strong>
                    Email features require a paid Caffeine subscription.
                  </strong>{" "}
                  Configure now and it will activate when you upgrade.
                </p>
              </div>

              <div className="opacity-60 space-y-4 pointer-events-none">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Provider</Label>
                  <Select defaultValue="SendGrid">
                    <SelectTrigger data-ocid="integrations.email.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SendGrid">SendGrid</SelectItem>
                      <SelectItem value="Mailgun">Mailgun</SelectItem>
                      <SelectItem value="SMTP">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">API Key</Label>
                  <Input
                    placeholder="Your email provider API key"
                    data-ocid="integrations.email.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    From Email Address
                  </Label>
                  <Input
                    placeholder="noreply@maharaschools.com"
                    data-ocid="integrations.email.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">From Name</Label>
                  <Input
                    placeholder="Mahara Schools"
                    data-ocid="integrations.email.input"
                  />
                </div>
                <Button
                  size="sm"
                  disabled
                  style={{ background: "#4F8F92" }}
                  data-ocid="integrations.email.save_button"
                >
                  Save Configuration
                </Button>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Enabled use cases once activated:
                </p>
                <ul className="space-y-1">
                  {[
                    "Parent notifications",
                    "Campaign emails",
                    "Enrollment confirmations",
                    "Report card alerts",
                  ].map((uc) => (
                    <li
                      key={uc}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Ads Tab */}
        <TabsContent
          value="meta"
          className="mt-4 space-y-4"
          data-ocid="integrations.meta.panel"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 size={16} style={{ color: "#1877F2" }} />
                Meta (Facebook) Lead Ads
              </CardTitle>
              <CardDescription className="text-xs">
                Automatically capture leads from your Facebook/Instagram ad
                campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="rounded-lg p-4 space-y-3"
                style={{ background: "#F8F9FA", border: "1px solid #E2E8F0" }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Setup Steps
                </p>
                {[
                  {
                    step: 1,
                    text: "Copy your Webhook URL below and paste it into your Meta Ads account under Lead Ads → CRM Integration → Webhook URL",
                  },
                  {
                    step: 2,
                    text: "Set the Verify Token (any secret string you choose) in both Meta and here",
                  },
                  {
                    step: 3,
                    text: "New leads from your ads will appear instantly in Lead Management",
                  },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ background: "#4F8F92" }}
                    >
                      {step}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={metaWebhookUrl}
                    className="font-mono text-xs bg-muted"
                    data-ocid="integrations.meta.input"
                  />
                  <CopyButton value={metaWebhookUrl} label="Webhook URL" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Verify Token</Label>
                <Input
                  value={config.metaWebhookVerifyToken}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      metaWebhookVerifyToken: e.target.value,
                    }))
                  }
                  placeholder="Enter a secret verify token"
                  data-ocid="integrations.meta.input"
                />
              </div>

              <div
                className="rounded-lg p-3 text-xs"
                style={{
                  background: "#E8F5F5",
                  color: "#2D6B6B",
                  border: "1px solid #B8DEDE",
                }}
              >
                <p>
                  📍 When a lead submits your Facebook/Instagram ad form, it
                  will appear in Lead Management automatically with source set
                  to <strong>"Meta Ads"</strong>.
                </p>
              </div>

              <Button
                size="sm"
                onClick={saveMeta}
                disabled={savingMeta}
                style={{ background: "#4F8F92" }}
                data-ocid="integrations.meta.save_button"
              >
                {savingMeta ? (
                  <Loader2 size={13} className="mr-1.5 animate-spin" />
                ) : null}
                Save Token
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Tab */}
        <TabsContent
          value="website"
          className="mt-4 space-y-4"
          data-ocid="integrations.website.panel"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe size={16} style={{ color: "#4F8F92" }} />
                Website Contact Form
              </CardTitle>
              <CardDescription className="text-xs">
                Capture leads instantly when someone fills your website contact
                form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Webhook Endpoint URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={websiteWebhookUrl}
                    className="font-mono text-xs bg-muted"
                    data-ocid="integrations.website.input"
                  />
                  <CopyButton value={websiteWebhookUrl} label="Webhook URL" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Webhook Secret</Label>
                <Input
                  value={config.websiteWebhookSecret}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      websiteWebhookSecret: e.target.value,
                    }))
                  }
                  placeholder="Secret key to verify incoming webhooks"
                  type="password"
                  data-ocid="integrations.website.input"
                />
              </div>

              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ background: "#2D3748" }}
                >
                  <Code2 size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-300 font-mono">
                    Example request
                  </span>
                </div>
                <pre
                  className="text-xs p-3 overflow-x-auto"
                  style={{ background: "#1A202C", color: "#68D391" }}
                >{`POST ${websiteWebhookUrl}
Content-Type: application/json
X-Webhook-Secret: {your-secret}

{
  "name": "Parent Name",
  "phone": "+91-98765-43210",
  "email": "parent@example.com",
  "gradeLevel": "Nursery (Age 3-4)",
  "source": "Website",
  "notes": "Inquiry from website contact form"
}`}</pre>
              </div>

              <div
                className="rounded-lg p-3 text-xs"
                style={{
                  background: "#E8F5F5",
                  color: "#2D6B6B",
                  border: "1px solid #B8DEDE",
                }}
              >
                <p>
                  🌐 Paste the webhook URL into your website's contact form
                  handler. New submissions appear in Lead Management in real
                  time.
                </p>
              </div>

              <Button
                size="sm"
                onClick={saveWebsite}
                disabled={savingWebsite}
                style={{ background: "#4F8F92" }}
                data-ocid="integrations.website.save_button"
              >
                {savingWebsite ? (
                  <Loader2 size={13} className="mr-1.5 animate-spin" />
                ) : null}
                Save Secret
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
