import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CalendarDays,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type {
  ReportCard,
  SchoolUpdate,
  Student,
  SubjectGrade,
  Worksheet,
  WorksheetSubject,
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
  "Grade 11",
  "Grade 12",
];

const GRADE_OPTIONS = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

// ---- Worksheets Tab ----
function WorksheetsTab() {
  const { actor: _actor } = useActor();
  const actor = _actor as any;
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = (): Omit<Worksheet, "id"> => ({
    grade: "Nursery",
    title: "",
    date: new Date().toISOString().split("T")[0],
    teacherName: "",
    subjects: [
      {
        subject: "",
        activities: "",
        homework: "",
        notes: "",
      },
    ],
  });
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllWorksheets()
      .then((ws) => setWorksheets(ws as Worksheet[]))
      .catch(() => toast.error("Failed to load worksheets"))
      .finally(() => setLoading(false));
  }, [actor]);

  function addSubjectRow() {
    setForm((p) => ({
      ...p,
      subjects: [
        ...p.subjects,
        { subject: "", activities: "", homework: "", notes: "" },
      ],
    }));
  }

  function removeSubjectRow(i: number) {
    setForm((p) => ({
      ...p,
      subjects: p.subjects.filter((_, idx) => idx !== i),
    }));
  }

  function updateSubject(
    i: number,
    field: keyof WorksheetSubject,
    val: string,
  ) {
    setForm((p) => {
      const subjects = [...p.subjects];
      subjects[i] = { ...subjects[i], [field]: val };
      return { ...p, subjects };
    });
  }

  async function handleSave() {
    if (!actor || !form.title.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    try {
      const ws: Worksheet = { id: `ws${Date.now()}`, ...form };
      await actor.addWorksheet(ws);
      const updated = await actor.getAllWorksheets();
      setWorksheets(updated as Worksheet[]);
      setOpen(false);
      setForm(emptyForm());
      toast.success("Worksheet added");
    } catch {
      toast.error("Failed to save worksheet");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteWorksheet(id);
      setWorksheets((p) => p.filter((w) => w.id !== id));
      setDeleteId(null);
      toast.success("Worksheet deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading)
    return (
      <div className="space-y-2" data-ocid="worksheets.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={() => {
            setForm(emptyForm());
            setOpen(true);
          }}
          data-ocid="worksheets.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Add Worksheet
        </Button>
      </div>

      {worksheets.length === 0 && (
        <Card>
          <CardContent
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="worksheets.empty_state"
          >
            No worksheets yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {worksheets.map((w, i) => (
          <Card
            key={w.id}
            className="shadow-xs"
            data-ocid={`worksheets.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{w.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {w.grade}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays size={11} />
                      {w.date}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User size={11} />
                      {w.teacherName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {w.subjects.length} subject
                    {w.subjects.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(w.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 flex-shrink-0"
                  data-ocid={`worksheets.delete_button.${i + 1}`}
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="worksheets.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Worksheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Grade</Label>
                <Select
                  value={form.grade}
                  onValueChange={(v) => setForm((p) => ({ ...p, grade: v }))}
                >
                  <SelectTrigger data-ocid="worksheets.grade.select">
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
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  data-ocid="worksheets.date.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="worksheets.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Teacher Name</Label>
              <Input
                value={form.teacherName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teacherName: e.target.value }))
                }
                data-ocid="worksheets.teacher.input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Subjects</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addSubjectRow}
                >
                  <Plus size={12} className="mr-1" />
                  Add Subject
                </Button>
              </div>
              {form.subjects.map((s, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for dynamic form rows
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Subject {i + 1}
                    </p>
                    {form.subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(i)}
                        className="p-1 rounded hover:bg-destructive/10"
                      >
                        <Trash2 size={12} className="text-destructive" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Subject name"
                    value={s.subject}
                    onChange={(e) =>
                      updateSubject(i, "subject", e.target.value)
                    }
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="Activities"
                    rows={2}
                    value={s.activities}
                    onChange={(e) =>
                      updateSubject(i, "activities", e.target.value)
                    }
                    className="text-sm"
                  />
                  <Input
                    placeholder="Homework"
                    value={s.homework}
                    onChange={(e) =>
                      updateSubject(i, "homework", e.target.value)
                    }
                    className="text-sm"
                  />
                  <Input
                    placeholder="Notes"
                    value={s.notes}
                    onChange={(e) => updateSubject(i, "notes", e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="worksheets.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="worksheets.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          className="max-w-sm"
          data-ocid="worksheets.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Worksheet?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="worksheets.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="worksheets.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Report Cards Tab ----
function ReportCardsTab() {
  const { actor: _actor } = useActor();
  const actor = _actor as any;
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = (): Omit<ReportCard, "id"> => ({
    studentId: "",
    term: "Term 1",
    academicYear: "2025-2026",
    subjects: [{ subject: "", grade: "A", marks: "", remarks: "" }],
    overallGrade: "A",
    attendance: "",
    teacherComment: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getAllReportCards(), actor.getAllStudents()])
      .then(([rcs, sts]) => {
        setReportCards(rcs as ReportCard[]);
        setStudents(sts as Student[]);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [actor]);

  function addSubjectRow() {
    setForm((p) => ({
      ...p,
      subjects: [
        ...p.subjects,
        { subject: "", grade: "A", marks: "", remarks: "" },
      ],
    }));
  }
  function removeSubjectRow(i: number) {
    setForm((p) => ({
      ...p,
      subjects: p.subjects.filter((_, idx) => idx !== i),
    }));
  }
  function updateSubject(i: number, field: keyof SubjectGrade, val: string) {
    setForm((p) => {
      const subjects = [...p.subjects];
      subjects[i] = { ...subjects[i], [field]: val };
      return { ...p, subjects };
    });
  }

  async function handleSave() {
    if (!actor || !form.studentId) {
      toast.error("Please select a student");
      return;
    }
    setSaving(true);
    try {
      const rc: ReportCard = { id: `rc${Date.now()}`, ...form };
      await actor.addReportCard(rc);
      const updated = await actor.getAllReportCards();
      setReportCards(updated as ReportCard[]);
      setOpen(false);
      setForm(emptyForm());
      toast.success("Report card added");
    } catch {
      toast.error("Failed to save report card");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteReportCard(id);
      setReportCards((p) => p.filter((r) => r.id !== id));
      setDeleteId(null);
      toast.success("Report card deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function studentName(id: string) {
    return students.find((s) => s.id === id)?.name ?? id;
  }

  if (loading)
    return (
      <div className="space-y-2" data-ocid="reportcards.loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={() => {
            setForm(emptyForm());
            setOpen(true);
          }}
          data-ocid="reportcards.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Add Report Card
        </Button>
      </div>

      {reportCards.length === 0 && (
        <Card>
          <CardContent
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="reportcards.empty_state"
          >
            No report cards yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {reportCards.map((rc, i) => (
          <Card
            key={rc.id}
            className="shadow-xs"
            data-ocid={`reportcards.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {studentName(rc.studentId)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {rc.term}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {rc.academicYear}
                    </Badge>
                    <Badge
                      className="text-[10px]"
                      style={{ background: "#4F8F92" }}
                    >
                      Overall: {rc.overallGrade}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rc.date} · Attendance: {rc.attendance}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(rc.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 flex-shrink-0"
                  data-ocid={`reportcards.delete_button.${i + 1}`}
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="reportcards.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Report Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs">Student</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => setForm((p) => ({ ...p, studentId: v }))}
              >
                <SelectTrigger data-ocid="reportcards.student.select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Term</Label>
                <Select
                  value={form.term}
                  onValueChange={(v) => setForm((p) => ({ ...p, term: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Term 1", "Term 2", "Term 3"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Academic Year</Label>
                <Input
                  value={form.academicYear}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, academicYear: e.target.value }))
                  }
                  data-ocid="reportcards.year.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Overall Grade</Label>
                <Select
                  value={form.overallGrade}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, overallGrade: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Attendance (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.attendance}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, attendance: e.target.value }))
                  }
                  data-ocid="reportcards.attendance.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Teacher Comment</Label>
              <Textarea
                rows={2}
                value={form.teacherComment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teacherComment: e.target.value }))
                }
                data-ocid="reportcards.comment.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Subjects</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addSubjectRow}
                >
                  <Plus size={12} className="mr-1" />
                  Add Subject
                </Button>
              </div>
              {form.subjects.map((s, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for dynamic form rows
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Subject {i + 1}
                    </p>
                    {form.subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(i)}
                        className="p-1 rounded hover:bg-destructive/10"
                      >
                        <Trash2 size={12} className="text-destructive" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Subject name"
                      value={s.subject}
                      onChange={(e) =>
                        updateSubject(i, "subject", e.target.value)
                      }
                      className="text-sm"
                    />
                    <Select
                      value={s.grade}
                      onValueChange={(v) => updateSubject(i, "grade", v)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Marks (e.g. 92/100)"
                      value={s.marks}
                      onChange={(e) =>
                        updateSubject(i, "marks", e.target.value)
                      }
                      className="text-sm"
                    />
                    <Input
                      placeholder="Remarks"
                      value={s.remarks}
                      onChange={(e) =>
                        updateSubject(i, "remarks", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="reportcards.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="reportcards.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          className="max-w-sm"
          data-ocid="reportcards.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Report Card?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="reportcards.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="reportcards.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- School Updates Tab ----
function SchoolUpdatesTab() {
  const { actor: _actor } = useActor();
  const actor = _actor as any;
  const [updates, setUpdates] = useState<SchoolUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = (): Omit<SchoolUpdate, "id"> => ({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    category: "Announcement",
  });
  const [form, setForm] = useState(emptyForm());

  const CATEGORIES = ["Event", "Notice", "Announcement"];
  const CATEGORY_COLORS: Record<string, string> = {
    Event: "#4F8F92",
    Notice: "#C67B5C",
    Announcement: "#7B9E87",
  };

  useEffect(() => {
    if (!actor) return;
    actor
      .getSchoolUpdates()
      .then((us) => setUpdates(us as SchoolUpdate[]))
      .catch(() => toast.error("Failed to load updates"))
      .finally(() => setLoading(false));
  }, [actor]);

  async function handleSave() {
    if (!actor || !form.title.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    try {
      const u: SchoolUpdate = { id: `su${Date.now()}`, ...form };
      await actor.addSchoolUpdate(u);
      const updated = await actor.getSchoolUpdates();
      setUpdates(updated as SchoolUpdate[]);
      setOpen(false);
      setForm(emptyForm());
      toast.success("Update posted");
    } catch {
      toast.error("Failed to post update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteSchoolUpdate(id);
      setUpdates((p) => p.filter((u) => u.id !== id));
      setDeleteId(null);
      toast.success("Update deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading)
    return (
      <div className="space-y-2" data-ocid="updates.loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={() => {
            setForm(emptyForm());
            setOpen(true);
          }}
          data-ocid="updates.add.primary_button"
        >
          <Plus size={14} className="mr-1" /> Post Update
        </Button>
      </div>

      {updates.length === 0 && (
        <Card>
          <CardContent
            className="py-10 text-center text-sm text-muted-foreground"
            data-ocid="updates.empty_state"
          >
            No updates yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {updates.map((u, i) => (
          <Card
            key={u.id}
            className="shadow-xs"
            data-ocid={`updates.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className="text-[10px]"
                      style={{
                        background: CATEGORY_COLORS[u.category] ?? "#4F8F92",
                      }}
                    >
                      {u.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {u.date}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{u.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {u.content}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(u.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 flex-shrink-0"
                  data-ocid={`updates.delete_button.${i + 1}`}
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" data-ocid="updates.dialog">
          <DialogHeader>
            <DialogTitle>Post School Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger data-ocid="updates.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="updates.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Content</Label>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                data-ocid="updates.content.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="updates.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="updates.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="updates.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Update?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="updates.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="updates.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AcademicsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen size={20} style={{ color: "#4F8F92" }} />
        <h2 className="text-lg font-semibold">Academic Content Management</h2>
      </div>

      <Tabs defaultValue="worksheets" data-ocid="academics.tab">
        <TabsList className="h-9">
          <TabsTrigger
            value="worksheets"
            className="text-sm"
            data-ocid="academics.worksheets.tab"
          >
            Worksheets
          </TabsTrigger>
          <TabsTrigger
            value="reportcards"
            className="text-sm"
            data-ocid="academics.reportcards.tab"
          >
            Report Cards
          </TabsTrigger>
          <TabsTrigger
            value="updates"
            className="text-sm"
            data-ocid="academics.updates.tab"
          >
            School Updates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="worksheets" className="mt-4">
          <WorksheetsTab />
        </TabsContent>
        <TabsContent value="reportcards" className="mt-4">
          <ReportCardsTab />
        </TabsContent>
        <TabsContent value="updates" className="mt-4">
          <SchoolUpdatesTab />
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
