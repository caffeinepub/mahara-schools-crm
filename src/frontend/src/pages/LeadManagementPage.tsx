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
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const LEAD_FIELDS = [
  "name",
  "email",
  "phone",
  "gradeLevel",
  "source",
  "assignedAgent",
  "notes",
] as const;

const LEAD_FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  gradeLevel: "Grade Level",
  source: "Source",
  assignedAgent: "Assigned Agent",
  notes: "Notes",
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

function autoMapColumns(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of headers) {
    const lower = h.toLowerCase().trim();
    if (/\bname\b/.test(lower)) map.name = h;
    else if (/email/.test(lower)) map.email = h;
    else if (/phone|mobile|tel/.test(lower)) map.phone = h;
    else if (/grade/.test(lower)) map.gradeLevel = h;
    else if (/source/.test(lower)) map.source = h;
    else if (/agent/.test(lower)) map.assignedAgent = h;
    else if (/note/.test(lower)) map.notes = h;
  }
  return map;
}

function downloadTemplate() {
  const rows = [
    ["Name", "Email", "Phone", "Grade", "Source", "Agent", "Notes"],
    [
      "Aarav Sharma",
      "aarav@example.com",
      "+91 9876543210",
      "KG I (Age 4-5)",
      "Website",
      "Priya Sharma",
      "Interested in KG program",
    ],
    [
      "Diya Patel",
      "diya@example.com",
      "+91 9123456789",
      "Nursery (Age 3-4)",
      "Referral",
      "Rajan Kumar",
      "Parent called, wants campus tour",
    ],
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mahara_leads_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

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

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<
    "upload" | "map" | "importing" | "done"
  >("upload");
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importRows, setImportRows] = useState<any[][]>([]);
  const [importFieldMap, setImportFieldMap] = useState<Record<string, string>>(
    {},
  );
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileUpload(file: File) {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"' && !inQuote) {
            inQuote = true;
          } else if (line[i] === '"' && inQuote && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else if (line[i] === '"' && inQuote) {
            inQuote = false;
          } else if (line[i] === "," && !inQuote) {
            result.push(cur);
            cur = "";
          } else {
            cur += line[i];
          }
        }
        result.push(cur);
        return result;
      };
      const rows = lines.map(parseCSVLine);
      if (rows.length < 2) {
        toast.error("File is empty or has no data rows");
        return;
      }
      const headers = rows[0].map((h) => String(h || "").trim());
      const dataRows = rows
        .slice(1)
        .filter((r) => r.some((c) => c !== undefined && c !== ""));
      setImportHeaders(headers);
      setImportRows(dataRows);
      setImportFieldMap(autoMapColumns(headers));
      setImportStep("map");
    } catch {
      toast.error("Failed to parse file. Please use a valid .csv file.");
    }
  }

  async function handleImport() {
    if (!actor) return;
    setImportStep("importing");
    setImportProgress({ done: 0, total: importRows.length });
    let done = 0;
    let failed = 0;
    for (const row of importRows) {
      const getValue = (field: string) => {
        const colName = importFieldMap[field];
        if (!colName) return "";
        const idx = importHeaders.indexOf(colName);
        return idx >= 0 ? String(row[idx] ?? "").trim() : "";
      };
      const lead: Lead = {
        id: `imp${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
        name: getValue("name") || "Unknown",
        email: getValue("email"),
        phone: getValue("phone"),
        gradeLevel: getValue("gradeLevel") || "Daycare (18M-7Y)",
        source: getValue("source") || "Website",
        status: "New Inquiry",
        assignedAgent: getValue("assignedAgent") || "Priya Sharma",
        notes: getValue("notes"),
        createdAt: new Date().toISOString(),
      };
      try {
        await actor.addLead(leadToBackend(lead));
        done++;
      } catch {
        failed++;
      }
      setImportProgress({ done: done + failed, total: importRows.length });
    }
    const updated = await actor.getLeads();
    setLeads(updated.map(leadFromBackend));
    setImportStep("done");
    setImportProgress({ done, total: importRows.length });
    if (failed > 0) {
      toast.error(`${done} imported, ${failed} failed`);
    } else {
      toast.success(`${done} leads imported successfully!`);
    }
  }

  function resetImport() {
    setImportStep("upload");
    setImportHeaders([]);
    setImportRows([]);
    setImportFieldMap({});
    setImportProgress({ done: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5"
            onClick={() => {
              setImportOpen(true);
              resetImport();
            }}
            data-ocid="leads.import.secondary_button"
          >
            <FileSpreadsheet size={14} />
            Import CSV/Excel
          </Button>
          <Button
            size="sm"
            className="h-9"
            style={{ background: "#4F8F92" }}
            onClick={openNew}
            data-ocid="leads.add.primary_button"
          >
            <Plus size={14} className="mr-1" />
            Add Lead
          </Button>
        </div>
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

      {/* Add / Edit Lead Dialog */}
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

      {/* Delete Confirmation */}
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

      {/* Import CSV/Excel Dialog */}
      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) resetImport();
        }}
      >
        <DialogContent className="max-w-2xl" data-ocid="leads.import.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet size={18} style={{ color: "#4F8F92" }} />
              Import Leads from CSV / Excel
            </DialogTitle>
          </DialogHeader>

          {importStep === "upload" && (
            <div className="space-y-4 py-2">
              <button
                type="button"
                className="border-2 border-dashed border-border rounded-xl p-10 text-center w-full cursor-pointer hover:border-[#4F8F92]/60 hover:bg-[#EEF8F8]/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
                data-ocid="leads.import.dropzone"
              >
                <Upload
                  size={32}
                  className="mx-auto mb-3 text-muted-foreground"
                />
                <p className="text-sm font-semibold text-foreground">
                  Drop your file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .csv files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </button>
              <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Not sure of the format? Download our template:
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={downloadTemplate}
                  data-ocid="leads.import.download_button"
                >
                  <Download size={12} />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {importStep === "map" && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-semibold mb-1">
                  Map CSV Columns to Lead Fields
                </p>
                <p className="text-xs text-muted-foreground">
                  {importRows.length} data rows found. Map each lead field to a
                  column from your file.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LEAD_FIELDS.map((field) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs font-medium">
                      {LEAD_FIELD_LABELS[field]}
                    </Label>
                    <Select
                      value={importFieldMap[field] || "__none__"}
                      onValueChange={(v) =>
                        setImportFieldMap((prev) => ({
                          ...prev,
                          [field]: v === "__none__" ? "" : v,
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="-- skip --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- skip --</SelectItem>
                        {importHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {importRows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Preview (first 3 rows)
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40">
                        <tr>
                          {importHeaders.map((h) => (
                            <th
                              key={h}
                              className="px-3 py-1.5 text-left font-medium text-muted-foreground"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 3).map((row) => (
                          <tr
                            key={
                              String(row[0] ?? "") +
                              String(row[1] ?? "") +
                              String(row[2] ?? "")
                            }
                            className="border-t border-border"
                          >
                            {importHeaders.map((header) => (
                              <td
                                key={header}
                                className="px-3 py-1.5 text-foreground"
                              >
                                {String(
                                  row[importHeaders.indexOf(header)] ?? "",
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={resetImport}>
                  Back
                </Button>
                <Button
                  size="sm"
                  style={{ background: "#4F8F92" }}
                  onClick={handleImport}
                  disabled={!importFieldMap.name}
                  data-ocid="leads.import.submit_button"
                >
                  Import {importRows.length} Lead
                  {importRows.length !== 1 ? "s" : ""}
                </Button>
              </DialogFooter>
            </div>
          )}

          {importStep === "importing" && (
            <div className="py-8 space-y-4 text-center">
              <Loader2
                size={32}
                className="animate-spin mx-auto"
                style={{ color: "#4F8F92" }}
              />
              <p className="text-sm font-semibold">Importing leads...</p>
              <p className="text-xs text-muted-foreground">
                {importProgress.done} / {importProgress.total}
              </p>
              <Progress
                value={
                  importProgress.total > 0
                    ? (importProgress.done / importProgress.total) * 100
                    : 0
                }
                className="h-2 max-w-xs mx-auto"
              />
              <p className="text-xs text-muted-foreground">
                Please wait, do not close this window.
              </p>
            </div>
          )}

          {importStep === "done" && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-green-700">
                {importProgress.done} lead{importProgress.done !== 1 ? "s" : ""}{" "}
                imported successfully!
              </p>
              <p className="text-xs text-muted-foreground">
                Your leads are now available in the table.
              </p>
              <DialogFooter className="justify-center">
                <Button
                  style={{ background: "#4F8F92" }}
                  onClick={() => {
                    setImportOpen(false);
                    resetImport();
                  }}
                  data-ocid="leads.import.close_button"
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
