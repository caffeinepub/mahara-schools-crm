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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Building2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { Branch, LeadSource, TeamMember } from "../types";

// ---- Branches ----
function BranchesTab() {
  const { actor } = useActor();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch>({
    id: "",
    name: "",
    location: "",
  });
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getBranches()
      .then((bs) => setBranches(bs as Branch[]))
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoading(false));
  }, [actor]);

  function openNew() {
    setEditing({ id: `b${Date.now()}`, name: "", location: "" });
    setIsNew(true);
    setOpen(true);
  }

  function openEdit(b: Branch) {
    setEditing({ ...b });
    setIsNew(false);
    setOpen(true);
  }

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addBranch(editing);
        toast.success("Branch added");
      } else {
        await actor.updateBranch(editing);
        toast.success("Branch updated");
      }
      const updated = await actor.getBranches();
      setBranches(updated as Branch[]);
      setOpen(false);
    } catch {
      toast.error("Failed to save branch");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteBranch(id);
      setBranches((prev) => prev.filter((b) => b.id !== id));
      setDeleteId(null);
      toast.success("Branch deleted");
    } catch {
      toast.error("Failed to delete branch");
    }
  }

  if (loading) {
    return (
      <div className="space-y-2" data-ocid="branches.loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="branches.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Add Branch
        </Button>
      </div>
      {branches.length === 0 && (
        <Card>
          <CardContent
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="branches.empty_state"
          >
            No branches yet.
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {branches.map((b, i) => (
          <Card
            key={b.id}
            className="shadow-xs"
            data-ocid={`branches.item.${i + 1}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Building2
                size={18}
                style={{ color: "#4F8F92" }}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.location}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(b)}
                  className="p-1.5 rounded hover:bg-muted"
                  data-ocid={`branches.edit_button.${i + 1}`}
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(b.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                  data-ocid={`branches.delete_button.${i + 1}`}
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" data-ocid="branches.dialog">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Branch" : "Edit Branch"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Branch Name</Label>
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="branches.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input
                value={editing.location}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, location: e.target.value }))
                }
                data-ocid="branches.location.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="branches.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="branches.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="branches.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Branch?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="branches.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="branches.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Lead Sources ----
function LeadSourcesTab() {
  const { actor } = useActor();
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeadSource>({ id: "", name: "" });
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getLeadSources()
      .then((ss) => setSources(ss as LeadSource[]))
      .catch(() => toast.error("Failed to load lead sources"))
      .finally(() => setLoading(false));
  }, [actor]);

  function openNew() {
    setEditing({ id: `s${Date.now()}`, name: "" });
    setIsNew(true);
    setOpen(true);
  }
  function openEdit(s: LeadSource) {
    setEditing({ ...s });
    setIsNew(false);
    setOpen(true);
  }

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addLeadSource(editing);
        toast.success("Source added");
      } else {
        await actor.updateLeadSource(editing);
        toast.success("Source updated");
      }
      const updated = await actor.getLeadSources();
      setSources(updated as LeadSource[]);
      setOpen(false);
    } catch {
      toast.error("Failed to save source");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteLeadSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      setDeleteId(null);
      toast.success("Source deleted");
    } catch {
      toast.error("Failed to delete source");
    }
  }

  if (loading) {
    return (
      <div className="space-y-2" data-ocid="sources.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="sources.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Add Source
        </Button>
      </div>
      {sources.length === 0 && (
        <Card>
          <CardContent
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="sources.empty_state"
          >
            No sources yet.
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {sources.map((s, i) => (
          <Card
            key={s.id}
            className="shadow-xs"
            data-ocid={`sources.item.${i + 1}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <BookOpen
                size={18}
                style={{ color: "#4F8F92" }}
                className="flex-shrink-0"
              />
              <p className="flex-1 text-sm font-medium">{s.name}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="p-1.5 rounded hover:bg-muted"
                  data-ocid={`sources.edit_button.${i + 1}`}
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(s.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                  data-ocid={`sources.delete_button.${i + 1}`}
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" data-ocid="sources.dialog">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Add Lead Source" : "Edit Lead Source"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label className="text-xs">Source Name</Label>
            <Input
              value={editing.name}
              onChange={(e) =>
                setEditing((p) => ({ ...p, name: e.target.value }))
              }
              data-ocid="sources.name.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="sources.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="sources.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="sources.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Source?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="sources.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="sources.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Team Members ----
function TeamMembersTab() {
  const { actor } = useActor();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember>({
    id: "",
    name: "",
    role: "",
    branchId: "b1",
  });
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const ROLES = [
    "Admissions Officer",
    "Senior Advisor",
    "Manager",
    "Support Staff",
  ];

  useEffect(() => {
    if (!actor) return;
    actor
      .getTeamMembers()
      .then((ms) => setMembers(ms as TeamMember[]))
      .catch(() => toast.error("Failed to load team members"))
      .finally(() => setLoading(false));
  }, [actor]);

  function openNew() {
    setEditing({
      id: `t${Date.now()}`,
      name: "",
      role: "Admissions Officer",
      branchId: "b1",
    });
    setIsNew(true);
    setOpen(true);
  }
  function openEdit(m: TeamMember) {
    setEditing({ ...m });
    setIsNew(false);
    setOpen(true);
  }

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addTeamMember(editing);
        toast.success("Team member added");
      } else {
        await actor.updateTeamMember(editing);
        toast.success("Team member updated");
      }
      const updated = await actor.getTeamMembers();
      setMembers(updated as TeamMember[]);
      setOpen(false);
    } catch {
      toast.error("Failed to save team member");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteTeamMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setDeleteId(null);
      toast.success("Team member removed");
    } catch {
      toast.error("Failed to remove team member");
    }
  }

  const COLORS = ["#4F8F92", "#7B9E87", "#9B7BAE", "#C67B5C", "#5B7FAE"];
  function avatarColor(name: string) {
    let h = 0;
    for (let i = 0; i < name.length; i++)
      h = name.charCodeAt(i) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
  }
  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (loading) {
    return (
      <div className="space-y-2" data-ocid="team.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="team.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Add Member
        </Button>
      </div>
      {members.length === 0 && (
        <Card>
          <CardContent
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="team.empty_state"
          >
            No team members yet.
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {members.map((m, i) => (
          <Card
            key={m.id}
            className="shadow-xs"
            data-ocid={`team.item.${i + 1}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: avatarColor(m.name) }}
              >
                {initials(m.name)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="p-1.5 rounded hover:bg-muted"
                  data-ocid={`team.edit_button.${i + 1}`}
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(m.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                  data-ocid={`team.delete_button.${i + 1}`}
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" data-ocid="team.dialog">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Add Team Member" : "Edit Team Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="team.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select
                value={editing.role}
                onValueChange={(v) => setEditing((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger data-ocid="team.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="team.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="team.delete.dialog">
          <DialogHeader>
            <DialogTitle>Remove Member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="team.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="team.delete.confirm_button"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ManagementPage() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="branches" data-ocid="management.tab">
        <TabsList className="h-9">
          <TabsTrigger
            value="branches"
            className="text-sm"
            data-ocid="management.branches.tab"
          >
            Branches
          </TabsTrigger>
          <TabsTrigger
            value="sources"
            className="text-sm"
            data-ocid="management.sources.tab"
          >
            Lead Sources
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="text-sm"
            data-ocid="management.team.tab"
          >
            Team Members
          </TabsTrigger>
        </TabsList>
        <TabsContent value="branches" className="mt-4">
          <BranchesTab />
        </TabsContent>
        <TabsContent value="sources" className="mt-4">
          <LeadSourcesTab />
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <TeamMembersTab />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="pt-8 pb-2 text-center">
        <p className="text-[11px] text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
