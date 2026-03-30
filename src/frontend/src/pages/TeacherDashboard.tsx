import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Loader2,
  LogOut,
  Plus,
  School,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type {
  AuthUser,
  Branch,
  SchoolUpdate,
  Student,
  Teacher,
  WorksheetSubject,
} from "../types";

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

export default function TeacherDashboard({ user, onLogout }: Props) {
  const { actor: _actorRaw } = useActor();
  const actor = _actorRaw as any;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [updates, setUpdates] = useState<SchoolUpdate[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [wsTitle, setWsTitle] = useState("");
  const [wsDate, setWsDate] = useState(new Date().toISOString().split("T")[0]);
  const [wsSubjects, setWsSubjects] = useState<WorksheetSubject[]>([
    { subject: "", activities: "", homework: "", notes: "" },
  ]);

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getTeacherByUsername(user.username),
      actor.getSchoolUpdates(),
      actor.getBranches(),
    ])
      .then(([t, us, bs]) => {
        const teacherData = t as Teacher | null;
        setTeacher(teacherData);
        setUpdates((us as SchoolUpdate[]).slice(0, 3));
        setBranches(bs as Branch[]);
        if (teacherData) {
          return actor
            .getStudentsByGrade(teacherData.grade)
            .then((sts) => setStudents(sts as Student[]));
        }
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [actor, user.username]);

  function branchName(id: string) {
    return branches.find((b) => b.id === id)?.name ?? id;
  }

  function addSubjectRow() {
    setWsSubjects((p) => [
      ...p,
      { subject: "", activities: "", homework: "", notes: "" },
    ]);
  }
  function removeSubjectRow(i: number) {
    setWsSubjects((p) => p.filter((_, idx) => idx !== i));
  }
  function updateSubject(
    i: number,
    field: keyof WorksheetSubject,
    val: string,
  ) {
    setWsSubjects((p) => {
      const s = [...p];
      s[i] = { ...s[i], [field]: val };
      return s;
    });
  }

  async function handleAddWorksheet(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || !teacher || !wsTitle.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    try {
      await actor.addWorksheet({
        id: `ws${Date.now()}`,
        grade: teacher.grade,
        title: wsTitle,
        date: wsDate,
        teacherName: teacher.name,
        subjects: wsSubjects,
      });
      setWsTitle("");
      setWsDate(new Date().toISOString().split("T")[0]);
      setWsSubjects([
        {
          subject: "",
          activities: "",
          homework: "",
          notes: "",
        },
      ]);
      toast.success("Worksheet added");
    } catch {
      toast.error("Failed to add worksheet");
    } finally {
      setSaving(false);
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    Event: "#78C8C8",
    Notice: "#C67B5C",
    Announcement: "#7B9E87",
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #F0F7F7 0%, #E8F3F3 100%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm"
        style={{
          background: "linear-gradient(90deg, #78C8C8 0%, #6BA3D6 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <img
              src="/assets/mahara_common_logo_png-019d3e56-ac03-771c-a137-577f15f3bff3.png"
              alt="Mahara"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              Mahara Schools
            </p>
            <p className="text-white/70 text-[10px] uppercase tracking-wider">
              Teacher Portal
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-white hover:bg-white/20"
          data-ocid="teacher.logout.button"
        >
          <LogOut size={16} className="mr-1.5" /> Logout
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="space-y-3" data-ocid="teacher.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Welcome banner */}
            <Card
              className="border-0 shadow-md"
              style={{
                background: "linear-gradient(135deg, #78C8C8 0%, #6BA3D6 100%)",
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={28} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl">
                      Welcome, {user.name}
                    </h1>
                    {teacher ? (
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          {teacher.grade}
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          {branchName(teacher.branchId)}
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          {teacher.subjects}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-white/70 text-sm mt-1">
                        Teacher profile not found. Contact admin.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Students */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users size={16} style={{ color: "#78C8C8" }} />
                    My Class Students
                    {teacher && (
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {teacher.grade}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {students.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground py-4 text-center"
                      data-ocid="teacher.students.empty_state"
                    >
                      No students in this grade.
                    </p>
                  ) : (
                    <div
                      className="space-y-2"
                      data-ocid="teacher.students.list"
                    >
                      {students.map((s, i) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 py-2 border-b last:border-0"
                          data-ocid={`teacher.students.item.${i + 1}`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "#78C8C8" }}
                          >
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.admissionNumber}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* School Updates */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarDays size={16} style={{ color: "#78C8C8" }} />
                    Recent School Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {updates.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground py-4 text-center"
                      data-ocid="teacher.updates.empty_state"
                    >
                      No updates yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {updates.map((u, i) => (
                        <div
                          key={u.id}
                          className="border-b pb-3 last:border-0"
                          data-ocid={`teacher.updates.item.${i + 1}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge
                              className="text-[10px] px-1.5 py-0"
                              style={{
                                background:
                                  CATEGORY_COLORS[u.category] ?? "#78C8C8",
                              }}
                            >
                              {u.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {u.date}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{u.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {u.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add Worksheet Form */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen size={16} style={{ color: "#78C8C8" }} />
                  Add Worksheet for {teacher?.grade ?? "your class"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleAddWorksheet} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={wsTitle}
                        onChange={(e) => setWsTitle(e.target.value)}
                        placeholder="Worksheet title"
                        data-ocid="teacher.worksheet.title.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={wsDate}
                        onChange={(e) => setWsDate(e.target.value)}
                        data-ocid="teacher.worksheet.date.input"
                      />
                    </div>
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
                    {wsSubjects.map((s, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for dynamic form rows
                      <div key={i} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">
                            Subject {i + 1}
                          </p>
                          {wsSubjects.length > 1 && (
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
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    style={{ background: "#78C8C8" }}
                    disabled={saving}
                    data-ocid="teacher.worksheet.submit_button"
                  >
                    {saving && (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    )}
                    Submit Worksheet
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <footer className="py-4 text-center">
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
