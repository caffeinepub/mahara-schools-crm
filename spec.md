# Mahara Schools CRM - Version 20

## Current State

Full-stack CRM with persistent on-chain backend. Existing modules:
- Role-based login: Founder, Admin, Centre Heads (2), Teachers, Parents
- Lead Management with pipeline stages, detail drawer, activity timeline, notes, tasks
- Dashboard with branch-specific stats
- Reports & Analytics (funnel, lead sources, trends, agent performance)
- Tasks (create/assign/complete with priorities and due dates)
- Bulk Lead Import (CSV/Excel wizard)
- AI Suggestions (ChatGPT-style, self-contained)
- Campaign Manager with media templates + send history
- Academics upload (worksheets, report cards, updates)
- Staff Management & Hierarchy (Founder → Centre Heads → Teachers tree)
- Parent Portal (report cards, worksheets, calendar, Learning Hub with 8 articles)
- Security hardening (DevTools lock screen, shortcuts blocked)
- Integration config screens: Meta Ads, WhatsApp Business API, Website Leads webhook, Email
- Student Database tab in Management (class-wise, CSV import, all fields)
- Backend: Motoko with persistent stable storage for all entities

## Requested Changes (Diff)

### Add

1. **Admissions Counselor role** (`counselor / counselor123`)
   - Access: Lead Management (view+edit), Student records (view+edit), Calendar & Events (view+edit), WhatsApp campaigns (send only, no history)
   - No access: Staff Management, User Accounts, Analytics, Integrations config, WhatsApp History

2. **WhatsApp History Page** (Founder & Admin only)
   - Separate full-page section in sidebar
   - Chat bubble UI (WhatsApp-style): sent messages on right (green), received on left (grey)
   - Shows both campaign sends (outgoing) + incoming parent replies via Meta webhook
   - Filter by lead name, date, status
   - Message status indicators: sent / delivered / read (with icons)
   - Search across all conversations
   - Each conversation links back to lead CRM profile
   - Backend: WhatsAppMessage type, WhatsAppConversation type stored persistently
   - BSP: Meta Cloud API webhook receiver (parses Meta webhook payload format)
   - Real-time status updates when webhook delivers sent/delivered/read callbacks
   - Incoming parent replies trigger in-app notification badge

3. **Staff Attendance Module**
   - Two modes: Admin manually marks present/absent per staff per day; Teachers check themselves in/out
   - Table view per day with all staff listed, mark attendance inline
   - Monthly summary with attendance % per staff
   - Backend: StaffAttendance type with staffId, date, status (present/absent/late), markedBy, timestamp

4. **Teacher Performance Dashboard**
   - Per-teacher: daily activity uploads count, weekly reports count, monthly chart (bar/line)
   - Activity completion % tracking
   - Parent feedback/ratings (1-5 stars + comment) submitted by parents for their child's teacher
   - Teachers can view their own ratings and comments
   - PTM attendance tracking (did teacher attend PTM meetings)
   - Milestone progress tracking per student per teacher
   - Backend: TeacherPerformance, ParentFeedback, PTMRecord types

5. **Classroom Activity System**
   - Teachers upload daily activities per class: title, description, photos/videos
   - Class-wise activity feed (Founder/Admin/Centre Heads see all; Teachers see their own; Parents see their child's class)
   - Each activity card shows: class, teacher name, date, description, media thumbnails
   - Backend: ClassActivity type with classId, teacherId, date, title, description, mediaUrls, branchId

6. **Built-in Form Builder** (Google Forms-style)
   - Admin/Founder creates forms with title, description, multiple question types: short text, paragraph, multiple choice, checkbox, dropdown, date, rating
   - Publish form to parents (toggle published/draft)
   - Parents see published forms in their portal and can submit responses
   - Responses stored per form per parent
   - Analysis report in CRM: response count, per-question breakdown (charts for MCQ/rating), export to CSV
   - Backend: SchoolForm, FormQuestion, FormResponse types

7. **School Calendar Enhanced**
   - Existing CalendarEvent table extended, no schema break
   - Bulk upload via CSV (Date, Title, Category, Description, Color columns)
   - Manual add/edit/delete events
   - Category filtering (Holiday, PTM, Event, Exam, Other)
   - Month/week/list view toggle

8. **Weekly Blog / Content Section** (AI-assisted)
   - Founder/Admin can create blog posts
   - Prompt-to-blog: admin types a topic prompt → AI (self-contained, no API key) generates full blog article
   - Blog post includes title, content (rich text), category, published date
   - GIF support: search Giphy-style keyword → show placeholder animated GIFs (self-contained, no external API — use CSS/SVG animated placeholders)
   - Published blogs visible to parents in their portal (new "Blog" tab in Parent Portal)
   - Backend: BlogPost type with id, title, content, category, authorName, publishedAt, isDraft, gifKeyword

9. **Parent Portal Enhancements**
   - New "Blog" tab showing published blog posts
   - New "Activities" tab showing their child's class daily activities
   - New "Forms" tab showing published school forms; parents can fill and submit
   - New "Notifications" panel/bell icon: unread count, list of recent notifications (new event, PTM reminder, blog post, form published)
   - Teacher rating widget: rate their child's assigned teacher (1-5 stars + comment text)
   - Backend: ParentNotification type

10. **Sidebar navigation additions**
    - WhatsApp History (Founder/Admin only)
    - Staff Attendance
    - Teacher Performance
    - Classroom Activities
    - Form Builder
    - Blog Manager
    - Calendar (already exists but enhance)

### Modify

- `login()` function: add `counselor` to seeded users with role `counselor`
- Seed data: add `seededV20` flag, seed counselor account, blog posts, form examples
- AppShell/Sidebar: add new nav items with role-gating
- Management page: ensure Students tab always renders (fix any null guards)
- Parent Portal: add Blog, Activities, Forms, Notifications tabs
- Campaigns page: show "WhatsApp History" quick link for Founder/Admin

### Remove
- Nothing removed; all existing functionality preserved

## Implementation Plan

### Backend (Motoko)
1. Add new types: `WhatsAppMessage`, `WhatsAppConversation`, `StaffAttendance`, `TeacherPerformanceRecord`, `ParentFeedback`, `PTMRecord`, `ClassActivity`, `SchoolForm`, `FormQuestion`, `FormResponse`, `BlogPost`, `ParentNotification`
2. Add stable storage vars and Map instances for all new types
3. Add CRUD methods for all new types
4. Add `receiveWhatsAppWebhook` public method parsing Meta Cloud API format (message + status update payloads)
5. Add `submitTeacherRating` method (parent submits rating for a teacher)
6. Add `getTeacherFeedback` method (teacher views own feedback)
7. Add seed data under `seededV20` flag: counselor account, sample blog posts, sample form, sample class activities
8. Update preupgrade/postupgrade to include all new stable vars

### Frontend
1. Add `CounselorDashboard` or reuse existing dashboard with counselor role gating
2. New page: `WhatsAppHistoryPage` (Founder/Admin only) — conversation list sidebar + chat thread view
3. New page: `StaffAttendancePage` — daily grid, manual mark + teacher self check-in
4. New page: `TeacherPerformancePage` — performance cards, charts, parent feedback list
5. New page: `ClassroomActivitiesPage` — activity feed by class, upload form for teachers
6. New page: `FormBuilderPage` — form creation UI, question editor, response analysis
7. New page: `BlogManagerPage` — AI prompt editor, blog list, publish toggle
8. Update `ParentPortal` — add Blog, Activities, Forms, Notifications tabs + teacher rating widget
9. Update `Sidebar` — new nav items with role visibility rules
10. Update `AppShell` routing — wire all new pages
