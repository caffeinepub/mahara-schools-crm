# Mahara Schools CRM

## Current State
- Full CRM with Admin, Agent, Parent roles
- Parent Portal: Report Cards, Worksheets, Updates, Calendar (view only)
- Admin CRM: Leads, Campaigns, Management (Branches, Team Members, Lead Sources), AI Suggestions
- Backend: persistent on-chain storage, seeded data for leads, parents, students, report cards, worksheets, events
- No upload UI for report cards or worksheets in the admin CRM
- No Teacher role or Teacher dashboard
- No CentreHead role

## Requested Changes (Diff)

### Add
- **New roles hierarchy**: Founder (top admin) > CentreHead (per branch) > Teacher (per class)
- **Teacher type** in backend: teacherName, branchId, grade (class they teach), username
- **Seed new accounts**: founder/founder123, centrehead1/ch123 (Dubai), centrehead2/ch456 (Abu Dhabi), teacher1/teacher123 (Nursery, Dubai), teacher2/teacher456 (Grade 1, Abu Dhabi)
- **Teacher Dashboard**: Shows their branch, class/grade, list of students in their class, ability to add worksheets for their grade, view school updates
- **Admin/Founder/CentreHead upload UI**: New "Academics" section in CRM sidebar with forms to:
  - Add Worksheet (title, grade, subjects/activities)
  - Add Report Card (select student, term, subjects with grades, teacher comment)
  - View and delete existing worksheets and report cards
- **Hierarchy view** in Management page: shows org chart — Founder > CentreHeads by branch > Teachers

### Modify
- `AuthUser` type: extend role to include `"Founder" | "CentreHead" | "Teacher"`
- `store.ts`: update role union type
- `App.tsx`: route Teacher role to TeacherDashboard; Founder/CentreHead get full CRM access
- `LoginPage.tsx`: update demo credentials hint
- Seed data: add Founder, CentreHead, Teacher users
- `initSeedData`: add teacher records linked to branches

### Remove
- Nothing removed

## Implementation Plan
1. Update backend main.mo: add Teacher type, seed Founder/CentreHead/Teacher users and teacher records, add getTeachers/getTeachersByBranch/addTeacher/updateTeacher/deleteTeacher methods, add getReportCardsByBranch helper
2. Update types.ts: extend AuthUser role union
3. Update store.ts: extend role union
4. Update App.tsx: add routing for Teacher and Founder/CentreHead roles
5. Create TeacherDashboard page: shows class info, students list, add worksheet form, school updates
6. Add Academics page in CRM: upload worksheet form, upload report card form, list/delete existing
7. Update Sidebar and AppShell: add Academics nav item for Admin/Founder/CentreHead
8. Update Management page: add hierarchy section showing org structure
9. Update LoginPage: add new demo credentials
