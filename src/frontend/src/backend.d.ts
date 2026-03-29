export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  gradeLevel: string;
  source: string;
  status: string;
  assignedAgent: string;
  notes: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  followUpType: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
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

export interface backendInterface {
  login(credentials: { username: string; password: string }): Promise<{ username: string; role: string; name: string } | null>;
  initSeedData(): Promise<void>;

  getLeads(): Promise<Lead[]>;
  addLead(lead: Lead): Promise<string>;
  updateLead(lead: Lead): Promise<void>;
  deleteLead(id: string): Promise<void>;

  getFollowUps(): Promise<FollowUp[]>;
  addFollowUp(fu: FollowUp): Promise<string>;
  updateFollowUp(fu: FollowUp): Promise<void>;
  deleteFollowUp(id: string): Promise<void>;

  getCampaigns(): Promise<Campaign[]>;
  addCampaign(c: Campaign): Promise<string>;
  updateCampaign(c: Campaign): Promise<void>;
  deleteCampaign(id: string): Promise<void>;

  getBranches(): Promise<Branch[]>;
  addBranch(b: Branch): Promise<string>;
  updateBranch(b: Branch): Promise<void>;
  deleteBranch(id: string): Promise<void>;

  getLeadSources(): Promise<LeadSource[]>;
  addLeadSource(s: LeadSource): Promise<string>;
  updateLeadSource(s: LeadSource): Promise<void>;
  deleteLeadSource(id: string): Promise<void>;

  getTeamMembers(): Promise<TeamMember[]>;
  addTeamMember(m: TeamMember): Promise<string>;
  updateTeamMember(m: TeamMember): Promise<void>;
  deleteTeamMember(id: string): Promise<void>;
}
