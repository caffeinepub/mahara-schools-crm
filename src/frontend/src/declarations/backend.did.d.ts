/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Branch { 'id': string, 'name': string, 'location': string }
export interface Campaign { 'id': string, 'status': string, 'name': string, 'createdAt': string, 'description': string }
export interface FollowUp { 'id': string, 'followUpType': string, 'assignedTo': string, 'completed': boolean, 'dueDate': string, 'leadId': string, 'notes': string }
export interface Lead { 'id': string, 'status': string, 'source': string, 'assignedAgent': string, 'name': string, 'createdAt': string, 'email': string, 'gradeLevel': string, 'notes': string, 'phone': string }
export interface LeadSource { 'id': string, 'name': string }
export interface TeamMember { 'id': string, 'name': string, 'role': string, 'branchId': string }
export interface Teacher { 'id': string, 'username': string, 'name': string, 'branchId': string, 'grade': string, 'subjects': string }
export interface Student { 'id': string, 'name': string, 'grade': string, 'parentUsername': string, 'admissionNumber': string }
export interface SubjectGrade { 'subject': string, 'grade': string, 'marks': string, 'remarks': string }
export interface ReportCard { 'id': string, 'studentId': string, 'term': string, 'academicYear': string, 'subjects': Array<SubjectGrade>, 'overallGrade': string, 'attendance': string, 'teacherComment': string, 'date': string }
export interface WorksheetSubject { 'subject': string, 'activities': string, 'homework': string, 'notes': string }
export interface Worksheet { 'id': string, 'grade': string, 'title': string, 'date': string, 'teacherName': string, 'subjects': Array<WorksheetSubject> }
export interface SchoolUpdate { 'id': string, 'title': string, 'content': string, 'date': string, 'category': string }
export interface CalendarEvent { 'id': string, 'title': string, 'date': string, 'category': string, 'color': string }
export interface LeadActivity { 'id': string, 'leadId': string, 'activityType': string, 'description': string, 'performedBy': string, 'timestamp': string }
export interface LeadNote { 'id': string, 'leadId': string, 'content': string, 'createdBy': string, 'createdAt': string }
export interface Task { 'id': string, 'title': string, 'description': string, 'assignedTo': string, 'dueDate': string, 'priority': string, 'completed': boolean, 'leadId': string, 'createdAt': string }
export interface UserProfile { 'username': string, 'name': string, 'role': string }
export type UserRole = { 'admin': null } | { 'user': null } | { 'guest': null };

