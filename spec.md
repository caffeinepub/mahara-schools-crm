# Mahara Schools CRM — Privyr-Style Enhancement

## Current State
Full CRM with leads, follow-ups, campaigns, role-based dashboards (Founder/Admin/CentreHead/Teacher/Parent), Academics section, AI Reply suggestions, Parent Portal. Backend has Lead, FollowUp, Campaign, Branch, LeadSource, TeamMember, Teacher, Student, ReportCard, Worksheet, SchoolUpdate, CalendarEvent.

## Requested Changes (Diff)

### Add
- **LeadActivity** type: timestamped log per lead (call logged, note added, stage moved, WhatsApp opened, email sent, campus tour scheduled)
- **LeadNote** type: multiple notes per lead with author and timestamp
- **Task** type: assignable tasks with due date, priority, optional lead linkage, completion status
- **Lead Detail Drawer**: full side panel for a lead showing — activity timeline, notes, quick action buttons (Call via tel: link, WhatsApp via wa.me link, Send Email via mailto:, Move Stage), follow-ups, add note form
- **Reports & Analytics page**: lead source breakdown (pie/bar), conversion funnel (stage distribution), new leads by month trend, top agents by enrolled count, branch comparison
- **Tasks page**: list of all tasks, create/edit/complete/delete, filter by assigned agent, due today / overdue / upcoming
- **Lead list enhancements**: live search by name/phone/email, filter by status + source + branch, sort by date/status, pagination or virtual scroll
- **Quick Actions in lead cards**: one-click Call, WhatsApp, stage move buttons visible on hover

### Modify
- DashboardPage: add overdue follow-ups count and tasks due today to stats row
- Leads page: add search bar, filter dropdowns, quick action buttons per lead card

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add LeadActivity, LeadNote, Task stable maps + full CRUD + seed data
2. Update `backend.d.ts`: add new types and interface methods
3. Add `LeadDetailDrawer.tsx`: sheet/drawer showing lead info, timeline, notes, quick actions
4. Add `ReportsPage.tsx`: analytics with recharts (bar, pie, funnel)
5. Add `TasksPage.tsx`: task list with create/edit/complete
6. Update `DashboardPage.tsx`: add tasks due today + overdue follow-ups to stats
7. Update leads list in DashboardPage/LeadsSection: search, filter, quick action buttons
8. Update `App.tsx`: add Reports and Tasks to sidebar nav
