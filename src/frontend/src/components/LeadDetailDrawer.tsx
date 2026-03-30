import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Building,
  Check,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  backendInterface as FullBackend,
  LeadActivity,
  LeadNote,
  Task,
} from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { Lead, LeadStatus } from "../types";
import { leadToBackend } from "../utils/backendAdapters";

const STATUSES: LeadStatus[] = [
  "New Inquiry",
  "Qualified",
  "Campus Tour",
  "Application Sent",
  "Enrolled",
  "Rejected",
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  "New Inquiry": "bg-blue-100 text-blue-700",
  Qualified: "bg-purple-100 text-purple-700",
  "Campus Tour": "bg-amber-100 text-amber-700",
  "Application Sent": "bg-orange-100 text-orange-700",
  Enrolled: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  "Stage Change": ArrowRight,
  "Campus Tour": Building,
  Enrolled: CheckCircle2,
  Note: StickyNote,
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = ["#78C8C8", "#6BA3D6", "#B8A7CC", "#F4A8BE", "#A8CB48"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

interface Props {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onLeadUpdate: (updated: Lead) => void;
}

export default function LeadDetailDrawer({
  lead,
  open,
  onClose,
  onLeadUpdate,
}: Props) {
  const { actor: _actor } = useActor();
  const actor = _actor as unknown as FullBackend | null;
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");

  // Activity form
  const [actType, setActType] = useState("Call");
  const [actDesc, setActDesc] = useState("");
  const [actBy, setActBy] = useState("");
  const [savingAct, setSavingAct] = useState(false);

  // Note form
  const [noteContent, setNoteContent] = useState("");
  const [noteBy, setNoteBy] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!lead || !actor || !open) return;
    setLoadingTab(true);
    Promise.all([
      actor.getActivitiesByLead(lead.id),
      actor.getNotesByLead(lead.id),
      actor.getTasksByLead(lead.id),
    ])
      .then(([acts, nts, tsks]) => {
        setActivities(acts);
        setNotes(nts);
        setTasks(tsks);
      })
      .catch(() => toast.error("Failed to load lead details"))
      .finally(() => setLoadingTab(false));
  }, [lead, actor, open]);

  async function handleMoveStage(newStage: string) {
    if (!lead || !actor) return;
    const updated: Lead = { ...lead, status: newStage as LeadStatus };
    try {
      await actor.updateLead(leadToBackend(updated) as any);
      onLeadUpdate(updated);
      toast.success(`Moved to ${newStage}`);
    } catch {
      toast.error("Failed to update stage");
    }
  }

  async function handleAddActivity() {
    if (!lead || !actor || !actDesc.trim()) return;
    setSavingAct(true);
    const activity: LeadActivity = {
      id: `act_${Date.now()}`,
      leadId: lead.id,
      activityType: actType,
      description: actDesc,
      performedBy: actBy,
      timestamp: new Date().toISOString(),
    };
    try {
      await actor.addLeadActivity(activity);
      setActivities((prev) => [activity, ...prev]);
      setActDesc("");
      setActBy("");
      toast.success("Activity logged");
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setSavingAct(false);
    }
  }

  async function handleDeleteActivity(id: string) {
    if (!actor) return;
    try {
      await actor.deleteLeadActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to delete activity");
    }
  }

  async function handleAddNote() {
    if (!lead || !actor || !noteContent.trim()) return;
    setSavingNote(true);
    const note: LeadNote = {
      id: `note_${Date.now()}`,
      leadId: lead.id,
      content: noteContent,
      createdBy: noteBy,
      createdAt: new Date().toISOString(),
    };
    try {
      await actor.addLeadNote(note);
      setNotes((prev) => [note, ...prev]);
      setNoteContent("");
      setNoteBy("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteNote(id: string) {
    if (!actor) return;
    try {
      await actor.deleteLeadNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Failed to delete note");
    }
  }

  async function handleCompleteTask(task: Task) {
    if (!actor) return;
    const updated = { ...task, completed: true };
    try {
      await actor.updateTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      toast.success("Task completed");
    } catch {
      toast.error("Failed to update task");
    }
  }

  async function handleDeleteTask(id: string) {
    if (!actor) return;
    try {
      await actor.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to delete task");
    }
  }

  if (!lead) return null;

  const whatsappNumber = lead.phone.replace(/[^0-9]/g, "");

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[480px] max-w-full p-0 flex flex-col"
        data-ocid="leads.detail.sheet"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback
                className="text-base font-bold"
                style={{ background: avatarColor(lead.name), color: "white" }}
              >
                {initials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-bold leading-tight">
                {lead.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    STATUS_BADGE[lead.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {lead.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {lead.gradeLevel}
                </span>
                {lead.assignedAgent && (
                  <span className="text-xs text-muted-foreground">
                    👤 {lead.assignedAgent}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-4">
            {/* Quick actions */}
            <div className="flex gap-2 flex-wrap">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#22c55e" }}
                data-ocid="leads.call.button"
              >
                <Phone size={13} /> Call
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#25D366" }}
                data-ocid="leads.whatsapp.button"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#6BA3D6" }}
                data-ocid="leads.email.button"
              >
                <Mail size={13} /> Email
              </a>
              <div className="flex-1 min-w-[120px]">
                <Select onValueChange={handleMoveStage}>
                  <SelectTrigger
                    className="h-7 text-xs"
                    data-ocid="leads.stage.select"
                  >
                    <SelectValue placeholder="Move Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.filter((s) => s !== lead.status).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full h-8">
                <TabsTrigger
                  value="activity"
                  className="flex-1 text-xs"
                  data-ocid="leads.activity.tab"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="flex-1 text-xs"
                  data-ocid="leads.notes.tab"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="flex-1 text-xs"
                  data-ocid="leads.tasks.tab"
                >
                  Tasks
                </TabsTrigger>
              </TabsList>

              {/* Activity Timeline */}
              <TabsContent value="activity" className="mt-3 space-y-3">
                {loadingTab ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : (
                  <>
                    <div className="space-y-2.5">
                      {activities.length === 0 && (
                        <p
                          className="text-xs text-muted-foreground text-center py-4"
                          data-ocid="leads.activity.empty_state"
                        >
                          No activities yet
                        </p>
                      )}
                      {activities.map((act, i) => {
                        const Icon =
                          ACTIVITY_ICONS[act.activityType] ?? MessageCircle;
                        return (
                          <div
                            key={act.id}
                            className="flex items-start gap-2.5"
                            data-ocid={`leads.activity.item.${i + 1}`}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: "#E8F6F6" }}
                            >
                              <Icon size={13} style={{ color: "#78C8C8" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold">
                                {act.activityType}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {act.description}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {act.performedBy && (
                                  <span className="text-[10px] text-muted-foreground">
                                    by {act.performedBy}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(act.timestamp).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(act.id)}
                              className="text-muted-foreground hover:text-red-500 flex-shrink-0"
                              data-ocid={`leads.activity.delete_button.${i + 1}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Log Activity form */}
                    <div className="border border-border rounded-lg p-3 space-y-2.5 bg-muted/30">
                      <p className="text-xs font-semibold">Log Activity</p>
                      <Select value={actType} onValueChange={setActType}>
                        <SelectTrigger
                          className="h-7 text-xs"
                          data-ocid="leads.activity_type.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(ACTIVITY_ICONS).map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={actDesc}
                        onChange={(e) => setActDesc(e.target.value)}
                        placeholder="Description..."
                        className="min-h-[50px] resize-none text-xs"
                        data-ocid="leads.activity_desc.textarea"
                      />
                      <Input
                        value={actBy}
                        onChange={(e) => setActBy(e.target.value)}
                        placeholder="Performed by..."
                        className="h-7 text-xs"
                        data-ocid="leads.activity_by.input"
                      />
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs text-white"
                        style={{ background: "#78C8C8" }}
                        onClick={handleAddActivity}
                        disabled={savingAct || !actDesc.trim()}
                        data-ocid="leads.log_activity.submit_button"
                      >
                        Log Activity
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes" className="mt-3 space-y-3">
                {loadingTab ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {notes.length === 0 && (
                        <p
                          className="text-xs text-muted-foreground text-center py-4"
                          data-ocid="leads.notes.empty_state"
                        >
                          No notes yet
                        </p>
                      )}
                      {notes.map((note, i) => (
                        <div
                          key={note.id}
                          className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                          data-ocid={`leads.notes.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-foreground flex-1">
                              {note.content}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-muted-foreground hover:text-red-500 flex-shrink-0"
                              data-ocid={`leads.notes.delete_button.${i + 1}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            {note.createdBy && (
                              <span className="text-[10px] text-muted-foreground">
                                {note.createdBy}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(note.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Note form */}
                    <div className="border border-border rounded-lg p-3 space-y-2.5 bg-muted/30">
                      <p className="text-xs font-semibold">Add Note</p>
                      <Textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write a note..."
                        className="min-h-[60px] resize-none text-xs"
                        data-ocid="leads.note_content.textarea"
                      />
                      <Input
                        value={noteBy}
                        onChange={(e) => setNoteBy(e.target.value)}
                        placeholder="Your name..."
                        className="h-7 text-xs"
                        data-ocid="leads.note_by.input"
                      />
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs text-white"
                        style={{ background: "#78C8C8" }}
                        onClick={handleAddNote}
                        disabled={savingNote || !noteContent.trim()}
                        data-ocid="leads.add_note.submit_button"
                      >
                        Save Note
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Tasks */}
              <TabsContent value="tasks" className="mt-3 space-y-2">
                {loadingTab ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : (
                  <>
                    {tasks.length === 0 && (
                      <p
                        className="text-xs text-muted-foreground text-center py-4"
                        data-ocid="leads.lead_tasks.empty_state"
                      >
                        No tasks for this lead
                      </p>
                    )}
                    {tasks.map((task, i) => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border border-border ${
                          task.completed ? "opacity-60" : ""
                        }`}
                        data-ocid={`leads.lead_tasks.item.${i + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                task.priority === "High"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : task.priority === "Medium"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-[10px] text-muted-foreground">
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {!task.completed && (
                            <button
                              type="button"
                              onClick={() => handleCompleteTask(task)}
                              className="text-muted-foreground hover:text-green-600"
                              data-ocid={`leads.lead_tasks.checkbox.${i + 1}`}
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-muted-foreground hover:text-red-500"
                            data-ocid={`leads.lead_tasks.delete_button.${i + 1}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
