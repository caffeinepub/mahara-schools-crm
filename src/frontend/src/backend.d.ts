import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeadNote {
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
    leadId: string;
}
export interface Branch {
    id: string;
    name: string;
    location: string;
}
export interface Worksheet {
    id: string;
    title: string;
    subjects: Array<WorksheetSubject>;
    date: string;
    teacherName: string;
    grade: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ReportCard {
    id: string;
    studentId: string;
    subjects: Array<SubjectGrade>;
    date: string;
    overallGrade: string;
    term: string;
    academicYear: string;
    attendance: string;
    teacherComment: string;
}
export interface LeadActivity {
    id: string;
    activityType: string;
    description: string;
    leadId: string;
    performedBy: string;
    timestamp: string;
}
export interface Task {
    id: string;
    title: string;
    assignedTo: string;
    createdAt: string;
    completed: boolean;
    dueDate: string;
    description: string;
    leadId: string;
    priority: string;
}
export interface LeadSource {
    id: string;
    name: string;
}
export interface Teacher {
    id: string;
    username: string;
    subjects: string;
    name: string;
    grade: string;
    branchId: string;
}
export interface SubjectGrade {
    marks: string;
    subject: string;
    grade: string;
    remarks: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface Lead {
    id: string;
    status: string;
    source: string;
    assignedAgent: string;
    name: string;
    createdAt: string;
    email: string;
    gradeLevel: string;
    notes: string;
    phone: string;
}
export interface CampaignSend {
    id: string;
    leadName: string;
    templateId: string;
    note: string;
    campaignId: string;
    sentAt: string;
    sentBy: string;
    leadId: string;
}
export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    color: string;
    category: string;
}
export interface CampaignTemplate {
    id: string;
    name: string;
    createdAt: string;
    mediaUrl: string;
    messageText: string;
    mediaType: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface IntegrationConfig {
    emailProvider: string;
    whatsappAccessToken: string;
    emailFromAddress: string;
    emailApiKey: string;
    whatsappApiUrl: string;
    whatsappPhoneNumberId: string;
    emailFromName: string;
    websiteWebhookSecret: string;
    metaWebhookVerifyToken: string;
}
export interface SchoolUpdate {
    id: string;
    title: string;
    content: string;
    date: string;
    category: string;
}
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    branchId: string;
}
export interface FollowUp {
    id: string;
    followUpType: string;
    assignedTo: string;
    completed: boolean;
    dueDate: string;
    leadId: string;
    notes: string;
}
export interface Campaign {
    id: string;
    status: string;
    name: string;
    createdAt: string;
    description: string;
}
export interface WorksheetSubject {
    subject: string;
    homework: string;
    activities: string;
    notes: string;
}
export interface WhatsAppMessageResult {
    message: string;
    success: boolean;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Student {
    id: string;
    name: string;
    admissionNumber: string;
    grade: string;
    parentUsername: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface StaffProfile {
    id: string;
    name: string;
    designation: string;
    contactNumber: string;
    branchId: string;
    role: string;
    dailyActivities: string;
    notes: string;
    email: string;
}
export interface UserAccount {
    id: string;
    username: string;
    password: string;
    role: string;
    fullName: string;
    email: string;
}
export interface backendInterface {
    addStaffProfile(sp: StaffProfile): Promise<string>;
    addUserAccount(a: UserAccount): Promise<string>;
    deleteStaffProfile(id: string): Promise<void>;
    deleteUserAccount(id: string): Promise<void>;
    getStaffProfiles(): Promise<Array<StaffProfile>>;
    getStaffProfilesByBranch(branchId: string): Promise<Array<StaffProfile>>;
    getStaffProfilesByRole(role: string): Promise<Array<StaffProfile>>;
    getUserAccounts(): Promise<Array<UserAccount>>;
    updateStaffProfile(sp: StaffProfile): Promise<void>;
    updateUserAccount(a: UserAccount): Promise<void>;
    addBranch(b: Branch): Promise<string>;
    addCalendarEvent(e: CalendarEvent): Promise<string>;
    addCampaign(c: Campaign): Promise<string>;
    addCampaignSend(s: CampaignSend): Promise<string>;
    addCampaignTemplate(t: CampaignTemplate): Promise<string>;
    addFollowUp(fu: FollowUp): Promise<string>;
    addLead(lead: Lead): Promise<string>;
    addLeadActivity(a: LeadActivity): Promise<string>;
    addLeadNote(n: LeadNote): Promise<string>;
    addLeadSource(s: LeadSource): Promise<string>;
    addReportCard(rc: ReportCard): Promise<string>;
    addSchoolUpdate(u: SchoolUpdate): Promise<string>;
    addStudent(s: Student): Promise<string>;
    addTask(t: Task): Promise<string>;
    addTeacher(t: Teacher): Promise<string>;
    addTeamMember(m: TeamMember): Promise<string>;
    addWorksheet(w: Worksheet): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBranch(id: string): Promise<void>;
    deleteCalendarEvent(id: string): Promise<void>;
    deleteCampaign(id: string): Promise<void>;
    deleteCampaignTemplate(id: string): Promise<void>;
    deleteFollowUp(id: string): Promise<void>;
    deleteLead(id: string): Promise<void>;
    deleteLeadActivity(id: string): Promise<void>;
    deleteLeadNote(id: string): Promise<void>;
    deleteLeadSource(id: string): Promise<void>;
    deleteReportCard(id: string): Promise<void>;
    deleteSchoolUpdate(id: string): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    deleteTask(id: string): Promise<void>;
    deleteTeacher(id: string): Promise<void>;
    deleteTeamMember(id: string): Promise<void>;
    deleteWorksheet(id: string): Promise<void>;
    getActivitiesByLead(leadId: string): Promise<Array<LeadActivity>>;
    getAllLeadActivities(): Promise<Array<LeadActivity>>;
    getAllReportCards(): Promise<Array<ReportCard>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAllWorksheets(): Promise<Array<Worksheet>>;
    getBranches(): Promise<Array<Branch>>;
    getCalendarEvents(): Promise<Array<CalendarEvent>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampaignSends(): Promise<Array<CampaignSend>>;
    getCampaignSendsByCampaign(campaignId: string): Promise<Array<CampaignSend>>;
    getCampaignSendsByLead(leadId: string): Promise<Array<CampaignSend>>;
    getCampaignTemplates(): Promise<Array<CampaignTemplate>>;
    getCampaigns(): Promise<Array<Campaign>>;
    getFollowUps(): Promise<Array<FollowUp>>;
    getIntegrationConfig(): Promise<IntegrationConfig | null>;
    getLeadSources(): Promise<Array<LeadSource>>;
    getLeads(): Promise<Array<Lead>>;
    getNotesByLead(leadId: string): Promise<Array<LeadNote>>;
    getReportCardsByStudent(studentId: string): Promise<Array<ReportCard>>;
    getSchoolUpdates(): Promise<Array<SchoolUpdate>>;
    getStudentsByGrade(grade: string): Promise<Array<Student>>;
    getStudentsByParent(parentUsername: string): Promise<Array<Student>>;
    getTasks(): Promise<Array<Task>>;
    getTasksByAssignee(assignedTo: string): Promise<Array<Task>>;
    getTasksByLead(leadId: string): Promise<Array<Task>>;
    getTeacherByUsername(username: string): Promise<Teacher | null>;
    getTeachersByBranch(branchId: string): Promise<Array<Teacher>>;
    getTeamMembers(): Promise<Array<TeamMember>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorksheetsByGrade(grade: string): Promise<Array<Worksheet>>;
    initSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    login(credentials: {
        username: string;
        password: string;
    }): Promise<{
        username: string;
        name: string;
        role: string;
    } | null>;
    receiveWebhookLead(payload: {
        source: string;
        name: string;
        email: string;
        gradeLevel: string;
        notes: string;
        phone: string;
    }): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveIntegrationConfig(config: IntegrationConfig): Promise<void>;
    searchLeads(term: string): Promise<Array<Lead>>;
    searchTasks(term: string): Promise<Array<Task>>;
    sendWhatsAppMessage(to: string, message: string): Promise<WhatsAppMessageResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBranch(b: Branch): Promise<void>;
    updateCalendarEvent(e: CalendarEvent): Promise<void>;
    updateCampaign(c: Campaign): Promise<void>;
    updateCampaignTemplate(t: CampaignTemplate): Promise<void>;
    updateFollowUp(fu: FollowUp): Promise<void>;
    updateLead(lead: Lead): Promise<void>;
    updateLeadSource(s: LeadSource): Promise<void>;
    updateReportCard(rc: ReportCard): Promise<void>;
    updateSchoolUpdate(u: SchoolUpdate): Promise<void>;
    updateStudent(s: Student): Promise<void>;
    updateTask(t: Task): Promise<void>;
    updateTeacher(t: Teacher): Promise<void>;
    updateTeamMember(m: TeamMember): Promise<void>;
    updateWorksheet(w: Worksheet): Promise<void>;
}
