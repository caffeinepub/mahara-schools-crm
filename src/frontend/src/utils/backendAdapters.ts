/**
 * Conversion helpers between backend (bigint nanoseconds) and frontend (string) types.
 */
import type {
  Campaign as BackendCampaign,
  FollowUp as BackendFollowUp,
  Lead as BackendLead,
} from "../backend";
import type { Campaign, FollowUp, Lead } from "../types";

// nanoseconds bigint -> ISO string
export function nsToIso(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toISOString();
}

// nanoseconds bigint -> date string YYYY-MM-DD
export function nsToDate(ns: bigint): string {
  return nsToIso(ns).slice(0, 10);
}

// ISO or date string -> nanoseconds bigint
export function isoToNs(iso: string): bigint {
  return BigInt(Date.parse(iso)) * 1_000_000n;
}

export function leadFromBackend(l: BackendLead): Lead {
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
    createdAt: nsToIso(l.createdAt),
  };
}

export function leadToBackend(l: Lead): BackendLead {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    gradeLevel: l.gradeLevel,
    source: l.source,
    status: l.status,
    assignedAgent: l.assignedAgent,
    notes: l.notes,
    createdAt: isoToNs(l.createdAt || new Date().toISOString()),
  };
}

export function followUpFromBackend(f: BackendFollowUp): FollowUp {
  return {
    id: f.id,
    leadId: f.leadId,
    followUpType: f.followUpType as FollowUp["followUpType"],
    assignedTo: f.assignedTo,
    dueDate: nsToDate(f.dueDate),
    completed: f.completed,
    notes: f.notes,
  };
}

export function followUpToBackend(f: FollowUp): BackendFollowUp {
  return {
    id: f.id,
    leadId: f.leadId,
    followUpType: f.followUpType,
    assignedTo: f.assignedTo,
    dueDate: isoToNs(f.dueDate),
    completed: f.completed,
    notes: f.notes,
  };
}

export function campaignFromBackend(c: BackendCampaign): Campaign {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status as Campaign["status"],
    createdAt: nsToIso(c.createdAt),
  };
}

export function campaignToBackend(c: Campaign): BackendCampaign {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    createdAt: isoToNs(c.createdAt || new Date().toISOString()),
  };
}
