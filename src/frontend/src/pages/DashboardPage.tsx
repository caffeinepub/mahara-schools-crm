import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Calendar,
  Check,
  Edit2,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { AuthUser, FollowUp, Lead, LeadStatus } from "../types";
import {
  followUpFromBackend,
  followUpToBackend,
  leadFromBackend,
} from "../utils/backendAdapters";

const PIPELINE_COLUMNS: LeadStatus[] = [
  "New Inquiry",
  "Qualified",
  "Campus Tour",
  "Application Sent",
  "Enrolled",
  "Rejected",
];

const AI_SUGGESTIONS: Record<LeadStatus, string> = {
  "New Inquiry":
    "Hi! Thank you for your inquiry about Mahara Schools. We'd love to tell you more about our programs and how we can support your child's education. Would you be available for a brief call this week?",
  Qualified:
    "Hello! Following up on our recent conversation — we think Mahara would be a great fit for your family. I'd love to schedule a campus tour at your convenience. Please let me know your preferred dates!",
  "Campus Tour":
    "Thank you for visiting our campus! It was wonderful meeting you. Based on your interests, I've attached our STEM program brochure. Are you ready to proceed with the application?",
  "Application Sent":
    "Your application is with our admissions board. We'll have a decision within 5 business days. In the meantime, feel free to reach out with any questions!",
  Enrolled:
    "Welcome to the Mahara Schools family! We're so excited to have you with us. Your orientation package will be sent shortly. Please don't hesitate to reach out.",
  Rejected:
    "Thank you for considering Mahara Schools. While we're unable to accommodate your request at this time, we encourage you to reapply for the next academic year. We wish you all the best!",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#4F8F92",
  "#7B9E87",
  "#9B7BAE",
  "#C67B5C",
  "#5B7FAE",
  "#AE7B9B",
];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface Props {
  user: AuthUser;
}

