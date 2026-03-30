export type LeadStatus =
  | "New Inquiry"
  | "Qualified"
  | "Campus Tour"
  | "Application Sent"
  | "Enrolled"
  | "Rejected";

export type FollowUpType = "Call" | "Email" | "Meet";

export type CampaignStatus = "Draft" | "Active" | "Completed";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  gradeLevel: string;
  source: string;
  status: LeadStatus;
  assignedAgent: string;
  notes: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  followUpType: FollowUpType;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  branchId: string;
}

export interface Teacher {
  id: string;
  username: string;
  name: string;
  branchId: string;
  grade: string;
  subjects: string;
}

export interface AuthUser {
  username: string;
  role: "Founder" | "Admin" | "CentreHead" | "Teacher" | "Agent" | "Parent";
  name: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentUsername: string;
  admissionNumber: string;
}

export interface SubjectGrade {
  subject: string;
  grade: string;
  marks: string;
  remarks: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  term: string;
  academicYear: string;
  subjects: SubjectGrade[];
  overallGrade: string;
  attendance: string;
  teacherComment: string;
  date: string;
}

export interface WorksheetSubject {
  subject: string;
  activities: string;
  homework: string;
  notes: string;
}

export interface Worksheet {
  id: string;
  grade: string;
  title: string;
  date: string;
  teacherName: string;
  subjects: WorksheetSubject[];
}

export interface SchoolUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  color: string;
}
