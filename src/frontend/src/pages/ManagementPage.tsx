import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Building2,
  Calendar,
  ChevronRight,
  Crown,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import StudentsTab from "../components/StudentsTab";
import { useActor } from "../hooks/useActor";
import type {
  AuthUser,
  Branch,
  LeadSource,
  StaffProfile,
  Teacher,
  TeamMember,
  UserAccount,
} from "../types";

const GRADES = [
  "Pre Nursery",
  "Nursery",
  "KG1",
  "KG2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

// ---- Staff Hierarchy ----
function StaffHierarchyTab() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StaffProfile | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [_addBranchId, setAddBranchId] = useState("");
  const [addRole, setAddRole] = useState("Teacher");
  const [editingProfile, setEditingProfile] = useState<StaffProfile>({
    id: "",
    name: "",
    designation: "",
    contactNumber: "",
    branchId: "",
    role: "Teacher",
    dailyActivities: "",
    notes: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getStaffProfiles(), actor.getBranches()])
      .then(([profiles, bs]: [StaffProfile[], Branch[]]) => {
        setStaffProfiles(profiles ?? []);
        setBranches(bs ?? []);
      })
      .catch(() => toast.error("Failed to load staff profiles"))
      .finally(() => setLoading(false));
  }, [actor]);

  function branchName(id: string) {
    return branches.find((b) => b.id === id)?.name ?? id;
  }

  function openAdd(branchId: string, role: string) {
    setAddBranchId(branchId);
    setAddRole(role);
    setEditingProfile({
      id: "",
      name: "",
      designation: role === "CentreHead" ? "Centre Head" : "Class Teacher",
      contactNumber: "",
      branchId,
      role,
      dailyActivities: "",
      notes: "",
      email: "",
    });
    setIsEditMode(false);
    setAddOpen(true);
  }

  function openEdit(sp: StaffProfile) {
    setEditingProfile({ ...sp });
    setIsEditMode(true);
    setAddOpen(true);
    setSelected(null);
  }

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isEditMode) {
        await actor.updateStaffProfile(editingProfile);
        toast.success("Staff profile updated");
      } else {
        await actor.addStaffProfile(editingProfile);
        toast.success("Staff member added");
      }
      const updated = await actor.getStaffProfiles();
      setStaffProfiles(updated);
      setAddOpen(false);
    } catch {
      toast.error("Failed to save staff profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteStaffProfile(id);
      setStaffProfiles((p) => p.filter((sp) => sp.id !== id));
      setSelected(null);
      toast.success("Staff member removed");
    } catch {
      toast.error("Failed to remove staff member");
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const centreHeads = (branchId: string) =>
    staffProfiles.filter(
      (sp) => sp.branchId === branchId && sp.role === "CentreHead",
    );
  const teachers = (branchId: string) =>
    staffProfiles.filter(
      (sp) => sp.branchId === branchId && sp.role === "Teacher",
    );

  return (
    <div className="space-y-4" data-ocid="hierarchy.panel">
      {/* Founder */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border-2"
        style={{ borderColor: "#4F8F92", background: "#F0F7F7" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#4F8F92" }}
        >
          <Crown size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">Ms. Manaswini Bandi</p>
          <p className="text-xs text-muted-foreground">
            Founder &amp; Digital Marketing
          </p>
        </div>
        <Badge
          className="ml-auto text-[10px]"
          style={{ background: "#4F8F92" }}
        >
          Founder
        </Badge>
      </div>

      {/* Branches with Centre Heads and Teachers */}
      <div className="ml-4 space-y-5">
        {branches.map((branch, bi) => (
          <div
            key={branch.id}
            className="space-y-2"
            data-ocid={`hierarchy.branch.item.${bi + 1}`}
          >
            {/* Branch label */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-px bg-border" />
              <ChevronRight size={12} className="text-muted-foreground" />
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#E8F4F4", color: "#3A8A8D" }}
              >
                {branch.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                — {branch.location}
              </span>
            </div>

            {/* Centre Heads */}
            <div className="ml-6 space-y-1.5">
              {centreHeads(branch.id).map((sp, ci) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelected(sp)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg border bg-card shadow-xs hover:bg-muted/30 transition-colors"
                  data-ocid={`hierarchy.centrehead.item.${ci + 1}`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#6EA9AA" }}
                  >
                    <Building2 size={15} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{sp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sp.designation}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Centre Head
                  </Badge>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              ))}
              {centreHeads(branch.id).length === 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    No centre head assigned
                  </p>
                  <button
                    type="button"
                    onClick={() => openAdd(branch.id, "CentreHead")}
                    className="text-xs text-teal-600 underline hover:no-underline"
                  >
                    + Assign
                  </button>
                </div>
              )}
            </div>

            {/* Teachers */}
            <div className="ml-10 space-y-1.5">
              {teachers(branch.id).map((sp, ti) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelected(sp)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  data-ocid={`hierarchy.teacher.item.${ti + 1}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: "#7B9E87" }}
                  >
                    {sp.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{sp.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {sp.designation}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Teacher
                  </Badge>
                  <ChevronRight size={12} className="text-muted-foreground" />
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAdd(branch.id, "Teacher")}
                className="text-xs h-7 border-dashed"
              >
                <Plus size={11} className="mr-1" /> Add Teacher
              </Button>
            </div>

            {/* Add Centre Head button if none exist */}
            {centreHeads(branch.id).length < 1 ? null : (
              <div className="ml-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAdd(branch.id, "CentreHead")}
                  className="text-xs h-7 border-dashed"
                >
                  <Plus size={11} className="mr-1" /> Add Centre Head
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {branches.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No branches configured.
        </p>
      )}

      {/* Staff Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-[380px] sm:max-w-[420px] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{
                      background:
                        selected.role === "CentreHead" ? "#6EA9AA" : "#7B9E87",
                    }}
                  >
                    {selected.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <SheetTitle className="text-base">
                      {selected.name}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {selected.designation}
                    </p>
                    <Badge
                      className="text-[10px] mt-1"
                      style={{
                        background:
                          selected.role === "CentreHead"
                            ? "#6EA9AA"
                            : "#7B9E87",
                      }}
                    >
                      {selected.role === "CentreHead"
                        ? "Centre Head"
                        : "Teacher"}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-4 py-4">
                {/* Branch */}
                <div className="flex items-start gap-2">
                  <Building2
                    size={15}
                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Branch
                    </p>
                    <p className="text-sm">{branchName(selected.branchId)}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-start gap-2">
                  <Phone
                    size={15}
                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Contact
                    </p>
                    <p className="text-sm">{selected.contactNumber || "—"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-2">
                  <Mail
                    size={15}
                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm">{selected.email || "—"}</p>
                  </div>
                </div>

                {/* Daily Activities */}
                <div className="flex items-start gap-2">
                  <Calendar
                    size={15}
                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Daily Activities
                    </p>
                    <div className="mt-1 space-y-1">
                      {selected.dailyActivities ? (
                        (selected.dailyActivities ?? "")
                          .split(",")
                          .filter(Boolean)
                          .map((act) => (
                            <p
                              key={act.trim().slice(0, 30)}
                              className="text-sm leading-relaxed"
                            >
                              • {act.trim()}
                            </p>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No activities listed
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="flex items-start gap-2">
                    <UserCircle
                      size={15}
                      className="text-muted-foreground mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Notes
                      </p>
                      <p className="text-sm">{selected.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(selected)}
                  className="flex-1"
                >
                  <Pencil size={13} className="mr-1" /> Edit Profile
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(selected.id)}
                  className="flex-1"
                >
                  <Trash2 size={13} className="mr-1" /> Remove
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Edit Staff Profile"
                : `Add ${addRole === "CentreHead" ? "Centre Head" : "Teacher"}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editingProfile.name}
                onChange={(e) =>
                  setEditingProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Designation</Label>
              <Input
                placeholder="e.g. Class Teacher — Nursery"
                value={editingProfile.designation}
                onChange={(e) =>
                  setEditingProfile((p) => ({
                    ...p,
                    designation: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Number</Label>
              <Input
                placeholder="+91 98xxx-xxxxx"
                value={editingProfile.contactNumber}
                onChange={(e) =>
                  setEditingProfile((p) => ({
                    ...p,
                    contactNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="name@maharaschools.com"
                value={editingProfile.email}
                onChange={(e) =>
                  setEditingProfile((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select
                value={editingProfile.role}
                onValueChange={(v) =>
                  setEditingProfile((p) => ({ ...p, role: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CentreHead">Centre Head</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Branch</Label>
              <Select
                value={editingProfile.branchId}
                onValueChange={(v) =>
                  setEditingProfile((p) => ({ ...p, branchId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Daily Activities (comma-separated)
              </Label>
              <Textarea
                placeholder="9AM Assembly, 10AM English, 11AM Maths..."
                rows={3}
                value={editingProfile.dailyActivities}
                onChange={(e) =>
                  setEditingProfile((p) => ({
                    ...p,
                    dailyActivities: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                rows={2}
                value={editingProfile.notes}
                onChange={(e) =>
                  setEditingProfile((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- User Accounts Tab ----
function UserAccountsTab() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editing, setEditing] = useState<UserAccount>({
    id: "",
    username: "",
    password: "",
    role: "Teacher",
    fullName: "",
    email: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const ROLE_OPTIONS = [
    "Founder",
    "Admin",
    "CentreHead",
    "Teacher",
    "Agent",
    "Parent",
  ];
  const ROLE_COLORS: Record<string, string> = {
    Founder: "#4F8F92",
    Admin: "#6EA9AA",
    CentreHead: "#7B9E87",
    Teacher: "#9B7BAE",
    Agent: "#C67B5C",
    Parent: "#5B7FAE",
  };

  useEffect(() => {
    if (!actor) return;
    actor
      .getUserAccounts()
      .then((accs: UserAccount[]) => setAccounts(accs ?? []))
      .catch(() => toast.error("Failed to load user accounts"))
      .finally(() => setLoading(false));
  }, [actor]);

  function openNew() {
    setEditing({
      id: "",
      username: "",
      password: "",
      role: "Teacher",
      fullName: "",
      email: "",
    });
    setIsNew(true);
    setOpen(true);
  }

  function openEdit(a: UserAccount) {
    setEditing({ ...a });
    setIsNew(false);
    setOpen(true);
  }

  async function handleSave() {
    if (!actor) return;
    if (!editing.username || !editing.password || !editing.fullName) {
      toast.error("Username, password, and full name are required");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await actor.addUserAccount(editing);
        toast.success("User account created");
      } else {
        await actor.updateUserAccount(editing);
        toast.success("User account updated");
      }
      const updated = await actor.getUserAccounts();
      setAccounts(updated);
      setOpen(false);
    } catch {
      toast.error("Failed to save user account");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteUserAccount(id);
      setAccounts((p) => p.filter((a) => a.id !== id));
      setDeleteId(null);
      toast.success("User account deleted");
    } catch {
      toast.error("Failed to delete user account");
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Create and manage login credentials for all staff.
        </p>
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="accounts.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Create Account
        </Button>
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No custom accounts yet. Create one to give staff a login.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {accounts.map((a, i) => (
          <Card
            key={a.id}
            className="shadow-xs"
            data-ocid={`accounts.item.${i + 1}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: ROLE_COLORS[a.role] ?? "#4F8F92" }}
              >
                {a.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{a.fullName}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge
                    className="text-[10px]"
                    style={{ background: ROLE_COLORS[a.role] ?? "#4F8F92" }}
                  >
                    {a.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    @{a.username}
                  </span>
                  {a.email && (
                    <span className="text-xs text-muted-foreground">
                      {a.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="p-1.5 rounded hover:bg-muted"
                  data-ocid={`accounts.edit_button.${i + 1}`}
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(a.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                  data-ocid={`accounts.delete_button.${i + 1}`}
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" data-ocid="accounts.dialog">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Create User Account" : "Edit User Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editing.fullName}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Ms. Example Name"
                data-ocid="accounts.fullName.input"
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
                placeholder="name@maharaschools.com"
                data-ocid="accounts.email.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Username (for login)</Label>
              <Input
                value={editing.username}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="e.g. teacher4"
                data-ocid="accounts.username.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Password</Label>
              <Input
                type="text"
                value={editing.password}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Set a password"
                data-ocid="accounts.password.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select
                value={editing.role}
                onValueChange={(v) => setEditing((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger data-ocid="accounts.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
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
              data-ocid="accounts.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="accounts.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {isNew ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Account?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the login permanently.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
      setBranches((await actor.getBranches()) as Branch[]);
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
      setBranches((p) => p.filter((b) => b.id !== id));
      setDeleteId(null);
      toast.success("Branch deleted");
    } catch {
      toast.error("Failed to delete branch");
    }
  }

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );

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
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
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
        <DialogContent className="max-w-sm">
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
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input
                value={editing.location}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, location: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Branch?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
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
      setSources((await actor.getLeadSources()) as LeadSource[]);
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
      setSources((p) => p.filter((s) => s.id !== id));
      setDeleteId(null);
      toast.success("Source deleted");
    } catch {
      toast.error("Failed to delete source");
    }
  }

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );

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
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
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
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(s.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
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
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Source?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
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
      setMembers((await actor.getTeamMembers()) as TeamMember[]);
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
      setMembers((p) => p.filter((m) => m.id !== id));
      setDeleteId(null);
      toast.success("Team member removed");
    } catch {
      toast.error("Failed to remove team member");
    }
  }

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );

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
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
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
        <DialogContent className="max-w-sm">
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
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select
                value={editing.role}
                onValueChange={(v) => setEditing((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Teachers Tab ----
function TeachersTab() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher>({
    id: "",
    username: "",
    name: "",
    branchId: "",
    grade: "Nursery",
    subjects: "",
  });
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getAllTeachers(), actor.getBranches()])
      .then(([ts, bs]: [Teacher[], Branch[]]) => {
        setTeachers(ts ?? []);
        setBranches(bs ?? []);
      })
      .catch(() => toast.error("Failed to load teachers"))
      .finally(() => setLoading(false));
  }, [actor]);

  function branchName(id: string) {
    return branches.find((b) => b.id === id)?.name ?? id;
  }
  function openNew() {
    setEditing({
      id: `tc${Date.now()}`,
      username: "",
      name: "",
      branchId: branches[0]?.id ?? "",
      grade: "Nursery",
      subjects: "",
    });
    setIsNew(true);
    setOpen(true);
  }
  function openEdit(t: Teacher) {
    setEditing({ ...t });
    setIsNew(false);
    setOpen(true);
  }
  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addTeacher(editing);
        toast.success("Teacher added");
      } else {
        await actor.updateTeacher(editing);
        toast.success("Teacher updated");
      }
      setTeachers(await actor.getAllTeachers());
      setOpen(false);
    } catch {
      toast.error("Failed to save teacher");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteTeacher(id);
      setTeachers((p) => p.filter((t) => t.id !== id));
      setDeleteId(null);
      toast.success("Teacher removed");
    } catch {
      toast.error("Failed to remove teacher");
    }
  }

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="teachers.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Add Teacher
        </Button>
      </div>
      {teachers.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No teachers yet.
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {teachers.map((t, i) => (
          <Card
            key={t.id}
            className="shadow-xs"
            data-ocid={`teachers.item.${i + 1}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "#4F8F92" }}
              >
                {t.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge variant="outline" className="text-[10px]">
                    {t.grade}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {branchName(t.branchId)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{t.username}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className="p-1.5 rounded hover:bg-muted"
                  data-ocid={`teachers.edit_button.${i + 1}`}
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(t.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                  data-ocid={`teachers.delete_button.${i + 1}`}
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Teacher" : "Edit Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Username (for login)</Label>
              <Input
                value={editing.username}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, username: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Branch</Label>
              <Select
                value={editing.branchId}
                onValueChange={(v) =>
                  setEditing((p) => ({ ...p, branchId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Grade / Class</Label>
              <Select
                value={editing.grade}
                onValueChange={(v) => setEditing((p) => ({ ...p, grade: v }))}
              >
                <SelectTrigger>
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
              <Label className="text-xs">Subjects</Label>
              <Input
                placeholder="e.g. Maths, English, Science"
                value={editing.subjects}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, subjects: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Teacher?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Main Page ----
interface Props {
  user: AuthUser;
}

export default function ManagementPage({ user }: Props) {
  const isAdmin = user.role === "Founder" || user.role === "Admin";

  return (
    <div className="space-y-4">
      <Tabs defaultValue="hierarchy" data-ocid="management.tab">
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger
            value="hierarchy"
            className="text-sm"
            data-ocid="management.hierarchy.tab"
          >
            <Users size={13} className="mr-1" /> Staff Hierarchy
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="text-sm"
            data-ocid="management.teachers.tab"
          >
            <GraduationCap size={13} className="mr-1" /> Teachers
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="accounts"
              className="text-sm"
              data-ocid="management.accounts.tab"
            >
              <KeyRound size={13} className="mr-1" /> User Accounts
            </TabsTrigger>
          )}
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
          <TabsTrigger
            value="students"
            className="text-sm"
            data-ocid="management.students.tab"
          >
            <BookOpen size={13} className="mr-1" /> Students
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hierarchy" className="mt-4">
          <StaffHierarchyTab />
        </TabsContent>
        <TabsContent value="teachers" className="mt-4">
          <TeachersTab />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="accounts" className="mt-4">
            <UserAccountsTab />
          </TabsContent>
        )}
        <TabsContent value="branches" className="mt-4">
          <BranchesTab />
        </TabsContent>
        <TabsContent value="sources" className="mt-4">
          <LeadSourcesTab />
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <TeamMembersTab />
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          <StudentsTab user={user} />
        </TabsContent>
      </Tabs>

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
