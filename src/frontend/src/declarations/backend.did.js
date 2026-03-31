/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const Branch = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'location': IDL.Text });
export const Campaign = IDL.Record({ 'id': IDL.Text, 'status': IDL.Text, 'name': IDL.Text, 'createdAt': IDL.Text, 'description': IDL.Text });
export const FollowUp = IDL.Record({ 'id': IDL.Text, 'followUpType': IDL.Text, 'assignedTo': IDL.Text, 'completed': IDL.Bool, 'dueDate': IDL.Text, 'leadId': IDL.Text, 'notes': IDL.Text });
export const Lead = IDL.Record({ 'id': IDL.Text, 'status': IDL.Text, 'source': IDL.Text, 'assignedAgent': IDL.Text, 'name': IDL.Text, 'createdAt': IDL.Text, 'email': IDL.Text, 'gradeLevel': IDL.Text, 'notes': IDL.Text, 'phone': IDL.Text });
export const LeadSource = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text });
export const TeamMember = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'role': IDL.Text, 'branchId': IDL.Text });
export const Teacher = IDL.Record({ 'id': IDL.Text, 'username': IDL.Text, 'name': IDL.Text, 'branchId': IDL.Text, 'grade': IDL.Text, 'subjects': IDL.Text });
export const Student = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'grade': IDL.Text, 'parentUsername': IDL.Text, 'admissionNumber': IDL.Text });
export const SubjectGrade = IDL.Record({ 'subject': IDL.Text, 'grade': IDL.Text, 'marks': IDL.Text, 'remarks': IDL.Text });
export const ReportCard = IDL.Record({ 'id': IDL.Text, 'studentId': IDL.Text, 'term': IDL.Text, 'academicYear': IDL.Text, 'subjects': IDL.Vec(SubjectGrade), 'overallGrade': IDL.Text, 'attendance': IDL.Text, 'teacherComment': IDL.Text, 'date': IDL.Text });
export const WorksheetSubject = IDL.Record({ 'subject': IDL.Text, 'activities': IDL.Text, 'homework': IDL.Text, 'notes': IDL.Text });
export const Worksheet = IDL.Record({ 'id': IDL.Text, 'grade': IDL.Text, 'title': IDL.Text, 'date': IDL.Text, 'teacherName': IDL.Text, 'subjects': IDL.Vec(WorksheetSubject) });
export const SchoolUpdate = IDL.Record({ 'id': IDL.Text, 'title': IDL.Text, 'content': IDL.Text, 'date': IDL.Text, 'category': IDL.Text });
export const CalendarEvent = IDL.Record({ 'id': IDL.Text, 'title': IDL.Text, 'date': IDL.Text, 'category': IDL.Text, 'color': IDL.Text });
export const LeadActivity = IDL.Record({ 'id': IDL.Text, 'leadId': IDL.Text, 'activityType': IDL.Text, 'description': IDL.Text, 'performedBy': IDL.Text, 'timestamp': IDL.Text });
export const LeadNote = IDL.Record({ 'id': IDL.Text, 'leadId': IDL.Text, 'content': IDL.Text, 'createdBy': IDL.Text, 'createdAt': IDL.Text });
export const Task = IDL.Record({ 'id': IDL.Text, 'title': IDL.Text, 'description': IDL.Text, 'assignedTo': IDL.Text, 'dueDate': IDL.Text, 'priority': IDL.Text, 'completed': IDL.Bool, 'leadId': IDL.Text, 'createdAt': IDL.Text });
export const UserRole = IDL.Variant({ 'admin': IDL.Null, 'user': IDL.Null, 'guest': IDL.Null });
export const UserProfile = IDL.Record({ 'username': IDL.Text, 'name': IDL.Text, 'role': IDL.Text });

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret': IDL.Func([IDL.Text], [], []),
  'login': IDL.Func([IDL.Record({ 'username': IDL.Text, 'password': IDL.Text })], [IDL.Opt(IDL.Record({ 'username': IDL.Text, 'name': IDL.Text, 'role': IDL.Text }))], []),
  'initSeedData': IDL.Func([], [], []),
  'getLeads': IDL.Func([], [IDL.Vec(Lead)], ['query']),
  'addLead': IDL.Func([Lead], [IDL.Text], []),
  'updateLead': IDL.Func([Lead], [], []),
  'deleteLead': IDL.Func([IDL.Text], [], []),
  'getFollowUps': IDL.Func([], [IDL.Vec(FollowUp)], ['query']),
  'addFollowUp': IDL.Func([FollowUp], [IDL.Text], []),
  'updateFollowUp': IDL.Func([FollowUp], [], []),
  'deleteFollowUp': IDL.Func([IDL.Text], [], []),
  'getCampaigns': IDL.Func([], [IDL.Vec(Campaign)], ['query']),
  'addCampaign': IDL.Func([Campaign], [IDL.Text], []),
  'updateCampaign': IDL.Func([Campaign], [], []),
  'deleteCampaign': IDL.Func([IDL.Text], [], []),
  'getBranches': IDL.Func([], [IDL.Vec(Branch)], ['query']),
  'addBranch': IDL.Func([Branch], [IDL.Text], []),
  'updateBranch': IDL.Func([Branch], [], []),
  'deleteBranch': IDL.Func([IDL.Text], [], []),
  'getLeadSources': IDL.Func([], [IDL.Vec(LeadSource)], ['query']),
  'addLeadSource': IDL.Func([LeadSource], [IDL.Text], []),
  'updateLeadSource': IDL.Func([LeadSource], [], []),
  'deleteLeadSource': IDL.Func([IDL.Text], [], []),
  'getTeamMembers': IDL.Func([], [IDL.Vec(TeamMember)], ['query']),
  'addTeamMember': IDL.Func([TeamMember], [IDL.Text], []),
  'updateTeamMember': IDL.Func([TeamMember], [], []),
  'deleteTeamMember': IDL.Func([IDL.Text], [], []),
  'getAllTeachers': IDL.Func([], [IDL.Vec(Teacher)], ['query']),
  'getTeachersByBranch': IDL.Func([IDL.Text], [IDL.Vec(Teacher)], ['query']),
  'getTeacherByUsername': IDL.Func([IDL.Text], [IDL.Opt(Teacher)], ['query']),
  'addTeacher': IDL.Func([Teacher], [IDL.Text], []),
  'updateTeacher': IDL.Func([Teacher], [], []),
  'deleteTeacher': IDL.Func([IDL.Text], [], []),
  'getAllStudents': IDL.Func([], [IDL.Vec(Student)], ['query']),
  'getStudentsByParent': IDL.Func([IDL.Text], [IDL.Vec(Student)], ['query']),
  'getStudentsByGrade': IDL.Func([IDL.Text], [IDL.Vec(Student)], ['query']),
  'addStudent': IDL.Func([Student], [IDL.Text], []),
  'updateStudent': IDL.Func([Student], [], []),
  'deleteStudent': IDL.Func([IDL.Text], [], []),
  'getAllReportCards': IDL.Func([], [IDL.Vec(ReportCard)], ['query']),
  'getReportCardsByStudent': IDL.Func([IDL.Text], [IDL.Vec(ReportCard)], ['query']),
  'addReportCard': IDL.Func([ReportCard], [IDL.Text], []),
  'updateReportCard': IDL.Func([ReportCard], [], []),
  'deleteReportCard': IDL.Func([IDL.Text], [], []),
  'getAllWorksheets': IDL.Func([], [IDL.Vec(Worksheet)], ['query']),
  'getWorksheetsByGrade': IDL.Func([IDL.Text], [IDL.Vec(Worksheet)], ['query']),
  'addWorksheet': IDL.Func([Worksheet], [IDL.Text], []),
  'updateWorksheet': IDL.Func([Worksheet], [], []),
  'deleteWorksheet': IDL.Func([IDL.Text], [], []),
  'getSchoolUpdates': IDL.Func([], [IDL.Vec(SchoolUpdate)], ['query']),
  'addSchoolUpdate': IDL.Func([SchoolUpdate], [IDL.Text], []),
  'updateSchoolUpdate': IDL.Func([SchoolUpdate], [], []),
  'deleteSchoolUpdate': IDL.Func([IDL.Text], [], []),
  'getCalendarEvents': IDL.Func([], [IDL.Vec(CalendarEvent)], ['query']),
  'addCalendarEvent': IDL.Func([CalendarEvent], [IDL.Text], []),
  'updateCalendarEvent': IDL.Func([CalendarEvent], [], []),
  'deleteCalendarEvent': IDL.Func([IDL.Text], [], []),
  'getAllLeadActivities': IDL.Func([], [IDL.Vec(LeadActivity)], ['query']),
  'getActivitiesByLead': IDL.Func([IDL.Text], [IDL.Vec(LeadActivity)], ['query']),
  'addLeadActivity': IDL.Func([LeadActivity], [IDL.Text], []),
  'deleteLeadActivity': IDL.Func([IDL.Text], [], []),
  'getNotesByLead': IDL.Func([IDL.Text], [IDL.Vec(LeadNote)], ['query']),
  'addLeadNote': IDL.Func([LeadNote], [IDL.Text], []),
  'deleteLeadNote': IDL.Func([IDL.Text], [], []),
  'getTasks': IDL.Func([], [IDL.Vec(Task)], ['query']),
  'getTasksByAssignee': IDL.Func([IDL.Text], [IDL.Vec(Task)], ['query']),
  'getTasksByLead': IDL.Func([IDL.Text], [IDL.Vec(Task)], ['query']),
  'addTask': IDL.Func([Task], [IDL.Text], []),
  'updateTask': IDL.Func([Task], [], []),
  'deleteTask': IDL.Func([IDL.Text], [], []),
  'assignCallerUserRole': IDL.Func([IDL.Principal, UserRole], [], []),
  'getCallerUserRole': IDL.Func([], [UserRole], ['query']),
  'getCallerUserProfile': IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getUserProfile': IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'saveCallerUserProfile': IDL.Func([UserProfile], [], []),
  'isCallerAdmin': IDL.Func([], [IDL.Bool], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Branch = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'location': IDL.Text });
  const Campaign = IDL.Record({ 'id': IDL.Text, 'status': IDL.Text, 'name': IDL.Text, 'createdAt': IDL.Text, 'description': IDL.Text });
  const FollowUp = IDL.Record({ 'id': IDL.Text, 'followUpType': IDL.Text, 'assignedTo': IDL.Text, 'completed': IDL.Bool, 'dueDate': IDL.Text, 'leadId': IDL.Text, 'notes': IDL.Text });
  const Lead = IDL.Record({ 'id': IDL.Text, 'status': IDL.Text, 'source': IDL.Text, 'assignedAgent': IDL.Text, 'name': IDL.Text, 'createdAt': IDL.Text, 'email': IDL.Text, 'gradeLevel': IDL.Text, 'notes': IDL.Text, 'phone': IDL.Text });
  const LeadSource = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text });
  const TeamMember = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'role': IDL.Text, 'branchId': IDL.Text });
  const Teacher = IDL.Record({ 'id': IDL.Text, 'username': IDL.Text, 'name': IDL.Text, 'branchId': IDL.Text, 'grade': IDL.Text, 'subjects': IDL.Text });
  const Student = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'grade': IDL.Text, 'parentUsername': IDL.Text, 'admissionNumber': IDL.Text });
  const SubjectGrade = IDL.Record({ 'subject': IDL.Text, 'grade': IDL.Text, 'marks': IDL.Text, 'remarks': IDL.Text });
  const ReportCard = IDL.Record({ 'id': IDL.Text, 'studentId': IDL.Text, 'term': IDL.Text, 'academicYear': IDL.Text, 'subjects': IDL.Vec(SubjectGrade), 'overallGrade': IDL.Text, 'attendance': IDL.Text, 'teacherComment': IDL.Text, 'date': IDL.Text });
  const WorksheetSubject = IDL.Record({ 'subject': IDL.Text, 'activities': IDL.Text, 'homework': IDL.Text, 'notes': IDL.Text });
  const Worksheet = IDL.Record({ 'id': IDL.Text, 'grade': IDL.Text, 'title': IDL.Text, 'date': IDL.Text, 'teacherName': IDL.Text, 'subjects': IDL.Vec(WorksheetSubject) });
  const SchoolUpdate = IDL.Record({ 'id': IDL.Text, 'title': IDL.Text, 'content': IDL.Text, 'date': IDL.Text, 'category': IDL.Text });
  const CalendarEvent = IDL.Record({ 'id': IDL.Text, 'title': IDL.Text, 'date': IDL.Text, 'category': IDL.Text, 'color': IDL.Text });
  const LeadActivity = IDL.Record({ 'id': IDL.Text, 'leadId': IDL.Text, 'activityType': IDL.Text, 'description': IDL.Text, 'performedBy': IDL.Text, 'timestamp': IDL.Text });
  const LeadNote = IDL.Record({ 'id': IDL.Text, 'leadId': IDL.Text, 'content': IDL.Text, 'createdBy': IDL.Text, 'createdAt': IDL.Text });
  const Task = IDL.Record({ 'id': IDL.Text, 'title': IDL.Text, 'description': IDL.Text, 'assignedTo': IDL.Text, 'dueDate': IDL.Text, 'priority': IDL.Text, 'completed': IDL.Bool, 'leadId': IDL.Text, 'createdAt': IDL.Text });
  const UserRole = IDL.Variant({ 'admin': IDL.Null, 'user': IDL.Null, 'guest': IDL.Null });
  const UserProfile = IDL.Record({ 'username': IDL.Text, 'name': IDL.Text, 'role': IDL.Text });

  return IDL.Service({
    '_initializeAccessControlWithSecret': IDL.Func([IDL.Text], [], []),
    'login': IDL.Func([IDL.Record({ 'username': IDL.Text, 'password': IDL.Text })], [IDL.Opt(IDL.Record({ 'username': IDL.Text, 'name': IDL.Text, 'role': IDL.Text }))], []),
    'initSeedData': IDL.Func([], [], []),
    'getLeads': IDL.Func([], [IDL.Vec(Lead)], ['query']),
    'addLead': IDL.Func([Lead], [IDL.Text], []),
    'updateLead': IDL.Func([Lead], [], []),
    'deleteLead': IDL.Func([IDL.Text], [], []),
    'getFollowUps': IDL.Func([], [IDL.Vec(FollowUp)], ['query']),
    'addFollowUp': IDL.Func([FollowUp], [IDL.Text], []),
    'updateFollowUp': IDL.Func([FollowUp], [], []),
    'deleteFollowUp': IDL.Func([IDL.Text], [], []),
    'getCampaigns': IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'addCampaign': IDL.Func([Campaign], [IDL.Text], []),
    'updateCampaign': IDL.Func([Campaign], [], []),
    'deleteCampaign': IDL.Func([IDL.Text], [], []),
    'getBranches': IDL.Func([], [IDL.Vec(Branch)], ['query']),
    'addBranch': IDL.Func([Branch], [IDL.Text], []),
    'updateBranch': IDL.Func([Branch], [], []),
    'deleteBranch': IDL.Func([IDL.Text], [], []),
    'getLeadSources': IDL.Func([], [IDL.Vec(LeadSource)], ['query']),
    'addLeadSource': IDL.Func([LeadSource], [IDL.Text], []),
    'updateLeadSource': IDL.Func([LeadSource], [], []),
    'deleteLeadSource': IDL.Func([IDL.Text], [], []),
    'getTeamMembers': IDL.Func([], [IDL.Vec(TeamMember)], ['query']),
    'addTeamMember': IDL.Func([TeamMember], [IDL.Text], []),
    'updateTeamMember': IDL.Func([TeamMember], [], []),
    'deleteTeamMember': IDL.Func([IDL.Text], [], []),
    'getAllTeachers': IDL.Func([], [IDL.Vec(Teacher)], ['query']),
    'getTeachersByBranch': IDL.Func([IDL.Text], [IDL.Vec(Teacher)], ['query']),
    'getTeacherByUsername': IDL.Func([IDL.Text], [IDL.Opt(Teacher)], ['query']),
    'addTeacher': IDL.Func([Teacher], [IDL.Text], []),
    'updateTeacher': IDL.Func([Teacher], [], []),
    'deleteTeacher': IDL.Func([IDL.Text], [], []),
    'getAllStudents': IDL.Func([], [IDL.Vec(Student)], ['query']),
    'getStudentsByParent': IDL.Func([IDL.Text], [IDL.Vec(Student)], ['query']),
    'getStudentsByGrade': IDL.Func([IDL.Text], [IDL.Vec(Student)], ['query']),
    'addStudent': IDL.Func([Student], [IDL.Text], []),
    'updateStudent': IDL.Func([Student], [], []),
    'deleteStudent': IDL.Func([IDL.Text], [], []),
    'getAllReportCards': IDL.Func([], [IDL.Vec(ReportCard)], ['query']),
    'getReportCardsByStudent': IDL.Func([IDL.Text], [IDL.Vec(ReportCard)], ['query']),
    'addReportCard': IDL.Func([ReportCard], [IDL.Text], []),
    'updateReportCard': IDL.Func([ReportCard], [], []),
    'deleteReportCard': IDL.Func([IDL.Text], [], []),
    'getAllWorksheets': IDL.Func([], [IDL.Vec(Worksheet)], ['query']),
    'getWorksheetsByGrade': IDL.Func([IDL.Text], [IDL.Vec(Worksheet)], ['query']),
    'addWorksheet': IDL.Func([Worksheet], [IDL.Text], []),
    'updateWorksheet': IDL.Func([Worksheet], [], []),
    'deleteWorksheet': IDL.Func([IDL.Text], [], []),
    'getSchoolUpdates': IDL.Func([], [IDL.Vec(SchoolUpdate)], ['query']),
    'addSchoolUpdate': IDL.Func([SchoolUpdate], [IDL.Text], []),
    'updateSchoolUpdate': IDL.Func([SchoolUpdate], [], []),
    'deleteSchoolUpdate': IDL.Func([IDL.Text], [], []),
    'getCalendarEvents': IDL.Func([], [IDL.Vec(CalendarEvent)], ['query']),
    'addCalendarEvent': IDL.Func([CalendarEvent], [IDL.Text], []),
    'updateCalendarEvent': IDL.Func([CalendarEvent], [], []),
    'deleteCalendarEvent': IDL.Func([IDL.Text], [], []),
    'getAllLeadActivities': IDL.Func([], [IDL.Vec(LeadActivity)], ['query']),
    'getActivitiesByLead': IDL.Func([IDL.Text], [IDL.Vec(LeadActivity)], ['query']),
    'addLeadActivity': IDL.Func([LeadActivity], [IDL.Text], []),
    'deleteLeadActivity': IDL.Func([IDL.Text], [], []),
    'getNotesByLead': IDL.Func([IDL.Text], [IDL.Vec(LeadNote)], ['query']),
    'addLeadNote': IDL.Func([LeadNote], [IDL.Text], []),
    'deleteLeadNote': IDL.Func([IDL.Text], [], []),
    'getTasks': IDL.Func([], [IDL.Vec(Task)], ['query']),
    'getTasksByAssignee': IDL.Func([IDL.Text], [IDL.Vec(Task)], ['query']),
    'getTasksByLead': IDL.Func([IDL.Text], [IDL.Vec(Task)], ['query']),
    'addTask': IDL.Func([Task], [IDL.Text], []),
    'updateTask': IDL.Func([Task], [], []),
    'deleteTask': IDL.Func([IDL.Text], [], []),
    'assignCallerUserRole': IDL.Func([IDL.Principal, UserRole], [], []),
    'getCallerUserRole': IDL.Func([], [UserRole], ['query']),
    'getCallerUserProfile': IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getUserProfile': IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'saveCallerUserProfile': IDL.Func([UserProfile], [], []),
    'isCallerAdmin': IDL.Func([], [IDL.Bool], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
