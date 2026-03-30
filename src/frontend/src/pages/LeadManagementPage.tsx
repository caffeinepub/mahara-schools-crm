import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LeadDetailDrawer from "../components/LeadDetailDrawer";
import { useActor } from "../hooks/useActor";
import type { Lead, LeadStatus } from "../types";
import { leadFromBackend, leadToBackend } from "../utils/backendAdapters";

const STATUSES: LeadStatus[] = [
  "New Inquiry",
  "Qualified",
  "Campus Tour",
  "Application Sent",
  "Enrolled",
  "Rejected",
];
const SOURCES = ["Website", "Referral", "Social Media", "Exhibition"];
const AGENTS = ["Priya Sharma", "Rajan Kumar", "Anitha Reddy"];
const GRADES = [
  "Daycare (18M-7Y)",
  "Pre-Nursery (Age 2-3)",
  "Nursery (Age 3-4)",
  "KG I (Age 4-5)",
  "KG II (Age 5-6)",
  "Primary",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  "New Inquiry": "bg-blue-100 text-blue-700 border-blue-200",
  Qualified: "bg-purple-100 text-purple-700 border-purple-200",
  "Campus Tour": "bg-amber-100 text-amber-700 border-amber-200",
  "Application Sent": "bg-orange-100 text-orange-700 border-orange-200",
  Enrolled: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = ["#4F8F92", "#7B9E87", "#9B7BAE", "#C67B5C", "#5B7FAE"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

const EMPTY: Lead = {
  id: "",
  name: "",
  email: "",
  phone: "",
  gradeLevel: "Daycare (18M-7Y)",
  source: "Website",
  status: "New Inquiry",
  assignedAgent: "Priya Sharma",
  notes: "",
  createdAt: "",
};

export default function LeadManagementPage() {
  const { actor } = useActor();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead>(EMPTY);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getLeads()
      .then((ls) => setLeads(ls.map(leadFromBackend)))
      .catch(() => toast.error("Failed to load leads"))
      .finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      const matchSource = filterSource === "all" || l.source === filterSource;
      const matchAgent =
        filterAgent === "all" || l.assignedAgent === filterAgent;
      return matchSearch && matchStatus && matchSource && matchAgent;
    });
  }, [leads, search, filterStatus, filterSource, filterAgent]);

  function openNew() {
    setEditing({
      ...EMPTY,
      id: `l${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setIsNew(true);
    setDialogOpen(true);
  }

  function openEdit(lead: Lead, e: React.MouseEvent) {
    e.stopPropagation();
    setEditing({ ...lead });
    setIsNew(false);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addLead(leadToBackend(editing));
        toast.success("Lead added!");
      } else {
        await actor.updateLead(leadToBackend(editing));
        toast.success("Lead updated!");
      }
      const updated = await actor.getLeads();
      setLeads(updated.map(leadFromBackend));
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save lead");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setDeleteId(null);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="leads.loading_state">
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
            data-ocid="leads.search_input"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            className="w-40 h-9 text-sm"
            data-ocid="leads.status.select"
          >
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
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger
            className="w-36 h-9 text-sm"
            data-ocid="leads.source.select"
          >
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger
            className="w-40 h-9 text-sm"
            data-ocid="leads.agent.select"
          >
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {AGENTS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-9 ml-auto"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="leads.add.primary_button"
        >
          <Plus size={14} className="mr-1" />
          Add Lead
        </Button>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <Table data-ocid="leads.table">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-muted-foreground py-10"
                    data-ocid="leads.empty_state"
                  >
                    No leads found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((lead, i) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedLead(lead)}
                  data-ocid={`leads.item.${i + 1}`}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className="text-[11px] font-semibold"
                          style={{
                            background: avatarColor(lead.name),
                            color: "white",
                          }}
                        >
                          {initials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{lead.gradeLevel}</TableCell>
                  <TableCell className="text-sm">{lead.source}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_BADGE[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.assignedAgent}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lead.createdAt.slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded hover:bg-green-50 transition-colors"
                        title="Call"
                        data-ocid={`leads.call.button.${i + 1}`}
                      >
                        <Phone size={13} className="text-green-600" />
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded hover:bg-green-50 transition-colors"
                        title="WhatsApp"
                        data-ocid={`leads.whatsapp.button.${i + 1}`}
                      >
                        <MessageCircle size={13} className="text-green-500" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => openEdit(lead, e)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        data-ocid={`leads.edit_button.${i + 1}`}
                      >
                        <Pencil size={13} className="text-muted-foreground" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(lead.id);
                        }}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        data-ocid={`leads.delete_button.${i + 1}`}
                      >
                        <Trash2 size={13} className="text-destructive" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LeadDetailDrawer
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdate={(updatedLead) =>
          setLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)),
          )
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="leads.dialog">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add New Lead" : "Edit Lead"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="leads.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={editing.email}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, email: e.target.value }))
                }
                data-ocid="leads.email.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                value={editing.phone}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="leads.phone.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Grade Level</Label>
              <Select
                value={editing.gradeLevel}
                onValueChange={(v) =>
                  setEditing((p) => ({ ...p, gradeLevel: v }))
                }
              >
                <SelectTrigger data-ocid="leads.grade.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select
                value={editing.source}
                onValueChange={(v) => setEditing((p) => ({ ...p, source: v }))}
              >
                <SelectTrigger data-ocid="leads.source_field.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={editing.status}
                onValueChange={(v) =>
                  setEditing((p) => ({ ...p, status: v as LeadStatus }))
                }
              >
                <SelectTrigger data-ocid="leads.status_field.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Assigned Agent</Label>
              <Select
                value={editing.assignedAgent}
                onValueChange={(v) =>
                  setEditing((p) => ({ ...p, assignedAgent: v }))
                }
              >
                <SelectTrigger data-ocid="leads.agent_field.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENTS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={editing.notes}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, notes: e.target.value }))
                }
                className="min-h-[70px] resize-none"
                data-ocid="leads.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="leads.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="leads.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="leads.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Lead?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="leads.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="leads.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
