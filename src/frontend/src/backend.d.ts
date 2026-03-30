export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  gradeLevel: string;
  source: string;
  status: string;
  assignedAgent: string;
  notes: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  followUpType: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
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

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
  completed: boolean;
  leadId: string;
  createdAt: string;
}

export interface backendInterface {
  login(credentials: { username: string; password: string }): Promise<{ username: string; role: string; name: string } | null>;
  initSeedData(): Promise<void>;

  getLeads(): Promise<Lead[]>;
  addLead(lead: Lead): Promise<string>;
  updateLead(lead: Lead): Promise<void>;
  deleteLead(id: string): Promise<void>;

  getFollowUps(): Promise<FollowUp[]>;
  addFollowUp(fu: FollowUp): Promise<string>;
  updateFollowUp(fu: FollowUp): Promise<void>;
  deleteFollowUp(id: string): Promise<void>;

  getCampaigns(): Promise<Campaign[]>;
  addCampaign(c: Campaign): Promise<string>;
  updateCampaign(c: Campaign): Promise<void>;
  deleteCampaign(id: string): Promise<void>;

  getBranches(): Promise<Branch[]>;
  addBranch(b: Branch): Promise<string>;
  updateBranch(b: Branch): Promise<void>;
  deleteBranch(id: string): Promise<void>;

  getLeadSources(): Promise<LeadSource[]>;
  addLeadSource(s: LeadSource): Promise<string>;
  updateLeadSource(s: LeadSource): Promise<void>;
  deleteLeadSource(id: string): Promise<void>;

  getTeamMembers(): Promise<TeamMember[]>;
  addTeamMember(m: TeamMember): Promise<string>;
  updateTeamMember(m: TeamMember): Promise<void>;
  deleteTeamMember(id: string): Promise<void>;

  getAllTeachers(): Promise<Teacher[]>;
  getTeachersByBranch(branchId: string): Promise<Teacher[]>;
  getTeacherByUsername(username: string): Promise<Teacher | null>;
  addTeacher(t: Teacher): Promise<string>;
  updateTeacher(t: Teacher): Promise<void>;
  deleteTeacher(id: string): Promise<void>;

  getStudentsByParent(parentUsername: string): Promise<Student[]>;
  getStudentsByGrade(grade: string): Promise<Student[]>;
  addStudent(s: Student): Promise<string>;
  updateStudent(s: Student): Promise<void>;
  deleteStudent(id: string): Promise<void>;
  getAllStudents(): Promise<Student[]>;

  getReportCardsByStudent(studentId: string): Promise<ReportCard[]>;
  addReportCard(rc: ReportCard): Promise<string>;
  updateReportCard(rc: ReportCard): Promise<void>;
  deleteReportCard(id: string): Promise<void>;
  getAllReportCards(): Promise<ReportCard[]>;

  getWorksheetsByGrade(grade: string): Promise<Worksheet[]>;
  getAllWorksheets(): Promise<Worksheet[]>;
  addWorksheet(w: Worksheet): Promise<string>;
  updateWorksheet(w: Worksheet): Promise<void>;
  deleteWorksheet(id: string): Promise<void>;

  getSchoolUpdates(): Promise<SchoolUpdate[]>;
  addSchoolUpdate(u: SchoolUpdate): Promise<string>;
  updateSchoolUpdate(u: SchoolUpdate): Promise<void>;
  deleteSchoolUpdate(id: string): Promise<void>;

  getCalendarEvents(): Promise<CalendarEvent[]>;
  addCalendarEvent(e: CalendarEvent): Promise<string>;
  updateCalendarEvent(e: CalendarEvent): Promise<void>;
  deleteCalendarEvent(id: string): Promise<void>;

  getActivitiesByLead(leadId: string): Promise<LeadActivity[]>;
  getAllLeadActivities(): Promise<LeadActivity[]>;
  addLeadActivity(a: LeadActivity): Promise<string>;
  deleteLeadActivity(id: string): Promise<void>;

  getNotesByLead(leadId: string): Promise<LeadNote[]>;
  addLeadNote(n: LeadNote): Promise<string>;
  deleteLeadNote(id: string): Promise<void>;

  getTasks(): Promise<Task[]>;
  getTasksByAssignee(assignedTo: string): Promise<Task[]>;
  getTasksByLead(leadId: string): Promise<Task[]>;
  addTask(t: Task): Promise<string>;
  updateTask(t: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
