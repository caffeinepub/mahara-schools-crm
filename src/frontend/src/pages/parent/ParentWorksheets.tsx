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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useParentActor } from "../../hooks/useParentActor";
import type { AuthUser, Student, Worksheet } from "../../types";

interface Props {
  user: AuthUser;
}

export default function ParentWorksheets({ user }: Props) {
  const { actor } = useParentActor();
  const [students, setStudents] = useState<Student[]>([]);
  const [worksheets, setWorksheets] = useState<Record<string, Worksheet[]>>({});
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getStudentsByParent(user.username)
      .then(async (studs) => {
        setStudents(studs);
        const grades = [...new Set(studs.map((s) => s.grade))];
        if (grades.length > 0) setSelectedGrade(grades[0] as string);
        const ws: Record<string, Worksheet[]> = {};
        await Promise.all(
          grades.map(async (g) => {
            const items = await actor.getWorksheetsByGrade(g);
            ws[g] = [...items].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
          }),
        );
        setWorksheets(ws);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, user.username]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="worksheets.loading_state">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const grades = [...new Set(students.map((s) => s.grade))];
  const currentWorksheets = selectedGrade
    ? (worksheets[selectedGrade] ?? [])
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Daily Worksheets
        </h2>
        <p className="text-sm text-muted-foreground">
          Weekly activity log sheets for each grade
        </p>
      </div>

      {grades.length > 1 && (
        <div className="flex gap-2 flex-wrap" data-ocid="worksheets.grade.tab">
          {grades.map((g) => {
            const student = students.find((s) => s.grade === g);
            return (
              <button
                type="button"
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  selectedGrade === g
                    ? "border-[#4F8F92] bg-[#4F8F92] text-white"
                    : "border-border bg-white text-muted-foreground hover:border-[#4F8F92]",
                ].join(" ")}
              >
                Grade {g}
                {student ? ` — ${student.name}` : ""}
              </button>
            );
          })}
        </div>
      )}

      {currentWorksheets.length === 0 ? (
        <Card data-ocid="worksheets.empty_state">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No worksheets available</p>
            <p className="text-sm mt-1">
              Worksheets will appear here once added by the teacher.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentWorksheets.map((ws, idx) => (
            <Card
              key={ws.id}
              className="shadow-sm overflow-hidden"
              data-ocid={`worksheets.item.${idx + 1}`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleExpand(ws.id)}
              >
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {ws.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ws.date} · Teacher: {ws.teacherName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Grade {ws.grade}
                    </Badge>
                  </div>
                  {expanded.has(ws.id) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </CardHeader>
              </button>
              {expanded.has(ws.id) && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead>Subject</TableHead>
                          <TableHead>Activities</TableHead>
                          <TableHead>Homework</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Notes
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ws.subjects.map((subj) => (
                          <TableRow key={subj.subject}>
                            <TableCell className="font-medium text-sm">
                              {subj.subject}
                            </TableCell>
                            <TableCell className="text-sm">
                              {subj.activities}
                            </TableCell>
                            <TableCell className="text-sm">
                              {subj.homework}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {subj.notes}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
