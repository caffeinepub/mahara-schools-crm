import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../store";

interface StaffProfile {
  id: string;
  name: string;
  designation: string;
  branchId: string;
  role: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  date: string;
  status: string;
  markedBy: string;
  timestamp: string;
}

const STATUS_OPTIONS = ["Present", "Absent", "Late"];

const STATUS_BADGE: Record<string, string> = {
  Present: "bg-green-100 text-green-700 border-green-200",
  Absent: "bg-red-100 text-red-700 border-red-200",
  Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

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

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function StaffAttendancePage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const user = getAuthUser();
  const isAdmin =
    user?.role === "Founder" ||
    user?.role === "Admin" ||
    user?.role === "CentreHead";

  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getStaffProfiles(), actor.getStaffAttendance()])
      .then(([profiles, att]: [StaffProfile[], AttendanceRecord[]]) => {
        setStaff(profiles ?? []);
        setAllAttendance(att ?? []);
      })
      .catch(() => toast.error("Failed to load attendance data"))
      .finally(() => setLoading(false));
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    actor
      .getStaffAttendanceByDate(selectedDate)
      .then((att: AttendanceRecord[]) => {
        setAttendance(att ?? []);
        const map: Record<string, string> = {};
        for (const a of att ?? []) map[a.staffId] = a.status;
        setLocalStatus(map);
      })
      .catch(() => {});
  }, [actor, selectedDate]);

  async function handleMarkAttendance(staffMember: StaffProfile) {
    if (!actor) return;
    const status = localStatus[staffMember.id] ?? "Present";
    setSaving(staffMember.id);
    try {
      const existing = attendance.find((a) => a.staffId === staffMember.id);
      const record: AttendanceRecord = {
        id: existing?.id || `att-${Date.now()}-${staffMember.id}`,
        staffId: staffMember.id,
        staffName: staffMember.name,
        branchId: staffMember.branchId,
        date: selectedDate,
        status,
        markedBy: user?.username || "admin",
        timestamp: new Date().toISOString(),
      };
      if (existing) {
        await actor.updateAttendance(record);
      } else {
        await actor.markAttendance(record);
      }
      const updated = await actor.getStaffAttendanceByDate(selectedDate);
      setAttendance(updated ?? []);
      const allUpdated = await actor.getStaffAttendance();
      setAllAttendance(allUpdated ?? []);
      toast.success(`Attendance saved for ${staffMember.name}`);
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(null);
    }
  }

  // Monthly report calculation
  const monthlyStats = useMemo(() => {
    const month = Number.parseInt(selectedMonth);
    const year = Number.parseInt(selectedYear);
    const monthRecords = allAttendance.filter((a) => {
      const d = new Date(a.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return staff.map((s) => {
      const recs = monthRecords.filter((a) => a.staffId === s.id);
      const present = recs.filter((r) => r.status === "Present").length;
      const absent = recs.filter((r) => r.status === "Absent").length;
      const late = recs.filter((r) => r.status === "Late").length;
      const total = present + absent + late;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return { ...s, present, absent, late, total, pct };
    });
  }, [allAttendance, staff, selectedMonth, selectedYear]);

  const displayStaff = useMemo(() => {
    if (!isAdmin && user) {
      // Teacher sees only themselves
      return staff.filter((s) => s.role === "Teacher");
    }
    return staff;
  }, [staff, isAdmin, user]);

  if (loading) {
    return (
      <div className="space-y-3" data-ocid="attendance.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
          <CalendarCheck className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Staff Attendance
          </h1>
          <p className="text-xs text-muted-foreground">
            Track and manage daily staff attendance
          </p>
        </div>
      </div>

      <Tabs defaultValue="daily" data-ocid="attendance.tab">
        <TabsList>
          <TabsTrigger value="daily" data-ocid="attendance.daily.tab">
            Daily Attendance
          </TabsTrigger>
          <TabsTrigger value="monthly" data-ocid="attendance.monthly.tab">
            Monthly Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-sm font-semibold">
                  Daily Attendance
                </CardTitle>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-input rounded-md h-8 px-2 text-sm bg-background text-foreground"
                  data-ocid="attendance.input"
                />
              </div>
            </CardHeader>
            <CardContent>
              {displayStaff.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="attendance.empty_state"
                >
                  <p className="text-sm">No staff members found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="attendance.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Name</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayStaff.map((s, idx) => (
                        <TableRow
                          key={s.id}
                          data-ocid={`attendance.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.designation}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.branchId}
                          </TableCell>
                          <TableCell>
                            {isAdmin ? (
                              <Select
                                value={localStatus[s.id] ?? "Present"}
                                onValueChange={(v) =>
                                  setLocalStatus((prev) => ({
                                    ...prev,
                                    [s.id]: v,
                                  }))
                                }
                              >
                                <SelectTrigger
                                  className="h-7 w-28 text-xs"
                                  data-ocid={`attendance.select.${idx + 1}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                className={
                                  STATUS_BADGE[
                                    localStatus[s.id] ?? "Present"
                                  ] ?? ""
                                }
                              >
                                {localStatus[s.id] ?? "Not Marked"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {isAdmin ? (
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleMarkAttendance(s)}
                                disabled={saving === s.id}
                                data-ocid={`attendance.save_button.${idx + 1}`}
                              >
                                {saving === s.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setLocalStatus((prev) => ({
                                    ...prev,
                                    [s.id]: "Present",
                                  }));
                                  handleMarkAttendance(s);
                                }}
                                disabled={saving === s.id}
                                data-ocid={`attendance.checkin_button.${idx + 1}`}
                              >
                                Check In
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-sm font-semibold">
                  Monthly Summary
                </CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger
                      className="h-8 w-32 text-xs"
                      data-ocid="attendance.month.select"
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
                      data-ocid="attendance.year.select"
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">
                        Attendance %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats.map((s, idx) => (
                      <TableRow
                        key={s.id}
                        data-ocid={`attendance.monthly.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium text-sm">
                          {s.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.branchId}
                        </TableCell>
                        <TableCell className="text-center text-sm text-green-600 font-medium">
                          {s.present}
                        </TableCell>
                        <TableCell className="text-center text-sm text-red-500 font-medium">
                          {s.absent}
                        </TableCell>
                        <TableCell className="text-center text-sm text-yellow-600 font-medium">
                          {s.late}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-sm font-bold ${
                              s.pct >= 90
                                ? "text-green-600"
                                : s.pct >= 70
                                  ? "text-yellow-600"
                                  : "text-red-500"
                            }`}
                          >
                            {s.total > 0 ? `${s.pct}%` : "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
