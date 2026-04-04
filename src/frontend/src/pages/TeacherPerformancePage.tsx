import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { Award, Star, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../store";

interface PerformanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  branchId: string;
  month: string;
  year: string;
  activitiesUploaded: bigint;
  worksheetsSubmitted: bigint;
  ptmAttended: bigint;
  completionPercent: bigint;
}

interface FeedbackRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  parentUsername: string;
  studentName: string;
  rating: bigint;
  comment: string;
  submittedAt: string;
}

interface PTMRec {
  id: string;
  teacherId: string;
  date: string;
  title: string;
  attendees: string;
  notes: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function TeacherPerformancePage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const user = getAuthUser();
  const isAdmin =
    user?.role === "Founder" ||
    user?.role === "Admin" ||
    user?.role === "CentreHead";

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [ptmRecords, setPtmRecords] = useState<PTMRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!actor) return;
    const loadFn = isAdmin
      ? Promise.all([
          actor.getTeacherPerformanceRecords(),
          actor.getParentFeedback(),
          actor.getPTMRecords(),
        ])
      : Promise.all([
          actor.getTeacherPerformanceByTeacher(user?.username ?? ""),
          actor.getParentFeedbackByTeacher(user?.username ?? ""),
          actor.getPTMRecords(),
        ]);

    loadFn
      .then(
        ([recs, fb, ptm]: [
          PerformanceRecord[],
          FeedbackRecord[],
          PTMRec[],
        ]) => {
          setRecords(recs ?? []);
          setFeedback(fb ?? []);
          setPtmRecords(ptm ?? []);
        },
      )
      .catch(() => toast.error("Failed to load performance data"))
      .finally(() => setLoading(false));
  }, [actor, isAdmin, user?.username]);

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.month === MONTHS[Number.parseInt(selectedMonth)] &&
          r.year === selectedYear,
      ),
    [records, selectedMonth, selectedYear],
  );

  // Group by teacher for the detail sheet
  const teacherHistory = useMemo(() => {
    if (!selectedTeacherId) return [];
    return records
      .filter((r) => r.teacherId === selectedTeacherId)
      .map((r) => ({
        name: `${r.month.slice(0, 3)} ${r.year}`,
        Activities: Number(r.activitiesUploaded),
        Worksheets: Number(r.worksheetsSubmitted),
        PTM: Number(r.ptmAttended),
      }))
      .slice(-6);
  }, [records, selectedTeacherId]);

  const teacherFeedback = useMemo(
    () => feedback.filter((f) => f.teacherId === selectedTeacherId),
    [feedback, selectedTeacherId],
  );

  const teacherPTM = useMemo(
    () => ptmRecords.filter((p) => p.teacherId === selectedTeacherId),
    [ptmRecords, selectedTeacherId],
  );

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data-ocid="performance.loading_state"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Teacher Performance
          </h1>
          <p className="text-xs text-muted-foreground">
            Monthly performance metrics and parent feedback
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger
            className="h-8 w-32 text-xs"
            data-ocid="performance.month.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger
            className="h-8 w-24 text-xs"
            data-ocid="performance.year.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRecords.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="performance.empty_state"
        >
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            No performance data for this period
          </p>
          <p className="text-xs mt-1">
            Performance records will appear here when available.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="performance.list"
        >
          {filteredRecords.map((rec, idx) => {
            const pct = Number(rec.completionPercent);
            return (
              <Card
                key={rec.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTeacherId(rec.teacherId)}
                data-ocid={`performance.item.${idx + 1}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {rec.teacherName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rec.branchId}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs ${
                        pct >= 90
                          ? "bg-green-100 text-green-700"
                          : pct >= 70
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pct}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Completion</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-base font-bold text-teal-600">
                        {Number(rec.activitiesUploaded)}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Activities
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-base font-bold text-blue-600">
                        {Number(rec.worksheetsSubmitted)}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Sheets
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-base font-bold text-purple-600">
                        {Number(rec.ptmAttended)}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        PTM
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs"
                    data-ocid={`performance.detail_button.${idx + 1}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet
        open={!!selectedTeacherId}
        onOpenChange={(o) => !o && setSelectedTeacherId(null)}
      >
        <SheetContent
          className="w-full sm:max-w-lg overflow-y-auto"
          data-ocid="performance.sheet"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>
                {records.find((r) => r.teacherId === selectedTeacherId)
                  ?.teacherName ?? "Teacher"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setSelectedTeacherId(null)}
                data-ocid="performance.close_button"
              >
                <X className="w-4 h-4" />
              </Button>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Chart */}
            {teacherHistory.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Performance Trend
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={teacherHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar
                      dataKey="Activities"
                      fill="#78C8C8"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="Worksheets"
                      fill="#4A90D9"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar dataKey="PTM" fill="#B8A7CC" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Parent Feedback */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Parent Feedback ({teacherFeedback.length})
              </p>
              {teacherFeedback.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No feedback yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {teacherFeedback.map((fb, idx) => (
                    <div
                      key={fb.id}
                      className="p-3 bg-muted/30 rounded-lg"
                      data-ocid={`performance.feedback.${idx + 1}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium">{fb.studentName}</p>
                        <StarRating rating={Number(fb.rating)} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fb.comment}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(fb.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PTM Records */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                PTM Attendance ({teacherPTM.length})
              </p>
              {teacherPTM.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No PTM records yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {teacherPTM.map((ptm, idx) => (
                    <div
                      key={ptm.id}
                      className="p-3 bg-muted/30 rounded-lg"
                      data-ocid={`performance.ptm.${idx + 1}`}
                    >
                      <p className="text-xs font-medium">{ptm.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {ptm.date} • Attendees: {ptm.attendees}
                      </p>
                      {ptm.notes && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {ptm.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
