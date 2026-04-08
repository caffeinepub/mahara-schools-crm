import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface StudentRecord {
    id: string;
    parentEmail: string;
    parentContact: string;
    dateOfBirth: string;
    name: string;
    admissionNumber: string;
    grade: string;
    rollNumber: string;
    address: string;
    branchId: string;
    parentName: string;
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
export interface StaffProfile {
    id: string;
    name: string;
    designation: string;
    role: string;
    email: string;
    dailyActivities: string;
    notes: string;
    contactNumber: string;
    branchId: string;
}
export interface UserAccount {
    id: string;
    username: string;
    password: string;
    role: string;
    fullName: string;
    email: string;
}
export interface Teacher {
    id: string;
    username: string;
    subjects: string;
    name: string;
    grade: string;
    branchId: string;
}
export interface SchoolForm {
    id: string;
    title: string;
    createdBy: string;
    publishedAt: string;
    description: string;
    isDraft: boolean;
    questions: Array<FormQuestion>;
    responseCount: bigint;
}
export interface SubjectGrade {
    marks: string;
    subject: string;
    grade: string;
    remarks: string;
}
export interface TeacherPerformanceRecord {
    id: string;
    month: string;
    activitiesUploaded: bigint;
    year: string;
    teacherName: string;
    ptmAttended: bigint;
    completionPercent: bigint;
    teacherId: string;
    branchId: string;
    worksheetsSubmitted: bigint;
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
export interface FormQuestion {
    id: string;
    questionText: string;
    questionType: string;
    required: boolean;
    options: Array<string>;
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
export interface Campaign {
    id: string;
    status: string;
    name: string;
    createdAt: string;
    description: string;
}
export interface SchoolUpdate {
    id: string;
    title: string;
    content: string;
    date: string;
    category: string;
}
export interface FormAnswer {
    answer: string;
    questionText: string;
    questionId: string;
}
export interface ClassActivity {
    id: string;
    title: string;
    date: string;
    createdAt: string;
    description: string;
    teacherName: string;
    teacherId: string;
    mediaUrls: Array<string>;
    branchId: string;
    classGrade: string;
}
export interface ParentFeedback {
    id: string;
    studentName: string;
    submittedAt: string;
    teacherName: string;
    comment: string;
    teacherId: string;
    rating: bigint;
    parentUsername: string;
}
export interface Student {
    id: string;
    name: string;
    admissionNumber: string;
    grade: string;
    parentUsername: string;
}
export interface BlogPost {
    id: string;
    title: string;
    content: string;
    tags: string;
    authorName: string;
    publishedAt: string;
    isDraft: boolean;
    category: string;
}
export interface Worksheet {
    id: string;
    title: string;
    subjects: Array<WorksheetSubject>;
    date: string;
    teacherName: string;
    grade: string;
}
export interface LeadActivity {
    id: string;
    activityType: string;
    description: string;
    leadId: string;
    performedBy: string;
    timestamp: string;
}
export interface ParentNotification {
    id: string;
    title: string;
    notifType: string;
    createdAt: string;
    isRead: boolean;
    message: string;
    parentUsername: string;
    linkId: string;
}
export interface LeadSource {
    id: string;
    name: string;
}
export interface FormResponse {
    id: string;
    studentName: string;
    answers: Array<FormAnswer>;
    submittedAt: string;
    parentUsername: string;
    formId: string;
}
export interface WhatsAppMessage {
    id: string;
    status: string;
    direction: string;
    leadName: string;
    messageId: string;
    campaignId: string;
    messageText: string;
    leadId: string;
    leadPhone: string;
    timestamp: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StaffAttendance {
    id: string;
    status: string;
    staffName: string;
    staffId: string;
    date: string;
    markedBy: string;
    timestamp: string;
    branchId: string;
}
export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    color: string;
    category: string;
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
export interface FollowUp {
    id: string;
    followUpType: string;
    assignedTo: string;
    completed: boolean;
    dueDate: string;
    leadId: string;
    notes: string;
}
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    branchId: string;
}
export interface Branch {
    id: string;
    name: string;
    location: string;
}
export interface PTMRecord {
    id: string;
    title: string;
    date: string;
    notes: string;
    teacherId: string;
    attendees: string;
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
export interface LeadNote {
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
    leadId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlogPost(post: BlogPost): Promise<string>;
    addBranch(b: Branch): Promise<string>;
    addCalendarEvent(e: CalendarEvent): Promise<string>;
    addCampaign(c: Campaign): Promise<string>;
    addCampaignSend(s: CampaignSend): Promise<string>;
    addCampaignTemplate(t: CampaignTemplate): Promise<string>;
    addClassActivity(a: ClassActivity): Promise<string>;
    addFollowUp(fu: FollowUp): Promise<string>;
    addForm(form: SchoolForm): Promise<string>;
    addLead(lead: Lead): Promise<string>;
    addLeadActivity(a: LeadActivity): Promise<string>;
    addLeadNote(n: LeadNote): Promise<string>;
    addLeadSource(s: LeadSource): Promise<string>;
    addNotification(notification: ParentNotification): Promise<string>;
    addPTMRecord(record: PTMRecord): Promise<string>;
    addReportCard(rc: ReportCard): Promise<string>;
    addSchoolUpdate(u: SchoolUpdate): Promise<string>;
    addStaffProfile(sp: StaffProfile): Promise<string>;
    addStudent(s: Student): Promise<string>;
    addStudentRecord(s: StudentRecord): Promise<string>;
    addStudentRecordsBulk(records: Array<StudentRecord>): Promise<Array<string>>;
    addTask(t: Task): Promise<string>;
    addTeacher(t: Teacher): Promise<string>;
    addTeamMember(m: TeamMember): Promise<string>;
    addUserAccount(a: UserAccount): Promise<string>;
    addWhatsAppMessage(msg: WhatsAppMessage): Promise<string>;
    addWorksheet(w: Worksheet): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBlogPost(id: string): Promise<void>;
    deleteBranch(id: string): Promise<void>;
    deleteCalendarEvent(id: string): Promise<void>;
    deleteCampaign(id: string): Promise<void>;
    deleteCampaignTemplate(id: string): Promise<void>;
    deleteClassActivity(id: string): Promise<void>;
    deleteFollowUp(id: string): Promise<void>;
    deleteForm(id: string): Promise<void>;
    deleteLead(id: string): Promise<void>;
    deleteLeadActivity(id: string): Promise<void>;
    deleteLeadNote(id: string): Promise<void>;
    deleteLeadSource(id: string): Promise<void>;
    deleteReportCard(id: string): Promise<void>;
    deleteSchoolUpdate(id: string): Promise<void>;
    deleteStaffProfile(id: string): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    deleteStudentRecord(id: string): Promise<void>;
    deleteTask(id: string): Promise<void>;
    deleteTeacher(id: string): Promise<void>;
    deleteTeamMember(id: string): Promise<void>;
    deleteUserAccount(id: string): Promise<void>;
    deleteWorksheet(id: string): Promise<void>;
    getActivitiesByLead(leadId: string): Promise<Array<LeadActivity>>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllClassActivities(): Promise<Array<ClassActivity>>;
    getAllForms(): Promise<Array<SchoolForm>>;
    getAllLeadActivities(): Promise<Array<LeadActivity>>;
    getAllReportCards(): Promise<Array<ReportCard>>;
    getAllStudentRecords(): Promise<Array<StudentRecord>>;
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
    getClassActivitiesByBranch(branchId: string): Promise<Array<ClassActivity>>;
    getClassActivitiesByGrade(grade: string): Promise<Array<ClassActivity>>;
    getClassActivitiesByTeacher(teacherId: string): Promise<Array<ClassActivity>>;
    getFollowUps(): Promise<Array<FollowUp>>;
    getFormById(id: string): Promise<SchoolForm | null>;
    getFormResponses(formId: string): Promise<Array<FormResponse>>;
    getIntegrationConfig(): Promise<IntegrationConfig | null>;
    getLeadSources(): Promise<Array<LeadSource>>;
    getLeads(): Promise<Array<Lead>>;
    getMyFormResponses(parentUsername: string): Promise<Array<FormResponse>>;
    getNotesByLead(leadId: string): Promise<Array<LeadNote>>;
    getNotificationsForParent(parentUsername: string): Promise<Array<ParentNotification>>;
    getPTMRecords(): Promise<Array<PTMRecord>>;
    getPTMRecordsByTeacher(teacherId: string): Promise<Array<PTMRecord>>;
    getParentFeedback(): Promise<Array<ParentFeedback>>;
    getParentFeedbackByTeacher(teacherId: string): Promise<Array<ParentFeedback>>;
    getPublishedBlogPosts(): Promise<Array<BlogPost>>;
    getPublishedForms(): Promise<Array<SchoolForm>>;
    getReportCardsByStudent(studentId: string): Promise<Array<ReportCard>>;
    getSchoolUpdates(): Promise<Array<SchoolUpdate>>;
    getStaffAttendance(): Promise<Array<StaffAttendance>>;
    getStaffAttendanceByDate(date: string): Promise<Array<StaffAttendance>>;
    getStaffAttendanceByStaff(staffId: string): Promise<Array<StaffAttendance>>;
    getStaffProfiles(): Promise<Array<StaffProfile>>;
    getStaffProfilesByBranch(branchId: string): Promise<Array<StaffProfile>>;
    getStaffProfilesByRole(role: string): Promise<Array<StaffProfile>>;
    getStudentRecordsByBranch(branchId: string): Promise<Array<StudentRecord>>;
    getStudentRecordsByGrade(grade: string): Promise<Array<StudentRecord>>;
    getStudentsByGrade(grade: string): Promise<Array<Student>>;
    getStudentsByParent(parentUsername: string): Promise<Array<Student>>;
    getTasks(): Promise<Array<Task>>;
    getTasksByAssignee(assignedTo: string): Promise<Array<Task>>;
    getTasksByLead(leadId: string): Promise<Array<Task>>;
    getTeacherByUsername(username: string): Promise<Teacher | null>;
    getTeacherPerformanceByTeacher(teacherId: string): Promise<Array<TeacherPerformanceRecord>>;
    getTeacherPerformanceRecords(): Promise<Array<TeacherPerformanceRecord>>;
    getTeachersByBranch(branchId: string): Promise<Array<Teacher>>;
    getTeamMembers(): Promise<Array<TeamMember>>;
    getUserAccounts(): Promise<Array<UserAccount>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWhatsAppMessages(): Promise<Array<WhatsAppMessage>>;
    getWhatsAppMessagesByLead(leadId: string): Promise<Array<WhatsAppMessage>>;
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
    markAttendance(a: StaffAttendance): Promise<string>;
    markNotificationRead(id: string): Promise<void>;
    receiveWebhookLead(payload: {
        source: string;
        name: string;
        email: string;
        gradeLevel: string;
        notes: string;
        phone: string;
    }): Promise<string>;
    receiveWhatsAppWebhook(payload: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveIntegrationConfig(config: IntegrationConfig): Promise<void>;
    searchLeads(term: string): Promise<Array<Lead>>;
    searchTasks(term: string): Promise<Array<Task>>;
    sendWhatsAppMessage(to: string, message: string): Promise<WhatsAppMessageResult>;
    submitFormResponse(response: FormResponse): Promise<string>;
    submitParentFeedback(feedback: ParentFeedback): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAttendance(a: StaffAttendance): Promise<void>;
    updateBlogPost(post: BlogPost): Promise<void>;
    updateBranch(b: Branch): Promise<void>;
    updateCalendarEvent(e: CalendarEvent): Promise<void>;
    updateCampaign(c: Campaign): Promise<void>;
    updateCampaignTemplate(t: CampaignTemplate): Promise<void>;
    updateClassActivity(a: ClassActivity): Promise<void>;
    updateFollowUp(fu: FollowUp): Promise<void>;
    updateForm(form: SchoolForm): Promise<void>;
    updateLead(lead: Lead): Promise<void>;
    updateLeadSource(s: LeadSource): Promise<void>;
    updateReportCard(rc: ReportCard): Promise<void>;
    updateSchoolUpdate(u: SchoolUpdate): Promise<void>;
    updateStaffProfile(sp: StaffProfile): Promise<void>;
    updateStudent(s: Student): Promise<void>;
    updateStudentRecord(s: StudentRecord): Promise<void>;
    updateTask(t: Task): Promise<void>;
    updateTeacher(t: Teacher): Promise<void>;
    updateTeamMember(m: TeamMember): Promise<void>;
    updateUserAccount(a: UserAccount): Promise<void>;
    updateWhatsAppMessageStatus(id: string, status: string): Promise<void>;
    updateWorksheet(w: Worksheet): Promise<void>;
    upsertTeacherPerformance(record: TeacherPerformanceRecord): Promise<string>;
}
