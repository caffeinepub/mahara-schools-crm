# Mahara Schools CRM — Version 15

## Current State
- Full CRM with role-based login (Founder, Admin, CentreHead, Teacher, Parent)
- ManagementPage has 5 tabs: Staff Hierarchy, Teachers, Branches, Lead Sources, Team Members
- Staff Hierarchy tab shows a static org chart (hardcoded founder name "Dr. Anita Sharma" and hardcoded centre head names)
- Teachers tab allows CRUD (name, username, branch, grade, subjects) but no contact number, designation, or daily activities
- No custom login creation UI — all logins are hardcoded in backend seed data
- Logo path uses old asset: `mahara_common_logo_png-019d3e56-ac03-771c-a137-577f15f3bff3.png` — this file shows blank/white square on login and sidebar
- New logo file is available at: `/assets/mahara_common_logo_png-019d4d86-52fa-7582-a628-0e0c9b0a7c23.png`

## Requested Changes (Diff)

### Add
- **StaffProfile** backend type: id, name, designation, contactNumber, branchId, role (CentreHead/Teacher), dailyActivities, notes, email
- Backend functions: addStaffProfile, getStaffProfiles, updateStaffProfile, deleteStaffProfile
- **UserAccount** backend type: username, password, role, fullName, email — allowing dynamic user creation
- Backend functions: addUserAccount, getUserAccounts, updateUserAccount, deleteUserAccount (Founder/Admin only)
- **Staff Hierarchy tab**: Visual tree — Founder (Ms. Manaswini Bandi, hardcoded at top) → Centre Heads per branch (fetched from StaffProfiles, role=CentreHead) → Teachers per branch (fetched from StaffProfiles, role=Teacher). Clicking any staff member opens a detail panel/sheet showing their full profile, contact, designation, and daily activities log.
- **User Accounts tab** in ManagementPage (Founder & Admin only): Create/edit/delete login accounts (username, password, role, full name, email). Visual list of all accounts. 
- Teacher detail panel with daily activities: each teacher entry has a list of daily activities (tasks/schedule they update)

### Modify
- Fix logo path in `LoginPage.tsx` and `Sidebar.tsx`: change from `mahara_common_logo_png-019d3e56-ac03-771c-a137-577f15f3bff3.png` to `mahara_common_logo_png-019d4d86-52fa-7582-a628-0e0c9b0a7c23.png`
- Update Staff Hierarchy tab to pull real data from StaffProfiles instead of hardcoded names
- Update founder name in hierarchy from "Dr. Anita Sharma" to "Ms. Manaswini Bandi"
- Enhance Teacher records to include contactNumber, designation, dailyActivities fields
- ManagementPage: add "User Accounts" tab, visible only to Founder and Admin roles

### Remove
- Hardcoded centre head names ("Mr. Rajan Pillai", "Ms. Hana Al-Blooshi") from StaffHierarchyTab — replace with dynamic data from StaffProfiles

## Implementation Plan
1. Add `StaffProfile` and `UserAccount` types to backend (main.mo)
2. Add backend CRUD functions for StaffProfile and UserAccount
3. Seed initial staff profiles for centre heads and teachers (Kondapur + Bachupally)
4. Update login function to also check dynamically created user accounts
5. Fix logo path in LoginPage.tsx and Sidebar.tsx to use new asset file
6. Rewrite StaffHierarchyTab in ManagementPage to fetch StaffProfiles and render tree
7. Add clickable staff member detail sheet (profile, contact, designation, daily activities)
8. Add User Accounts tab in ManagementPage for Founder/Admin to create/manage logins
9. Validate and build
