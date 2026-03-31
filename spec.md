# Mahara Schools CRM — Version 11

## Current State
A full-stack CRM on ICP for Mahara Schools (Kondapur + Bachupally). Version 10 includes: persistent backend with leads, follow-ups, campaigns, tasks, activities, notes, users, teachers, students, academics, calendar, reports/analytics. Frontend has role-based dashboards (Founder/Admin/CentreHead/Teacher/Parent), AI reply page with static templates, Campaigns CRUD, Reports with pie/bar/line charts, Lead Detail Drawer, Tasks, and basic security (right-click/keyboard shortcuts blocked).

## Requested Changes (Diff)

### Add
- **CampaignTemplate** backend type: id, name, mediaType (image/video/gif/pdf/none), mediaUrl, messageText, createdAt
- **CampaignSend** backend type: id, campaignId, templateId, leadId, leadName, sentAt, sentBy, note
- Backend CRUD: getCampaignTemplates, addCampaignTemplate, updateCampaignTemplate, deleteCampaignTemplate, getCampaignSends, getCampaignSendsByCampaign, getCampaignSendsByLead, addCampaignSend
- CSV/Excel lead import UI in LeadManagementPage (file upload → parse → preview → bulk addLead calls)
- Chat-style AI suggestion engine in AIReplyPage (no external API; keyword + lead context based response engine with typing animation)
- Campaigns page: new "Templates" tab (create template with media URL + formatted text + WhatsApp-style preview) and "Send History" tab (track which leads received which campaign)
- DevTools detection: monitor window size change; if devtools detected, overlay warning. CSS user-select: none. Disable drag and text selection events globally.

### Modify
- **ReportsPage.tsx**: Remove `<Legend />` from PieChart (labels already render on slices) to fix overlap in 220px height container
- **AIReplyPage.tsx**: Replace static template cycling with a ChatGPT-style chat panel. User types context (e.g. "parent is worried about fees") and system generates a tailored message using lead's name/grade/stage/source. Keep custom template section at bottom.
- **CampaignsPage.tsx**: Add tabs — Campaigns | Templates | Send History. Templates tab: builder + WhatsApp preview. Send History tab: table of all sends.
- **main.tsx**: Add DevTools detector (window outer/inner dimension delta monitoring), CSS user-select none, drag disabled
- **seededV8**: Add seed flag; on first V8 seed add 2 example campaign templates

### Remove
- `<Legend />` from the PieChart in ReportsPage (fixes overlap bug)

## Implementation Plan
1. Update `src/backend/main.mo`: add CampaignTemplate + CampaignSend types, stable vars, Maps, preupgrade entries, CRUD functions, seededV8 seed block with 2 sample templates
2. Update `src/frontend/src/backend.d.ts`: add CampaignTemplate + CampaignSend interfaces and all new function signatures
3. Update `src/frontend/src/types.ts`: add CampaignTemplate + CampaignSend types
4. Update `src/frontend/src/utils/backendAdapters.ts`: add adapters for new types
5. Fix `ReportsPage.tsx`: remove `<Legend />` from PieChart
6. Upgrade `AIReplyPage.tsx`: chat-style interface with smart keyword engine
7. Upgrade `CampaignsPage.tsx`: add Templates and Send History tabs
8. Add CSV/Excel import modal to `LeadManagementPage.tsx` (install xlsx)
9. Update `main.tsx` with advanced security (DevTools detection, CSS protections)