export default function DashboardPage({ user }: Props) {
  const { actor } = useActor();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiEditing, setAiEditing] = useState(false);
  const [aiSent, setAiSent] = useState(false);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getLeads(), actor.getFollowUps()])
      .then(([ls, fus]) => {
        setLeads(ls.map(leadFromBackend));
        setFollowUps(fus.map(followUpFromBackend));
      })
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, [actor]);

  const latestLead = useMemo(
    () =>
      leads.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [leads],
  );
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    if (latestLead) setMessage(AI_SUGGESTIONS[latestLead.status]);
  }, [latestLead]);

  const today = new Date().toISOString().slice(0, 10);
  const enrolled = leads.filter((l) => l.status === "Enrolled").length;
  const conversionRate =
    leads.length > 0 ? ((enrolled / leads.length) * 100).toFixed(0) : "0";
  const followUpsDueToday = followUps.filter(
    (f) => !f.completed && f.dueDate <= today,
  ).length;

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {} as Record<LeadStatus, Lead[]>;
    for (const col of PIPELINE_COLUMNS) map[col] = [];
    for (const lead of leads) {
      if (map[lead.status]) map[lead.status].push(lead);
    }
    return map;
  }, [leads]);

  const pendingFollowUps = followUps.filter((f) => !f.completed).slice(0, 5);

  async function handleMarkComplete(id: string) {
    if (!actor) return;
    const fu = followUps.find((f) => f.id === id);
    if (!fu) return;
    const updated = { ...fu, completed: true };
    try {
      await actor.updateFollowUp(followUpToBackend(updated));
      setFollowUps((prev) => prev.map((f) => (f.id === id ? updated : f)));
      toast.success("Follow-up marked complete");
    } catch {
      toast.error("Failed to update follow-up");
    }
  }

  function handleSendReply() {
    setAiSent(true);
    setAiEditing(false);
    toast.success("Reply sent successfully!");
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-AE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-6" data-ocid="dashboard.loading_state">
        <div>
          <Skeleton className="h-7 w-64 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {greeting}, {user.name}!
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-ocid="dashboard.stats.panel"
      >
        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Leads
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {leads.length}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#EEF8F8" }}
              >
                <Users size={20} style={{ color: "#4F8F92" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversion Rate
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[32px] font-bold text-foreground leading-none">
                    {conversionRate}%
                  </p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#DCFCE7", color: "#16A34A" }}
                  >
                    +2.4%
                  </span>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#EEF8F8" }}
              >
                <TrendingUp size={20} style={{ color: "#4F8F92" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Follow-ups Due Today
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {followUpsDueToday}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: followUpsDueToday > 0 ? "#FEF3C7" : "#EEF8F8",
                }}
              >
                <Calendar
                  size={20}
                  style={{
                    color: followUpsDueToday > 0 ? "#D97706" : "#4F8F92",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Lead Pipeline
          </h3>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            data-ocid="dashboard.pipeline.panel"
          >
            {PIPELINE_COLUMNS.map((col) => (
              <div
                key={col}
                className="flex-shrink-0 w-44 bg-muted/50 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-foreground">
                    {col}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#4F8F92", color: "white" }}
                  >
                    {grouped[col].length}
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[col].map((lead, i) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg p-2.5 shadow-xs"
                      data-ocid={`pipeline.${col.toLowerCase().replace(/ /g, "_")}.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback
                            className="text-[9px] font-bold"
                            style={{
                              background: avatarColor(lead.name),
                              color: "white",
                            }}
                          >
                            {initials(lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {lead.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {lead.gradeLevel}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {lead.source}
                      </div>
                    </div>
                  ))}
                  {grouped[col].length === 0 && (
                    <div
                      className="text-[10px] text-muted-foreground text-center py-4 italic"
                      data-ocid={`pipeline.${col.toLowerCase().replace(/ /g, "_")}.empty_state`}
                    >
                      No leads
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-72 flex-shrink-0 space-y-4">
          <Card
            className="shadow-card border-border"
            data-ocid="dashboard.ai_reply.card"
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot size={15} style={{ color: "#4F8F92" }} />
                AI-Suggested Reply
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {latestLead ? (
                <>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback
                        className="text-[9px]"
                        style={{
                          background: avatarColor(latestLead.name),
                          color: "white",
                        }}
                      >
                        {initials(latestLead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold">{latestLead.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {latestLead.status}
                      </p>
                    </div>
                  </div>
                  {aiEditing ? (
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="text-xs min-h-[90px] resize-none"
                      data-ocid="dashboard.ai_reply.textarea"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                      {message}
                    </p>
                  )}
                  {aiSent ? (
                    <div
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: "#16A34A" }}
                      data-ocid="dashboard.ai_reply.success_state"
                    >
                      <Check size={14} />
                      Reply sent!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        style={{ background: "#4F8F92" }}
                        onClick={handleSendReply}
                        data-ocid="dashboard.ai_reply.primary_button"
                      >
                        <Send size={12} className="mr-1" />
                        Send Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => setAiEditing((v) => !v)}
                        data-ocid="dashboard.ai_reply.secondary_button"
                      >
                        <Edit2 size={12} className="mr-1" />
                        {aiEditing ? "Done" : "Edit"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No leads yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card
            className="shadow-card border-border"
            data-ocid="dashboard.followup.card"
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Follow-up Tracking</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              {pendingFollowUps.length === 0 && (
                <p
                  className="text-xs text-muted-foreground text-center py-2"
                  data-ocid="dashboard.followup.empty_state"
                >
                  All caught up!
                </p>
              )}
              {pendingFollowUps.map((fu, i) => {
                const lead = leads.find((l) => l.id === fu.leadId);
                const overdue = fu.dueDate < today;
                return (
                  <div
                    key={fu.id}
                    className="flex items-center gap-2.5"
                    data-ocid={`followup.item.${i + 1}`}
                  >
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarFallback
                        className="text-[10px]"
                        style={{
                          background: lead ? avatarColor(lead.name) : "#4F8F92",
                          color: "white",
                        }}
                      >
                        {lead ? initials(lead.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {lead?.name ?? "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5"
                        >
                          {fu.followUpType}
                        </Badge>
                        <span
                          className={`text-[10px] ${
                            overdue
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {fu.dueDate}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkComplete(fu.id)}
                      className="w-5 h-5 rounded border border-border flex-shrink-0 flex items-center justify-center hover:bg-muted transition-colors"
                      data-ocid={`followup.checkbox.${i + 1}`}
                    >
                      <Check size={11} className="text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
