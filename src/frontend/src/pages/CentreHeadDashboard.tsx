import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type {
  AuthUser,
  Branch,
  Lead,
  SchoolUpdate,
  Student,
  Teacher,
} from "../types";
import { leadFromBackend } from "../utils/backendAdapters";

const BRANCH_INFO: Record<string, { phone: string; programs: string[] }> = {
  b1: {
    phone: "+91 628170-8102",
    programs: ["Daycare", "Pre-Nursery", "Nursery", "KG I", "KG II"],
  },
  b2: {
    phone: "+91 7488-456789",
    programs: ["Daycare", "Pre-Nursery", "Nursery", "KG I", "KG II", "Primary"],
  },
};

const STATUS_COLORS: Record<string, string> = {
  "New Inquiry": "#78C8C8",
  Qualified: "#6BA3D6",
  "Campus Tour": "#F5C518",
  "Application Sent": "#B8A7CC",
  Enrolled: "#A8CB48",
  Rejected: "#E57373",
};

const CATEGORY_COLORS: Record<string, string> = {
  Event: "#78C8C8",
  Notice: "#F5C518",
  Announcement: "#A8CB48",
};

interface Props {
  user: AuthUser;
}

export default function CentreHeadDashboard({ user }: Props) {
  const { actor: _actorRaw } = useActor();
  const actor = _actorRaw as any;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [updates, setUpdates] = useState<SchoolUpdate[]>([]);
  const [_students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine branch: centrehead1 → b1, centrehead2 → b2
  const branchId = user.username === "centrehead1" ? "b1" : "b2";

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getBranches(),
      actor.getTeachersByBranch(branchId),
      actor.getLeads(),
      actor.getSchoolUpdates(),
      actor.getAllStudents(),
    ])
      .then(([bs, ts, ls, us, sts]) => {
        setBranches(bs as Branch[]);
        setTeachers(ts as Teacher[]);
        setLeads((ls as any[]).map(leadFromBackend));
        setUpdates((us as SchoolUpdate[]).slice(0, 4));
        setStudents(sts as Student[]);
      })
      .catch(() => toast.error("Failed to load branch data"))
      .finally(() => setLoading(false));
  }, [actor, branchId]);

  const branch = branches.find((b) => b.id === branchId);
  const branchInfo = BRANCH_INFO[branchId];

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

  const enrolled = leads.filter((l) => l.status === "Enrolled").length;
  const newInquiries = leads.filter((l) => l.status === "New Inquiry").length;
  const totalLeads = leads.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-64" />
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
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {greeting}, {user.name}!
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
      </div>

      {/* Branch info card */}
      {branch && (
        <Card
          className="border-0 shadow-md"
          style={{
            background: "linear-gradient(135deg, #3A8A8D 0%, #5C8DB0 100%)",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Building2 size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{branch.name}</h3>
                <div className="flex items-start gap-1.5 mt-1.5">
                  <MapPin
                    size={12}
                    className="text-white/70 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-white/70 text-xs leading-relaxed">
                    {branch.location}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone size={12} className="text-white/70 flex-shrink-0" />
                  <p className="text-white/70 text-xs">{branchInfo?.phone}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {branchInfo?.programs.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Enquiries
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {totalLeads}
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
                  Enrolled
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {enrolled}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#EEF7E0" }}
              >
                <GraduationCap size={20} style={{ color: "#A8CB48" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  New Inquiries
                </p>
                <p className="text-[32px] font-bold text-foreground leading-none mt-1.5">
                  {newInquiries}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#EEF2FA" }}
              >
                <BookOpen size={20} style={{ color: "#6BA3D6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* My Teachers */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap size={16} style={{ color: "#78C8C8" }} />
              Teachers at this Branch
              <Badge variant="outline" className="ml-auto text-[10px]">
                {teachers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No teachers assigned.
              </p>
            ) : (
              <div className="space-y-2">
                {teachers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #78C8C8, #6BA3D6)",
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.grade} · {t.subjects.split(",")[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={16} style={{ color: "#78C8C8" }} />
              Recent Admissions Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No enquiries yet.
              </p>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-2.5 py-1.5 border-b last:border-0"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{
                        background: STATUS_COLORS[lead.status] ?? "#78C8C8",
                      }}
                    >
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {lead.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {lead.gradeLevel}
                      </p>
                    </div>
                    <Badge
                      className="text-[9px] px-1.5 py-0 h-4 text-white border-0"
                      style={{
                        background: STATUS_COLORS[lead.status] ?? "#78C8C8",
                      }}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* School Updates */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays size={16} style={{ color: "#78C8C8" }} />
            School Updates & Notices
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {updates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No updates yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {updates.map((u) => (
                <div key={u.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Badge
                      className="text-[10px] px-1.5 py-0 text-white border-0"
                      style={{
                        background: CATEGORY_COLORS[u.category] ?? "#78C8C8",
                      }}
                    >
                      {u.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {u.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{u.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {u.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
