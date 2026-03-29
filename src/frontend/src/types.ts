export type LeadStatus =
  | "New Inquiry"
  | "Qualified"
  | "Campus Tour"
  | "Application Sent"
  | "Enrolled"
  | "Rejected";

export type FollowUpType = "Call" | "Email" | "Meet";

export type CampaignStatus = "Draft" | "Active" | "Completed";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  gradeLevel: string;
  source: string;
  status: LeadStatus;
  assignedAgent: string;
  notes: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  followUpType: FollowUpType;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  branchId: string;
}

export interface AuthUser {
  username: string;
  role: "Admin" | "Agent";
  name: string;
}
