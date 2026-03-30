import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useParentActor } from "../../hooks/useParentActor";
import type { AuthUser, ReportCard, Student } from "../../types";

interface Props {
  user: AuthUser;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A"))
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (grade.startsWith("C"))
    return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function ParentReportCards({ user }: Props) {
  const { actor } = useParentActor();
  const [students, setStudents] = useState<Student[]>([]);
  const [reportCards, setReportCards] = useState<Record<string, ReportCard[]>>(
    {},
  );
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getStudentsByParent(user.username)
      .then(async (studs) => {
        setStudents(studs);
        if (studs.length > 0) setSelectedStudent(studs[0].id);
        const cards: Record<string, ReportCard[]> = {};
        await Promise.all(
          studs.map(async (s) => {
            cards[s.id] = await actor.getReportCardsByStudent(s.id);
          }),
        );
        setReportCards(cards);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, user.username]);

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="report_cards.loading_state">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card data-ocid="report_cards.empty_state">
        <CardContent className="py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No students found</p>
          <p className="text-sm mt-1">
            Please contact the school administration.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStudent = students.find((s) => s.id === selectedStudent);
  const cards = (selectedStudent ? reportCards[selectedStudent] : []) ?? [];
  const latestCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Report Cards</h2>
        <p className="text-sm text-muted-foreground">
          Academic performance for your children
        </p>
      </div>

      {students.length > 1 && (
        <div
          className="flex gap-2 flex-wrap"
          data-ocid="report_cards.student.tab"
        >
          {students.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setSelectedStudent(s.id)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                selectedStudent === s.id
                  ? "border-[#4F8F92] bg-[#4F8F92] text-white"
                  : "border-border bg-white text-muted-foreground hover:border-[#4F8F92]",
              ].join(" ")}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {currentStudent && (
        <div className="rounded-xl bg-white border shadow-sm p-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "#4F8F92" }}
          >
            {currentStudent.name[0]}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {currentStudent.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Grade {currentStudent.grade} · Admission:{" "}
              {currentStudent.admissionNumber}
            </p>
          </div>
        </div>
      )}

      {!latestCard ? (
        <Card data-ocid="report_cards.empty_state">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No report cards available yet</p>
            <p className="text-sm mt-1">
              Report cards will appear here once published by the school.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg">
                  {currentStudent?.name} — Report Card
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {latestCard.term} · {latestCard.academicYear} ·{" "}
                  {latestCard.date}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={gradeColor(latestCard.overallGrade)}>
                  Overall: {latestCard.overallGrade}
                </Badge>
                <Badge variant="outline">
                  Attendance: {latestCard.attendance}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Subject</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Remarks
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestCard.subjects.map((sub) => (
                  <TableRow key={sub.subject}>
                    <TableCell className="font-medium">{sub.subject}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold border ${gradeColor(sub.grade)}`}
                      >
                        {sub.grade}
                      </span>
                    </TableCell>
                    <TableCell>{sub.marks}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {sub.remarks}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {latestCard.teacherComment && (
              <blockquote className="mt-5 border-l-4 border-[#64A0A3] pl-4 py-2 bg-[#F0F7F7] rounded-r-lg">
                <p className="text-sm text-muted-foreground italic">
                  "{latestCard.teacherComment}"
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  — Class Teacher
                </p>
              </blockquote>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
