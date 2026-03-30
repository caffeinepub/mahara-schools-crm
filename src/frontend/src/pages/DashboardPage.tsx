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
  CheckSquare,
  Edit2,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { backendInterface as FullBackend, Task } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { AuthUser, FollowUp, Lead, LeadStatus } from "../types";
import {
  followUpFromBackend,
  followUpToBackend,
  leadFromBackend,
} from "../utils/backendAdapters";
import CentreHeadDashboard from "./CentreHeadDashboard";

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
    "Hi! Thank you for your inquiry about Mahara Schools. We'd love to tell you more about our programmes and how we can support your child's early learning journey. Would you be available for a brief call this week?",
  Qualified:
    "Hello! Following up on our recent conversation — we think Mahara would be a great fit for your family. I'd love to schedule a campus tour at your convenience. Please let me know your preferred dates!",
  "Campus Tour":
    "Thank you for visiting our campus! It was wonderful meeting you. Based on your child's age, I've prepared our programme brochure. Are you ready to proceed with the application?",
  "Application Sent":
    "Your application is with our admissions team. We'll have a response within 3–5 working days. In the meantime, please feel free to reach out with any questions!",
  Enrolled:
    "Welcome to the Mahara Schools family! We're so excited to have your child with us. Your orientation kit will be sent shortly. Please don't hesitate to reach out.",
  Rejected:
    "Thank you for considering Mahara Schools. While we're unable to accommodate your request at this time, we warmly encourage you to reapply for the next term. We wish you all the best!",
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
  "#78C8C8",
  "#6BA3D6",
  "#B8A7CC",
  "#F4A8BE",
  "#A8CB48",
  "#F5C518",
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
  if (user.role === "CentreHead") {
    return <CentreHeadDashboard user={user} />;
  }
  return <FounderAdminDashboard user={user} />;
}

function FounderAdminDashboard({ user }: Props) {
  const { actor: _actor } = useActor();
  const actor = _actor as unknown as FullBackend | null;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiEditing, setAiEditing] = useState(false);
  const [aiSent, setAiSent] = useState(false);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getLeads(), actor.getFollowUps(), actor.getTasks()])
      .then(([ls, fus, tsks]) => {
        setLeads((ls as any).map(leadFromBackend));
        setFollowUps((fus as any).map(followUpFromBackend));
        setTasks(tsks);
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
  const tasksDueToday = tasks.filter(
    (t) => !t.completed && t.dueDate === today,
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
      await actor.updateFollowUp(followUpToBackend(updated) as any);
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
  const dateStr = now.toLocaleDateString("en-IN", {
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
        {user.role === "Founder" && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Mahara Schools — Kondapur & Bachupally, Hyderabad
          </p>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="dashboard.stats.panel"
      >
        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Enquiries
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {leads.length}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#E8F6F6" }}
              >
                <Users size={20} style={{ color: "#78C8C8" }} />
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
                    style={{ background: "#EEF7E0", color: "#5A8A1A" }}
                  >
                    +2.4%
                  </span>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#EEF7E0" }}
              >
                <TrendingUp size={20} style={{ color: "#A8CB48" }} />
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
                  background: followUpsDueToday > 0 ? "#FFF8E0" : "#EEF2FA",
                }}
              >
                <Calendar
                  size={20}
                  style={{
                    color: followUpsDueToday > 0 ? "#D4A017" : "#6BA3D6",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tasks Due Today
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {tasksDueToday}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: tasksDueToday > 0 ? "#FFF3E0" : "#FEF9E7",
                }}
              >
                <CheckSquare
                  size={20}
                  style={{ color: tasksDueToday > 0 ? "#F59E0B" : "#F5C518" }}
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
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "#78C8C8" }}
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
                    <div className="text-[10px] text-muted-foreground text-center py-4 italic">
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
                <Bot size={15} style={{ color: "#78C8C8" }} />
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
                      style={{ color: "#5A8A1A" }}
                      data-ocid="dashboard.ai_reply.success_state"
                    >
                      <Check size={14} /> Reply sent!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs text-white"
                        style={{
                          background:
                            "linear-gradient(90deg, #78C8C8, #6BA3D6)",
                        }}
                        onClick={handleSendReply}
                        data-ocid="dashboard.ai_reply.primary_button"
                      >
                        <Send size={12} className="mr-1" /> Send Reply
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
                          background: lead ? avatarColor(lead.name) : "#78C8C8",
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
