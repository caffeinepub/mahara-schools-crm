import type {
  CalendarEvent,
  ReportCard,
  SchoolUpdate,
  Student,
  Worksheet,
} from "../types";
import { useActor } from "./useActor";

export interface ParentActorMethods {
  getStudentsByParent(parentUsername: string): Promise<Student[]>;
  getReportCardsByStudent(studentId: string): Promise<ReportCard[]>;
  getWorksheetsByGrade(grade: string): Promise<Worksheet[]>;
  getSchoolUpdates(): Promise<SchoolUpdate[]>;
  getCalendarEvents(): Promise<CalendarEvent[]>;
}

export function useParentActor(): {
  actor: ParentActorMethods | null;
  isFetching: boolean;
} {
  const { actor, isFetching } = useActor();
  return {
    actor: actor as unknown as ParentActorMethods | null,
    isFetching,
  };
}
