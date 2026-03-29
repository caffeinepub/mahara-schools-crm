# Mahara Schools CRM

## Current State
Full CRM frontend with localStorage only. Backend is an empty actor. Data is lost across devices/sessions. Features: lead management, follow-ups, campaigns, branches, lead sources, team members, and a simple credential-based login.

## Requested Changes (Diff)

### Add
- Motoko backend with persistent stable storage for: Leads, FollowUps, Campaigns, Branches, LeadSources, TeamMembers
- Backend CRUD operations for all entities
- Simple credential-based user authentication stored in backend (admin/admin123, agent/agent123)
- Seed data initialization (only if empty)
- Frontend replaces all localStorage calls with backend canister calls

### Modify
- store.ts → replaced with backend API calls via useActor hook
- App.tsx login handler calls backend.login(username, password)
- All pages fetch data from backend instead of localStorage

### Remove
- localStorage usage for data persistence (may keep session auth in localStorage for UX)

## Implementation Plan
1. Generate Motoko backend with stable vars for all 6 entity types plus user auth
2. Expose CRUD query/update functions for Leads, FollowUps, Campaigns, Branches, LeadSources, TeamMembers
3. Expose login query that returns user info
4. Frontend: create a backend service layer that wraps actor calls
5. Update all pages (Dashboard, LeadManagement, Campaigns, Management) to use async backend calls with loading states
6. Seed data written to backend on first init
