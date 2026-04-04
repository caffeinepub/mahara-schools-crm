import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  FileVideo,
  Image,
  Loader2,
  Megaphone,
  MessageCircle,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../store";
import type {
  Campaign,
  CampaignSend,
  CampaignStatus,
  CampaignTemplate,
  Lead,
} from "../types";
import {
  campaignFromBackend,
  campaignSendFromBackend,
  campaignTemplateFromBackend,
  campaignTemplateToBackend,
  campaignToBackend,
} from "../utils/backendAdapters";
import { leadFromBackend } from "../utils/backendAdapters";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Active: "bg-green-100 text-green-700 border-green-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
};

const MEDIA_TYPE_LABELS: Record<CampaignTemplate["mediaType"], string> = {
  none: "No Media",
  image: "Image",
  video: "Video",
  gif: "GIF",
  document: "Document",
};

const MEDIA_TYPE_BADGE: Record<CampaignTemplate["mediaType"], string> = {
  none: "bg-gray-100 text-gray-600",
  image: "bg-blue-100 text-blue-600",
  video: "bg-purple-100 text-purple-600",
  gif: "bg-pink-100 text-pink-600",
  document: "bg-amber-100 text-amber-600",
};

const EMPTY_CAMPAIGN: Campaign = {
  id: "",
  name: "",
  description: "",
  status: "Draft",
  createdAt: "",
};

const EMPTY_TEMPLATE: CampaignTemplate = {
  id: "",
  name: "",
  mediaType: "none",
  mediaUrl: "",
  messageText: "",
  createdAt: "",
};

