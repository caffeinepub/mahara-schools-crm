import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { Lead, LeadStatus } from "../types";
import { leadFromBackend } from "../utils/backendAdapters";

const STATUS_TEMPLATES: Record<LeadStatus, string[]> = {
  "New Inquiry": [
    "Hi {name}! Thank you for your inquiry about Mahara Schools. We'd love to share more about our programs. Would you be available for a brief call this week?",
    "Dear {name}, welcome! We received your inquiry and we're excited to help guide your child's educational journey. Can we schedule a quick 10-minute call?",
    "Hello {name}! Great to hear from you. Mahara Schools offers world-class education from Grade 1 to 12. Let me know the best time to connect!",
  ],
  Qualified: [
    "Hi {name}! Following our conversation — we believe Mahara would be an excellent fit. I'd love to arrange a campus tour at your convenience. What dates work for you?",
    "Dear {name}, thank you for your interest! Based on your requirements, our {grade} program is a perfect match. Shall we proceed with a campus visit?",
    "Hello {name}! Our admissions team has reviewed your profile and we're thrilled to move forward. When can we schedule your campus tour?",
  ],
  "Campus Tour": [
    "Hi {name}! Thank you for visiting our campus. It was wonderful to meet you! Based on your interests, I've attached our program brochure. Are you ready to proceed with the application?",
    "Dear {name}, we hope you enjoyed the tour! Our {grade} class has limited spots for the upcoming term. Would you like to begin the application process?",
    "Hello {name}! What a pleasure having your family visit us. We'd love to welcome your child to the Mahara community. Shall we get started on the enrollment paperwork?",
  ],
  "Application Sent": [
    "Hi {name}! Your application is currently with our admissions board. We'll have a decision within 5 business days. Feel free to reach out with any questions!",
    "Dear {name}, thank you for submitting your application. Our team is reviewing it carefully. We'll notify you as soon as a decision is made!",
    "Hello {name}! We've received your completed application — great news! Our board meets every Tuesday and we'll be in touch shortly with an update.",
  ],
  Enrolled: [
    "Welcome to the Mahara Schools family, {name}! 🎉 We're thrilled to have your child with us. Your orientation package will be sent within 24 hours.",
    "Dear {name}, congratulations on your enrollment! We can't wait to see your child thrive at Mahara. Please check your email for the welcome pack and next steps.",
    "Hi {name}! This is such exciting news — your child is officially a Mahara student! Our team will reach out to schedule the orientation session.",
  ],
  Rejected: [
    "Dear {name}, thank you sincerely for considering Mahara Schools. While we're unable to accommodate at this time, we warmly encourage you to reapply for the next academic year.",
    "Hi {name}, we truly appreciate your interest in Mahara. Unfortunately, we don't have availability in {grade} at this stage. Please do stay in touch for future opportunities.",
    "Dear {name}, it was a pleasure getting to know your family. We hope to welcome you in a future term. Please don't hesitate to reach out if anything changes.",
  ],
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  "New Inquiry": "bg-blue-100 text-blue-700 border-blue-200",
  Qualified: "bg-purple-100 text-purple-700 border-purple-200",
  "Campus Tour": "bg-amber-100 text-amber-700 border-amber-200",
  "Application Sent": "bg-orange-100 text-orange-700 border-orange-200",
  Enrolled: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

const AVATAR_COLORS = [
  "#4F8F92",
  "#7B9E87",
  "#9B7BAE",
  "#C67B5C",
  "#5B7FAE",
  "#AE7B9B",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fillTemplate(template: string, lead: Lead): string {
  return template
    .replace(/{name}/g, lead.name.split(" ")[0])
    .replace(/{grade}/g, lead.gradeLevel);
}

const STATUSES: LeadStatus[] = [
  "New Inquiry",
  "Qualified",
  "Campus Tour",
  "Application Sent",
  "Enrolled",
  "Rejected",
];

type CustomTemplate = { id: string; name: string; content: string };

export default function AIReplyPage() {
  const { actor } = useActor();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Custom templates
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");

  useEffect(() => {
    if (!actor) return;
    actor
      .getLeads()
      .then((ls) => {
        const mapped = ls.map(leadFromBackend);
        setLeads(mapped);
        if (mapped.length > 0) {
          const first = mapped
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
          setSelectedLead(first);
          setMessage(fillTemplate(STATUS_TEMPLATES[first.status][0], first));
          setTemplateIndex(0);
        }
      })
      .catch(() => toast.error("Failed to load leads"))
      .finally(() => setLoading(false));
  }, [actor]);

  function selectLead(lead: Lead) {
    setSelectedLead(lead);
    setTemplateIndex(0);
    setMessage(fillTemplate(STATUS_TEMPLATES[lead.status][0], lead));
    setEditing(false);
  }

  function cycleTemplate() {
    if (!selectedLead) return;
    const templates = STATUS_TEMPLATES[selectedLead.status];
    const next = (templateIndex + 1) % templates.length;
    setTemplateIndex(next);
    setMessage(fillTemplate(templates[next], selectedLead));
    setEditing(false);
  }

  function applyCustomTemplate(t: CustomTemplate) {
    if (!selectedLead) return;
    setMessage(fillTemplate(t.content, selectedLead));
    setEditing(false);
  }

  function handleSend() {
    if (!selectedLead) return;
    setSent((prev) => new Set(prev).add(selectedLead.id));
    toast.success(`Reply sent to ${selectedLead.name.split(" ")[0]}!`);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function addCustomTemplate() {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;
    setCustomTemplates((prev) => [
      ...prev,
      {
        id: `ct${Date.now()}`,
        name: newTemplateName.trim(),
        content: newTemplateContent.trim(),
      },
    ]);
    setNewTemplateName("");
    setNewTemplateContent("");
    setShowNewTemplate(false);
    toast.success("Template saved!");
  }

  function deleteCustomTemplate(id: string) {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-120px)]">
        <div className="space-y-3">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
        <Skeleton className="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-120px)]">
      {/* Lead List */}
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="space-y-2 flex-shrink-0">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No leads found
            </p>
          )}
          {filtered.map((lead) => {
            const isSent = sent.has(lead.id);
            const isSelected = selectedLead?.id === lead.id;
            return (
              <button
                type="button"
                key={lead.id}
                onClick={() => selectLead(lead)}
                className={`w-full text-left rounded-xl p-3 transition-all border ${
                  isSelected
                    ? "border-[#4F8F92] bg-[#EEF8F8]"
                    : "border-border bg-white hover:border-[#4F8F92]/40 hover:bg-[#EEF8F8]/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className="text-[11px] font-bold"
                      style={{
                        background: avatarColor(lead.name),
                        color: "white",
                      }}
                    >
                      {initials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold truncate">
                        {lead.name}
                      </p>
                      {isSent && (
                        <CheckCircle2
                          size={13}
                          className="text-green-500 flex-shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {lead.gradeLevel} · {lead.source}
                    </p>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${STATUS_COLORS[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reply Panel */}
      <div className="flex flex-col gap-4 overflow-hidden">
        {!selectedLead ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot
                size={40}
                className="mx-auto mb-3"
                style={{ color: "#4F8F92" }}
              />
              <p className="text-sm font-medium text-foreground">
                Select a lead to generate an AI reply
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Context-aware suggestions for every stage
              </p>
            </div>
          </div>
        ) : (
          <>
            <Card className="shadow-card border-border flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-5 flex-shrink-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        className="text-sm font-bold"
                        style={{
                          background: avatarColor(selectedLead.name),
                          color: "white",
                        }}
                      >
                        {initials(selectedLead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{selectedLead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLead.email} · {selectedLead.phone}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[selectedLead.status]}`}
                        >
                          {selectedLead.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedLead.gradeLevel}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          via {selectedLead.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">
                      <Bot
                        size={10}
                        className="mr-1"
                        style={{ color: "#4F8F92" }}
                      />
                      AI Suggested
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5"
                      onClick={cycleTemplate}
                    >
                      <RefreshCw size={11} />
                      New Suggestion
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reply Message
                  </Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    readOnly={!editing}
                    className={`flex-1 text-sm resize-none leading-relaxed ${
                      editing ? "border-[#4F8F92]" : "bg-muted/30"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Button
                    size="sm"
                    className="h-9 px-5 gap-1.5"
                    style={{ background: "#4F8F92" }}
                    onClick={handleSend}
                  >
                    {sent.has(selectedLead.id) ? (
                      <>
                        <Check size={13} /> Sent!
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Send Reply
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 gap-1.5"
                    onClick={handleCopy}
                  >
                    {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 gap-1.5"
                    onClick={() => setEditing((v) => !v)}
                  >
                    {editing ? (
                      <>
                        <X size={13} /> Done
                      </>
                    ) : (
                      <>
                        <Edit2 size={13} /> Edit
                      </>
                    )}
                  </Button>
                  {selectedLead.notes && (
                    <div className="ml-auto text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 max-w-xs truncate">
                      📝 {selectedLead.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Custom Templates */}
        <Card className="shadow-card border-border flex-shrink-0">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot size={15} style={{ color: "#4F8F92" }} />
                Custom Reply Templates
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => setShowNewTemplate((v) => !v)}
              >
                {showNewTemplate ? <X size={11} /> : <Plus size={11} />}
                {showNewTemplate ? "Cancel" : "New Template"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {showNewTemplate && (
              <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border">
                <Input
                  placeholder="Template name (e.g. Warm Welcome)"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="h-8 text-xs"
                />
                <Textarea
                  placeholder="Use {name} for lead name, {grade} for grade level"
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="min-h-[70px] text-xs resize-none"
                />
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  style={{ background: "#4F8F92" }}
                  onClick={addCustomTemplate}
                  disabled={
                    !newTemplateName.trim() || !newTemplateContent.trim()
                  }
                >
                  Save Template
                </Button>
              </div>
            )}
            {customTemplates.length === 0 && !showNewTemplate && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No custom templates yet. Create one to reuse across leads.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {customTemplates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-1.5 bg-[#EEF8F8] border border-[#4F8F92]/30 rounded-lg px-2.5 py-1"
                >
                  <button
                    type="button"
                    className="text-xs font-medium text-[#4F8F92] hover:underline"
                    onClick={() => applyCustomTemplate(t)}
                  >
                    {t.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomTemplate(t.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
