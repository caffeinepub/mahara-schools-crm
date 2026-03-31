/**
 * Pass-through helpers — backend now uses string dates, no conversion needed.
 */
import type {
  Campaign,
  CampaignSend,
  CampaignTemplate,
  FollowUp,
  Lead,
} from "../types";

export function leadFromBackend(l: any): Lead {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    gradeLevel: l.gradeLevel,
    source: l.source,
    status: l.status as Lead["status"],
    assignedAgent: l.assignedAgent,
    notes: l.notes,
    createdAt: l.createdAt,
  };
}

export function leadToBackend(l: Lead): any {
  return { ...l };
}

export function followUpFromBackend(f: any): FollowUp {
  return {
    id: f.id,
    leadId: f.leadId,
    followUpType: f.followUpType as FollowUp["followUpType"],
    assignedTo: f.assignedTo,
    dueDate: f.dueDate,
    completed: f.completed,
    notes: f.notes,
  };
}

export function followUpToBackend(f: FollowUp): any {
  return { ...f };
}

export function campaignFromBackend(c: any): Campaign {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status as Campaign["status"],
    createdAt: c.createdAt,
  };
}

export function campaignToBackend(c: Campaign): any {
  return { ...c };
}

export function campaignTemplateFromBackend(t: any): CampaignTemplate {
  return {
    id: t.id,
    name: t.name,
    mediaType: t.mediaType as CampaignTemplate["mediaType"],
    mediaUrl: t.mediaUrl || "",
    messageText: t.messageText || "",
    createdAt: t.createdAt,
  };
}

export function campaignTemplateToBackend(t: CampaignTemplate): any {
  return { ...t };
}

export function campaignSendFromBackend(s: any): CampaignSend {
  return {
    id: s.id,
    campaignId: s.campaignId,
    templateId: s.templateId,
    leadId: s.leadId,
    leadName: s.leadName,
    sentAt: s.sentAt,
    sentBy: s.sentBy,
    note: s.note || "",
  };
}

export function campaignSendToBackend(s: CampaignSend): any {
  return { ...s };
}
