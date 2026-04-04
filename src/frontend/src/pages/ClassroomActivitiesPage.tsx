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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../store";

interface ClassActivity {
  id: string;
  classGrade: string;
  teacherId: string;
  teacherName: string;
  branchId: string;
  date: string;
  title: string;
  description: string;
  mediaUrls: string[];
  createdAt: string;
}

const GRADES = [
  "All",
  "Daycare",
  "Pre Nursery",
  "Nursery",
  "KG I",
  "KG II",
  "Primary",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
];

const GRADE_COLORS: Record<string, string> = {
  Daycare: "bg-pink-100 text-pink-700",
  "Pre Nursery": "bg-purple-100 text-purple-700",
  Nursery: "bg-blue-100 text-blue-700",
  "KG I": "bg-teal-100 text-teal-700",
  "KG II": "bg-green-100 text-green-700",
  Primary: "bg-yellow-100 text-yellow-700",
  "Grade 1": "bg-orange-100 text-orange-700",
  "Grade 2": "bg-red-100 text-red-700",
  "Grade 3": "bg-indigo-100 text-indigo-700",
  "Grade 4": "bg-cyan-100 text-cyan-700",
  "Grade 5": "bg-lime-100 text-lime-700",
};

export default function ClassroomActivitiesPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const user = getAuthUser();
  const canEdit =
    user?.role === "Founder" ||
    user?.role === "Admin" ||
    user?.role === "CentreHead" ||
    user?.role === "Teacher";

  const [activities, setActivities] = useState<ClassActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    classGrade: "",
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllClassActivities()
      .then((acts: ClassActivity[]) => setActivities(acts ?? []))
      .catch(() => toast.error("Failed to load activities"))
      .finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    let list = activities;
    if (gradeFilter !== "All")
      list = list.filter((a) => a.classGrade === gradeFilter);
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [activities, gradeFilter]);

  async function handleAdd() {
    if (!actor || !form.classGrade || !form.title || !form.date) return;
    setSaving(true);
    try {
      const activity: ClassActivity = {
        id: `act-${Date.now()}`,
        classGrade: form.classGrade,
        teacherId: user?.username ?? "",
        teacherName: user?.name ?? "",
        branchId: "",
        date: form.date,
        title: form.title,
        description: form.description,
        mediaUrls: [],
        createdAt: new Date().toISOString(),
      };
      await actor.addClassActivity(activity);
      const updated = await actor.getAllClassActivities();
      setActivities(updated ?? []);
      setAddOpen(false);
      setForm({
        classGrade: "",
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      toast.success("Activity added!");
    } catch {
      toast.error("Failed to add activity");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteClassActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success("Activity removed");
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data-ocid="activities.loading_state"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime-50 flex items-center justify-center">
            <Image className="w-5 h-5 text-lime-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Classroom Activities
            </h1>
            <p className="text-xs text-muted-foreground">
              Daily activities uploaded by teachers
            </p>
          </div>
        </div>
        {canEdit && (
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setAddOpen(true)}
            data-ocid="activities.open_modal_button"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        )}
      </div>

      {/* Grade filter tabs */}
      <div className="flex gap-1.5 flex-wrap" data-ocid="activities.tab">
        {GRADES.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              gradeFilter === g
                ? "bg-teal-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="activities.empty_state"
        >
          <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No activities yet</p>
          <p className="text-xs mt-1">
            Teachers can upload class activities here.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="activities.list"
        >
          {filtered.map((act, idx) => (
            <Card
              key={act.id}
              className="overflow-hidden"
              data-ocid={`activities.item.${idx + 1}`}
            >
              <div
                className="h-28 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #78C8C8 0%, #4A90D9 100%)",
                }}
              >
                <Image className="w-10 h-10 text-white/50" />
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Badge
                    className={`text-[10px] ${
                      GRADE_COLORS[act.classGrade] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {act.classGrade}
                  </Badge>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setDeleteId(act.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      data-ocid={`activities.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">
                  {act.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {act.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{act.teacherName}</span>
                  <span>{new Date(act.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="activities.dialog">
          <DialogHeader>
            <DialogTitle>Add Classroom Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Grade / Class *</Label>
              <Select
                value={form.classGrade}
                onValueChange={(v) => setForm((p) => ({ ...p, classGrade: v }))}
              >
                <SelectTrigger className="mt-1" data-ocid="activities.select">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.filter((g) => g !== "All").map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Finger Painting — Animals"
                className="mt-1"
                data-ocid="activities.input"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="What did the class do today?"
                className="mt-1 h-24 resize-none"
                data-ocid="activities.textarea"
              />
            </div>
            <div>
              <Label className="text-xs">Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="activities.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving || !form.classGrade || !form.title}
              data-ocid="activities.submit_button"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : null}
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent data-ocid="activities.delete_dialog">
          <DialogHeader>
            <DialogTitle>Delete Activity?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="activities.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="activities.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