// WhatsApp-style preview
function WhatsAppPreview({ template }: { template: CampaignTemplate }) {
  const previewText =
    template.messageText || "Your message will appear here...";
  return (
    <div
      className="rounded-xl overflow-hidden h-full min-h-[220px] flex flex-col"
      style={{ background: "#0b141a" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: "#1f2c34" }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "#4F8F92" }}
        >
          <Megaphone size={12} className="text-white" />
        </div>
        <span className="text-white text-xs font-medium">Mahara Schools</span>
        <span className="text-[10px] ml-auto" style={{ color: "#8696a0" }}>
          now
        </span>
      </div>
      {/* Chat area */}
      <div className="flex-1 px-3 py-3 flex justify-end">
        {/* Message bubble */}
        <div
          className="rounded-lg rounded-tr-sm max-w-[88%] overflow-hidden"
          style={{ background: "#005c4b" }}
        >
          {/* Media preview */}
          {(template.mediaType === "image" || template.mediaType === "gif") &&
            template.mediaUrl && (
              <img
                src={template.mediaUrl}
                alt="media"
                className="w-full object-cover max-h-32"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          {template.mediaType === "video" && (
            <div
              className="relative h-24 flex items-center justify-center"
              style={{ background: "#003d2e" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <Play size={16} className="text-white ml-0.5" />
              </div>
              {template.mediaUrl && (
                <span className="absolute bottom-1 right-2 text-[9px] text-white/60">
                  {template.mediaUrl.split("/").pop()}
                </span>
              )}
            </div>
          )}
          {template.mediaType === "document" && (
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ background: "#004d40" }}
            >
              <FileText size={16} className="text-white flex-shrink-0" />
              <span className="text-white text-xs truncate max-w-[120px]">
                {template.mediaUrl
                  ? template.mediaUrl.split("/").pop() || "document.pdf"
                  : "document.pdf"}
              </span>
            </div>
          )}
          {/* Message text */}
          <div className="px-3 py-2">
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: template.messageText ? "#e9edef" : "#6a7177" }}
            >
              {previewText}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[10px]" style={{ color: "#8696a0" }}>
                12:34
              </span>
              <span className="text-[10px]" style={{ color: "#53bdeb" }}>
                ✓✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const { actor } = useActor();
  // Cast to any to access campaign template/send methods not in the protected backend.ts interface
  const actorAny = actor as any;
  const [loading, setLoading] = useState(false);

  // Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sends, setSends] = useState<CampaignSend[]>([]);

  // Campaign dialog
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<Campaign>(EMPTY_CAMPAIGN);
  const [isNewCampaign, setIsNewCampaign] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<CampaignTemplate>(EMPTY_TEMPLATE);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  // Send dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendCampaignId, setSendCampaignId] = useState("");
  const [sendTemplateId, setSendTemplateId] = useState("");
  const [sendLeadIds, setSendLeadIds] = useState<string[]>([]);
  const [sendBy, setSendBy] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sendStep, setSendStep] = useState<"form" | "progress" | "done">(
    "form",
  );
  const [sendProgress, setSendProgress] = useState({ done: 0, total: 0 });
  const [leadSearch, setLeadSearch] = useState("");

  // WhatsApp integration config
  const [whatsappToken, setWhatsappToken] = useState("");
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);

  // History filter
  const [filterSendCampaign, setFilterSendCampaign] = useState("all");

  // biome-ignore lint/correctness/useExhaustiveDependencies: actorAny is derived from actor
  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([
      actor.getCampaigns(),
      actorAny.getIntegrationConfig(),
      actorAny.getCampaignTemplates(),
      actor.getLeads(),
      actorAny.getCampaignSends(),
    ])
      .then(([cs, ts, ls, ss, integCfg]) => {
        setCampaigns(cs.map(campaignFromBackend));
        setTemplates(ts.map(campaignTemplateFromBackend));
        setLeads(ls.map(leadFromBackend));
        setSends(ss.map(campaignSendFromBackend));
        if (integCfg?.whatsappAccessToken)
          setWhatsappToken(integCfg.whatsappAccessToken);
        const authUser = getAuthUser();
        setSendBy(authUser?.name || "");
      })
      .catch(() => toast.error("Failed to load campaigns data"))
      .finally(() => setLoading(false));
  }, [actor]);

  // Campaign CRUD
  function openNewCampaign() {
    setEditingCampaign({
      ...EMPTY_CAMPAIGN,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setIsNewCampaign(true);
    setCampaignDialogOpen(true);
  }
  function openEditCampaign(c: Campaign) {
    setEditingCampaign({ ...c });
    setIsNewCampaign(false);
    setCampaignDialogOpen(true);
  }
  async function handleSaveCampaign() {
    if (!actor) return;
    setSavingCampaign(true);
    try {
      if (isNewCampaign) {
        await actor.addCampaign(campaignToBackend(editingCampaign));
        toast.success("Campaign created!");
      } else {
        await actor.updateCampaign(campaignToBackend(editingCampaign));
        toast.success("Campaign updated!");
      }
      setCampaigns((await actor.getCampaigns()).map(campaignFromBackend));
      setCampaignDialogOpen(false);
    } catch {
      toast.error("Failed to save campaign");
    } finally {
      setSavingCampaign(false);
    }
  }
  async function handleDeleteCampaign(id: string) {
    if (!actor) return;
    try {
      await actor.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setDeleteCampaignId(null);
      toast.success("Campaign deleted");
    } catch {
      toast.error("Failed to delete campaign");
    }
  }

  // Template CRUD
  function openNewTemplate() {
    setEditingTemplate({
      ...EMPTY_TEMPLATE,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setIsNewTemplate(true);
    setTemplateDialogOpen(true);
  }
  function openEditTemplate(t: CampaignTemplate) {
    setEditingTemplate({ ...t });
    setIsNewTemplate(false);
    setTemplateDialogOpen(true);
  }
  async function handleSaveTemplate() {
    if (!actor) return;
    setSavingTemplate(true);
    try {
      if (isNewTemplate) {
        await actorAny.addCampaignTemplate(
          campaignTemplateToBackend(editingTemplate),
        );
        toast.success("Template saved!");
      } else {
        await actorAny.updateCampaignTemplate(
          campaignTemplateToBackend(editingTemplate),
        );
        toast.success("Template updated!");
      }
      setTemplates(
        (await actorAny.getCampaignTemplates()).map(
          campaignTemplateFromBackend,
        ),
      );
      setTemplateDialogOpen(false);
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  }
  async function handleDeleteTemplate(id: string) {
    if (!actor) return;
    try {
      await actorAny.deleteCampaignTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleteTemplateId(null);
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  }

  // Send campaign
  function openSendDialog() {
    setSendStep("form");
    setSendCampaignId("");
    setSendTemplateId("");
    setSendLeadIds([]);
    setSendNote("");
    setLeadSearch("");
    setSendDialogOpen(true);
  }

  async function handleSendViaWhatsApp(leadId: string) {
    if (!actor) return;
    if (!whatsappToken) {
      toast.error("Configure WhatsApp in Integrations → WhatsApp first.");
      return;
    }
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.phone) {
      toast.error("This lead has no phone number.");
      return;
    }
    const template = templates.find((t) => t.id === sendTemplateId);
    if (!template) {
      toast.error("Please select a template first.");
      return;
    }
    setSendingWhatsApp(leadId);
    try {
      const result = await actorAny.sendWhatsAppMessage(
        lead.phone,
        template.messageText,
      );
      if (result.success) {
        toast.success(`WhatsApp message sent to ${lead.name}!`);
        // Log to WhatsApp History
        try {
          await actorAny.addWhatsAppMessage({
            id: `wa-${Date.now()}-${leadId}`,
            leadId,
            leadName: lead.name,
            leadPhone: lead.phone,
            direction: "outbound",
            messageText: template.messageText,
            status: "sent",
            timestamp: new Date().toISOString(),
            messageId: "",
            campaignId: sendCampaignId || "",
          });
        } catch {
          /* non-critical */
        }
      } else {
        toast.error(`WhatsApp failed: ${result.message}`);
      }
    } catch {
      toast.error("Failed to send via WhatsApp");
    } finally {
      setSendingWhatsApp(null);
    }
  }

  async function handleSendCampaign() {
    if (
      !actor ||
      !sendCampaignId ||
      !sendTemplateId ||
      sendLeadIds.length === 0
    )
      return;
    setSendStep("progress");
    setSendProgress({ done: 0, total: sendLeadIds.length });
    let done = 0;
    for (const leadId of sendLeadIds) {
      const lead = leads.find((l) => l.id === leadId);
      const send: CampaignSend = {
        id: `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        campaignId: sendCampaignId,
        templateId: sendTemplateId,
        leadId,
        leadName: lead?.name || leadId,
        sentAt: new Date().toISOString(),
        sentBy: sendBy,
        note: sendNote,
      };
      try {
        await actorAny.addCampaignSend(send);
        // Log to WhatsApp History
        const tmpl = templates.find((t) => t.id === sendTemplateId);
        if (tmpl) {
          try {
            await actorAny.addWhatsAppMessage({
              id: `wa-${Date.now()}-${leadId}`,
              leadId,
              leadName: lead?.name || leadId,
              leadPhone: lead?.phone || "",
              direction: "outbound",
              messageText: tmpl.messageText,
              status: "sent",
              timestamp: new Date().toISOString(),
              messageId: "",
              campaignId: sendCampaignId,
            });
          } catch {
            /* non-critical */
          }
        }
        done++;
      } catch {
        // continue
      }
      setSendProgress({ done: done, total: sendLeadIds.length });
    }
    const updatedSends = await actorAny.getCampaignSends();
    setSends(updatedSends.map(campaignSendFromBackend));
    setSendStep("done");
    toast.success(`Campaign sent to ${done} lead${done !== 1 ? "s" : ""}!`);
  }

  const filteredLeadsInDialog = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
          l.email.toLowerCase().includes(leadSearch.toLowerCase()),
      ),
    [leads, leadSearch],
  );

  const filteredSends = useMemo(
    () =>
      sends.filter(
        (s) =>
          filterSendCampaign === "all" || s.campaignId === filterSendCampaign,
      ),
    [sends, filterSendCampaign],
  );

  function getCampaignName(id: string) {
    return campaigns.find((c) => c.id === id)?.name || id;
  }
  function getTemplateName(id: string) {
    return templates.find((t) => t.id === id)?.name || id;
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="campaigns.loading_state">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="campaigns" data-ocid="campaigns.tab">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="h-9">
            <TabsTrigger
              value="campaigns"
              className="text-xs"
              data-ocid="campaigns.campaigns.tab"
            >
              <Megaphone size={13} className="mr-1.5" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="text-xs"
              data-ocid="campaigns.templates.tab"
            >
              <FileText size={13} className="mr-1.5" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs"
              data-ocid="campaigns.history.tab"
            >
              <Send size={13} className="mr-1.5" />
              Send History
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              size="sm"
              style={{ background: "#4F8F92" }}
              onClick={openNewCampaign}
              data-ocid="campaigns.add.primary_button"
            >
              <Plus size={13} className="mr-1" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* ---- Campaigns Tab ---- */}
        <TabsContent value="campaigns" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
            </p>
          </div>

          {campaigns.length === 0 && (
            <Card className="shadow-card border-border">
              <CardContent
                className="py-16 text-center"
                data-ocid="campaigns.empty_state"
              >
                <Megaphone
                  size={32}
                  className="mx-auto text-muted-foreground mb-3"
                />
                <p className="text-sm text-muted-foreground">
                  No campaigns yet. Create your first one!
                </p>
              </CardContent>
            </Card>
          )}

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-ocid="campaigns.list"
          >
            {campaigns.map((c, i) => (
              <Card
                key={c.id}
                className="shadow-card border-border"
                data-ocid={`campaigns.item.${i + 1}`}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">
                      {c.name}
                    </CardTitle>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[c.status as CampaignStatus] ?? ""}`}
                    >
                      {c.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {c.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Created {c.createdAt.slice(0, 10)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEditCampaign(c)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        data-ocid={`campaigns.edit_button.${i + 1}`}
                      >
                        <Pencil size={13} className="text-muted-foreground" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCampaignId(c.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        data-ocid={`campaigns.delete_button.${i + 1}`}
                      >
                        <Trash2 size={13} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---- Templates Tab ---- */}
        <TabsContent value="templates" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              {templates.length} template{templates.length !== 1 ? "s" : ""}
            </p>
            <Button
              size="sm"
              style={{ background: "#4F8F92" }}
              onClick={openNewTemplate}
              data-ocid="campaigns.templates.add.primary_button"
            >
              <Plus size={13} className="mr-1" />
              New Template
            </Button>
          </div>

          {templates.length === 0 && (
            <Card className="shadow-card border-border">
              <CardContent
                className="py-16 text-center"
                data-ocid="campaigns.templates.empty_state"
              >
                <FileText
                  size={32}
                  className="mx-auto text-muted-foreground mb-3"
                />
                <p className="text-sm text-muted-foreground">
                  No templates yet. Create your first message template!
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t, i) => (
              <Card
                key={t.id}
                className="shadow-card border-border"
                data-ocid={`campaigns.templates.item.${i + 1}`}
              >
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-start justify-between gap-1">
                    <CardTitle className="text-sm font-semibold truncate">
                      {t.name}
                    </CardTitle>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${MEDIA_TYPE_BADGE[t.mediaType]}`}
                    >
                      {MEDIA_TYPE_LABELS[t.mediaType]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {t.mediaType === "image" || t.mediaType === "gif" ? (
                    <div className="h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {t.mediaUrl ? (
                        <img
                          src={t.mediaUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <Image size={20} className="text-muted-foreground" />
                      )}
                    </div>
                  ) : t.mediaType === "video" ? (
                    <div className="h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                      <FileVideo size={20} className="text-muted-foreground" />
                    </div>
                  ) : t.mediaType === "document" ? (
                    <div className="h-10 rounded bg-amber-50 flex items-center gap-2 px-3">
                      <FileText size={14} className="text-amber-600" />
                      <span className="text-xs text-amber-700 truncate">
                        {t.mediaUrl || "document"}
                      </span>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {t.messageText || "No message content."}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {t.createdAt.slice(0, 10)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEditTemplate(t)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        data-ocid={`campaigns.templates.edit_button.${i + 1}`}
                      >
                        <Pencil size={13} className="text-muted-foreground" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTemplateId(t.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        data-ocid={`campaigns.templates.delete_button.${i + 1}`}
                      >
                        <Trash2 size={13} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---- Send History Tab ---- */}
        <TabsContent value="history" className="mt-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Select
                value={filterSendCampaign}
                onValueChange={setFilterSendCampaign}
              >
                <SelectTrigger
                  className="h-8 w-48 text-xs"
                  data-ocid="campaigns.history.filter.select"
                >
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {filteredSends.length} records
              </span>
            </div>
            <Button
              size="sm"
              style={{ background: "#4F8F92" }}
              onClick={openSendDialog}
              data-ocid="campaigns.history.send.primary_button"
            >
              <Send size={13} className="mr-1" />
              Send Campaign
            </Button>
          </div>

          <Card className="shadow-card border-border">
            <CardContent className="p-0">
              {filteredSends.length === 0 ? (
                <div
                  className="py-16 text-center"
                  data-ocid="campaigns.history.empty_state"
                >
                  <Send
                    size={28}
                    className="mx-auto text-muted-foreground mb-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    No sends recorded yet.
                  </p>
                </div>
              ) : (
                <Table data-ocid="campaigns.history.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Lead</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Sent By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="pr-4">Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSends.map((s, i) => (
                      <TableRow
                        key={s.id}
                        data-ocid={`campaigns.history.item.${i + 1}`}
                      >
                        <TableCell className="pl-4 text-sm font-medium">
                          {s.leadName}
                        </TableCell>
                        <TableCell className="text-xs">
                          {getCampaignName(s.campaignId)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {getTemplateName(s.templateId)}
                        </TableCell>
                        <TableCell className="text-xs">{s.sentBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.sentAt.slice(0, 10)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground pr-4 max-w-[160px] truncate">
                          {s.note || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ---- Campaign Dialog ---- */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="campaigns.dialog">
          <DialogHeader>
            <DialogTitle>
              {isNewCampaign ? "New Campaign" : "Edit Campaign"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign Name</Label>
              <Input
                value={editingCampaign.name}
                onChange={(e) =>
                  setEditingCampaign((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Fall Enrollment 2026"
                data-ocid="campaigns.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={editingCampaign.description}
                onChange={(e) =>
                  setEditingCampaign((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                className="min-h-[80px] resize-none"
                placeholder="Brief campaign description..."
                data-ocid="campaigns.description.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={editingCampaign.status}
                onValueChange={(v) =>
                  setEditingCampaign((p) => ({
                    ...p,
                    status: v as CampaignStatus,
                  }))
                }
              >
                <SelectTrigger data-ocid="campaigns.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCampaignDialogOpen(false)}
              data-ocid="campaigns.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSaveCampaign}
              disabled={savingCampaign}
              data-ocid="campaigns.save_button"
            >
              {savingCampaign && (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              )}
              Save Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Campaign Dialog ---- */}
      <Dialog
        open={!!deleteCampaignId}
        onOpenChange={() => setDeleteCampaignId(null)}
      >
        <DialogContent className="max-w-sm" data-ocid="campaigns.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCampaignId(null)}
              data-ocid="campaigns.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteCampaignId && handleDeleteCampaign(deleteCampaignId)
              }
              data-ocid="campaigns.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Template Dialog ---- */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent
          className="max-w-3xl"
          data-ocid="campaigns.templates.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {isNewTemplate ? "New Message Template" : "Edit Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Welcome Message"
                  data-ocid="campaigns.templates.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Media Type</Label>
                <Select
                  value={editingTemplate.mediaType}
                  onValueChange={(v) =>
                    setEditingTemplate((p) => ({
                      ...p,
                      mediaType: v as CampaignTemplate["mediaType"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="campaigns.templates.media.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Media</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingTemplate.mediaType !== "none" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {editingTemplate.mediaType === "document"
                      ? "Document URL / Filename"
                      : "Media URL"}
                  </Label>
                  <Input
                    value={editingTemplate.mediaUrl}
                    onChange={(e) =>
                      setEditingTemplate((p) => ({
                        ...p,
                        mediaUrl: e.target.value,
                      }))
                    }
                    placeholder={
                      editingTemplate.mediaType === "image" ||
                      editingTemplate.mediaType === "gif"
                        ? "https://example.com/image.jpg"
                        : editingTemplate.mediaType === "video"
                          ? "https://example.com/video.mp4"
                          : "document.pdf"
                    }
                    data-ocid="campaigns.templates.mediaurl.input"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Message Text</Label>
                <p className="text-[10px] text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">{"{name}"}</code>{" "}
                  and <code className="bg-muted px-1 rounded">{"{grade}"}</code>{" "}
                  as placeholders
                </p>
                <Textarea
                  value={editingTemplate.messageText}
                  onChange={(e) =>
                    setEditingTemplate((p) => ({
                      ...p,
                      messageText: e.target.value,
                    }))
                  }
                  className="min-h-[140px] resize-none text-sm"
                  placeholder="Hi {name}! We're excited to share information about our {grade} programme at Mahara Schools..."
                  data-ocid="campaigns.templates.message.textarea"
                />
              </div>
            </div>
            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Live Preview
              </Label>
              <WhatsAppPreview template={editingTemplate} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
              data-ocid="campaigns.templates.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSaveTemplate}
              disabled={savingTemplate || !editingTemplate.name.trim()}
              data-ocid="campaigns.templates.save_button"
            >
              {savingTemplate && (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Template Dialog ---- */}
      <Dialog
        open={!!deleteTemplateId}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="campaigns.templates.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTemplateId(null)}
              data-ocid="campaigns.templates.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTemplateId && handleDeleteTemplate(deleteTemplateId)
              }
              data-ocid="campaigns.templates.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Send Campaign Dialog ---- */}
      <Dialog
        open={sendDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSendDialogOpen(false);
        }}
      >
        <DialogContent className="max-w-lg" data-ocid="campaigns.send.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send size={16} style={{ color: "#4F8F92" }} />
              Send Campaign
            </DialogTitle>
          </DialogHeader>

          {sendStep === "form" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Campaign</Label>
                <Select
                  value={sendCampaignId}
                  onValueChange={setSendCampaignId}
                >
                  <SelectTrigger data-ocid="campaigns.send.campaign.select">
                    <SelectValue placeholder="Select a campaign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Template</Label>
                <Select
                  value={sendTemplateId}
                  onValueChange={setSendTemplateId}
                >
                  <SelectTrigger data-ocid="campaigns.send.template.select">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}{" "}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({MEDIA_TYPE_LABELS[t.mediaType]})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Select Leads ({sendLeadIds.length} selected)
                </Label>
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search leads..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="pl-8 h-8 text-xs mb-2"
                    data-ocid="campaigns.send.lead_search.input"
                  />
                </div>
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  {filteredLeadsInDialog.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No leads found
                    </p>
                  ) : (
                    filteredLeadsInDialog.map((lead) => (
                      <label
                        key={lead.id}
                        htmlFor={`send-lead-${lead.id}`}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/30 cursor-pointer border-b border-border last:border-0"
                      >
                        <Checkbox
                          id={`send-lead-${lead.id}`}
                          checked={sendLeadIds.includes(lead.id)}
                          onCheckedChange={(checked) => {
                            setSendLeadIds((prev) =>
                              checked
                                ? [...prev, lead.id]
                                : prev.filter((id) => id !== lead.id),
                            );
                          }}
                          data-ocid="campaigns.send.lead.checkbox"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {lead.gradeLevel} · {lead.status}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-[#4F8F92] hover:underline"
                    onClick={() => setSendLeadIds(leads.map((l) => l.id))}
                  >
                    Select all
                  </button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={() => setSendLeadIds([])}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Sent By</Label>
                <Input
                  value={sendBy}
                  onChange={(e) => setSendBy(e.target.value)}
                  placeholder="Your name"
                  data-ocid="campaigns.send.sentby.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Note (optional)</Label>
                <Textarea
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                  placeholder="Add a note about this send..."
                  data-ocid="campaigns.send.note.textarea"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSendDialogOpen(false)}
                  data-ocid="campaigns.send.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  style={{ background: "#25D366" }}
                  onClick={() => {
                    if (sendLeadIds.length === 1) {
                      handleSendViaWhatsApp(sendLeadIds[0]);
                    } else {
                      toast.error(
                        "Select exactly one lead to send via WhatsApp.",
                      );
                    }
                  }}
                  disabled={
                    !sendCampaignId ||
                    !sendTemplateId ||
                    sendLeadIds.length !== 1 ||
                    !!sendingWhatsApp
                  }
                  data-ocid="campaigns.send.secondary_button"
                >
                  {sendingWhatsApp ? (
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                  ) : (
                    <MessageCircle size={13} className="mr-1.5" />
                  )}
                  Send via WhatsApp
                </Button>
                <Button
                  style={{ background: "#4F8F92" }}
                  onClick={handleSendCampaign}
                  disabled={
                    !sendCampaignId ||
                    !sendTemplateId ||
                    sendLeadIds.length === 0
                  }
                  data-ocid="campaigns.send.confirm_button"
                >
                  <Send size={13} className="mr-1.5" />
                  Send to {sendLeadIds.length} Lead
                  {sendLeadIds.length !== 1 ? "s" : ""}
                </Button>
              </DialogFooter>
            </div>
          )}

          {sendStep === "progress" && (
            <div
              className="py-8 space-y-4 text-center"
              data-ocid="campaigns.send.loading_state"
            >
              <Loader2
                size={32}
                className="animate-spin mx-auto"
                style={{ color: "#4F8F92" }}
              />
              <p className="text-sm font-semibold">Sending campaign...</p>
              <p className="text-xs text-muted-foreground">
                {sendProgress.done} / {sendProgress.total}
              </p>
              <Progress
                value={
                  sendProgress.total > 0
                    ? (sendProgress.done / sendProgress.total) * 100
                    : 0
                }
                className="h-2 max-w-xs mx-auto"
              />
            </div>
          )}

          {sendStep === "done" && (
            <div
              className="py-8 space-y-4 text-center"
              data-ocid="campaigns.send.success_state"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <span className="text-xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-green-700">
                Campaign sent to {sendProgress.done} lead
                {sendProgress.done !== 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-muted-foreground">
                All sends are recorded in Send History.
              </p>
              <DialogFooter className="justify-center">
                <Button
                  style={{ background: "#4F8F92" }}
                  onClick={() => setSendDialogOpen(false)}
                  data-ocid="campaigns.send.close_button"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