export interface _SERVICE {
  '_initializeAccessControlWithSecret': ActorMethod<[string], undefined>,
  'login': ActorMethod<[{ 'username': string, 'password': string }], [] | [{ 'username': string, 'name': string, 'role': string }]>,
  'initSeedData': ActorMethod<[], undefined>,
  'getLeads': ActorMethod<[], Array<Lead>>,
  'addLead': ActorMethod<[Lead], string>,
  'updateLead': ActorMethod<[Lead], undefined>,
  'deleteLead': ActorMethod<[string], undefined>,
  'getFollowUps': ActorMethod<[], Array<FollowUp>>,
  'addFollowUp': ActorMethod<[FollowUp], string>,
  'updateFollowUp': ActorMethod<[FollowUp], undefined>,
  'deleteFollowUp': ActorMethod<[string], undefined>,
  'getCampaigns': ActorMethod<[], Array<Campaign>>,
  'addCampaign': ActorMethod<[Campaign], string>,
  'updateCampaign': ActorMethod<[Campaign], undefined>,
  'deleteCampaign': ActorMethod<[string], undefined>,
  'getBranches': ActorMethod<[], Array<Branch>>,
  'addBranch': ActorMethod<[Branch], string>,
  'updateBranch': ActorMethod<[Branch], undefined>,
  'deleteBranch': ActorMethod<[string], undefined>,
  'getLeadSources': ActorMethod<[], Array<LeadSource>>,
  'addLeadSource': ActorMethod<[LeadSource], string>,
  'updateLeadSource': ActorMethod<[LeadSource], undefined>,
  'deleteLeadSource': ActorMethod<[string], undefined>,
  'getTeamMembers': ActorMethod<[], Array<TeamMember>>,
  'addTeamMember': ActorMethod<[TeamMember], string>,
  'updateTeamMember': ActorMethod<[TeamMember], undefined>,
  'deleteTeamMember': ActorMethod<[string], undefined>,
  'getAllTeachers': ActorMethod<[], Array<Teacher>>,
  'getTeachersByBranch': ActorMethod<[string], Array<Teacher>>,
  'getTeacherByUsername': ActorMethod<[string], [] | [Teacher]>,
  'addTeacher': ActorMethod<[Teacher], string>,
  'updateTeacher': ActorMethod<[Teacher], undefined>,
  'deleteTeacher': ActorMethod<[string], undefined>,
  'getAllStudents': ActorMethod<[], Array<Student>>,
  'getStudentsByParent': ActorMethod<[string], Array<Student>>,
  'getStudentsByGrade': ActorMethod<[string], Array<Student>>,
  'addStudent': ActorMethod<[Student], string>,
  'updateStudent': ActorMethod<[Student], undefined>,
  'deleteStudent': ActorMethod<[string], undefined>,
  'getAllReportCards': ActorMethod<[], Array<ReportCard>>,
  'getReportCardsByStudent': ActorMethod<[string], Array<ReportCard>>,
  'addReportCard': ActorMethod<[ReportCard], string>,
  'updateReportCard': ActorMethod<[ReportCard], undefined>,
  'deleteReportCard': ActorMethod<[string], undefined>,
  'getAllWorksheets': ActorMethod<[], Array<Worksheet>>,
  'getWorksheetsByGrade': ActorMethod<[string], Array<Worksheet>>,
  'addWorksheet': ActorMethod<[Worksheet], string>,
  'updateWorksheet': ActorMethod<[Worksheet], undefined>,
  'deleteWorksheet': ActorMethod<[string], undefined>,
  'getSchoolUpdates': ActorMethod<[], Array<SchoolUpdate>>,
  'addSchoolUpdate': ActorMethod<[SchoolUpdate], string>,
  'updateSchoolUpdate': ActorMethod<[SchoolUpdate], undefined>,
  'deleteSchoolUpdate': ActorMethod<[string], undefined>,
  'getCalendarEvents': ActorMethod<[], Array<CalendarEvent>>,
  'addCalendarEvent': ActorMethod<[CalendarEvent], string>,
  'updateCalendarEvent': ActorMethod<[CalendarEvent], undefined>,
  'deleteCalendarEvent': ActorMethod<[string], undefined>,
  'getAllLeadActivities': ActorMethod<[], Array<LeadActivity>>,
  'getActivitiesByLead': ActorMethod<[string], Array<LeadActivity>>,
  'addLeadActivity': ActorMethod<[LeadActivity], string>,
  'deleteLeadActivity': ActorMethod<[string], undefined>,
  'getNotesByLead': ActorMethod<[string], Array<LeadNote>>,
  'addLeadNote': ActorMethod<[LeadNote], string>,
  'deleteLeadNote': ActorMethod<[string], undefined>,
  'getTasks': ActorMethod<[], Array<Task>>,
  'getTasksByAssignee': ActorMethod<[string], Array<Task>>,
  'getTasksByLead': ActorMethod<[string], Array<Task>>,
  'addTask': ActorMethod<[Task], string>,
  'updateTask': ActorMethod<[Task], undefined>,
  'deleteTask': ActorMethod<[string], undefined>,
  'assignCallerUserRole': ActorMethod<[Principal, UserRole], undefined>,
  'getCallerUserRole': ActorMethod<[], UserRole>,
  'getCallerUserProfile': ActorMethod<[], [] | [UserProfile]>,
  'getUserProfile': ActorMethod<[Principal], [] | [UserProfile]>,
  'saveCallerUserProfile': ActorMethod<[UserProfile], undefined>,
  'isCallerAdmin': ActorMethod<[], boolean>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
