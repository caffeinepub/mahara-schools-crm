/* eslint-disable */
// @ts-nocheck
// Manually maintained bindings to match main.mo

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;

export class ExternalBlob {
  _blob?: Uint8Array<ArrayBuffer> | null;
  directURL: string;
  onProgress?: (percentage: number) => void = undefined;
  private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
    if (blob) { this._blob = blob; }
    this.directURL = directURL;
  }
  static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
    return new ExternalBlob(url, blob);
  }
  public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this._blob) return this._blob;
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    this._blob = new Uint8Array(await blob.arrayBuffer());
    return this._blob;
  }
  public getDirectURL(): string { return this.directURL; }
  public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }
}

export enum UserRole { admin = "admin", user = "user", guest = "guest" }

export interface backendInterface {
  _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
  login(credentials: { username: string; password: string }): Promise<{ username: string; name: string; role: string } | null>;
  initSeedData(): Promise<void>;
  getLeads(): Promise<any[]>;
  addLead(lead: any): Promise<string>;
  updateLead(lead: any): Promise<void>;
  deleteLead(id: string): Promise<void>;
  getFollowUps(): Promise<any[]>;
  addFollowUp(fu: any): Promise<string>;
  updateFollowUp(fu: any): Promise<void>;
  deleteFollowUp(id: string): Promise<void>;
  getCampaigns(): Promise<any[]>;
  addCampaign(c: any): Promise<string>;
  updateCampaign(c: any): Promise<void>;
  deleteCampaign(id: string): Promise<void>;
  getBranches(): Promise<any[]>;
  addBranch(b: any): Promise<string>;
  updateBranch(b: any): Promise<void>;
  deleteBranch(id: string): Promise<void>;
  getLeadSources(): Promise<any[]>;
  addLeadSource(s: any): Promise<string>;
  updateLeadSource(s: any): Promise<void>;
  deleteLeadSource(id: string): Promise<void>;
  getTeamMembers(): Promise<any[]>;
  addTeamMember(m: any): Promise<string>;
  updateTeamMember(m: any): Promise<void>;
  deleteTeamMember(id: string): Promise<void>;
  getAllTeachers(): Promise<any[]>;
  getTeachersByBranch(branchId: string): Promise<any[]>;
  getTeacherByUsername(username: string): Promise<any | null>;
  addTeacher(t: any): Promise<string>;
  updateTeacher(t: any): Promise<void>;
  deleteTeacher(id: string): Promise<void>;
  getAllStudents(): Promise<any[]>;
  getStudentsByParent(parentUsername: string): Promise<any[]>;
  getStudentsByGrade(grade: string): Promise<any[]>;
  addStudent(s: any): Promise<string>;
  updateStudent(s: any): Promise<void>;
  deleteStudent(id: string): Promise<void>;
  getAllReportCards(): Promise<any[]>;
  getReportCardsByStudent(studentId: string): Promise<any[]>;
  addReportCard(rc: any): Promise<string>;
  updateReportCard(rc: any): Promise<void>;
  deleteReportCard(id: string): Promise<void>;
  getAllWorksheets(): Promise<any[]>;
  getWorksheetsByGrade(grade: string): Promise<any[]>;
  addWorksheet(w: any): Promise<string>;
  updateWorksheet(w: any): Promise<void>;
  deleteWorksheet(id: string): Promise<void>;
  getSchoolUpdates(): Promise<any[]>;
  addSchoolUpdate(u: any): Promise<string>;
  updateSchoolUpdate(u: any): Promise<void>;
  deleteSchoolUpdate(id: string): Promise<void>;
  getCalendarEvents(): Promise<any[]>;
  addCalendarEvent(e: any): Promise<string>;
  updateCalendarEvent(e: any): Promise<void>;
  deleteCalendarEvent(id: string): Promise<void>;
  getAllLeadActivities(): Promise<any[]>;
  getActivitiesByLead(leadId: string): Promise<any[]>;
  addLeadActivity(a: any): Promise<string>;
  deleteLeadActivity(id: string): Promise<void>;
  getNotesByLead(leadId: string): Promise<any[]>;
  addLeadNote(n: any): Promise<string>;
  deleteLeadNote(id: string): Promise<void>;
  getTasks(): Promise<any[]>;
  getTasksByAssignee(assignedTo: string): Promise<any[]>;
  getTasksByLead(leadId: string): Promise<any[]>;
  addTask(t: any): Promise<string>;
  updateTask(t: any): Promise<void>;
  deleteTask(id: string): Promise<void>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  getCallerUserProfile(): Promise<any | null>;
  getUserProfile(user: Principal): Promise<any | null>;
  saveCallerUserProfile(profile: any): Promise<void>;
  isCallerAdmin(): Promise<boolean>;
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  processError?: (error: unknown) => never;
}

export class Backend implements backendInterface {
  constructor(
    private actor: ActorSubclass<_SERVICE>,
    private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    private processError?: (error: unknown) => never
  ) {}

  private async callV(method: string, ...args: any[]): Promise<void> {
    try { await (this.actor as any)[method](...args); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
  private async callR<T>(method: string, ...args: any[]): Promise<T> {
    try { return await (this.actor as any)[method](...args); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }

  async _initializeAccessControlWithSecret(s: string): Promise<void> { return this.callV('_initializeAccessControlWithSecret', s); }
  async login(c: any): Promise<{ username: string; name: string; role: string } | null> {
    const r = await this.callR<any[]>('login', c);
    return r.length === 0 ? null : r[0];
  }
  async initSeedData(): Promise<void> { return this.callV('initSeedData'); }
  async getLeads(): Promise<any[]> { return this.callR('getLeads'); }
  async addLead(lead: any): Promise<string> { return this.callR('addLead', lead); }
  async updateLead(lead: any): Promise<void> { return this.callV('updateLead', lead); }
  async deleteLead(id: string): Promise<void> { return this.callV('deleteLead', id); }
  async getFollowUps(): Promise<any[]> { return this.callR('getFollowUps'); }
  async addFollowUp(fu: any): Promise<string> { return this.callR('addFollowUp', fu); }
  async updateFollowUp(fu: any): Promise<void> { return this.callV('updateFollowUp', fu); }
  async deleteFollowUp(id: string): Promise<void> { return this.callV('deleteFollowUp', id); }
  async getCampaigns(): Promise<any[]> { return this.callR('getCampaigns'); }
  async addCampaign(c: any): Promise<string> { return this.callR('addCampaign', c); }
  async updateCampaign(c: any): Promise<void> { return this.callV('updateCampaign', c); }
  async deleteCampaign(id: string): Promise<void> { return this.callV('deleteCampaign', id); }
  async getBranches(): Promise<any[]> { return this.callR('getBranches'); }
  async addBranch(b: any): Promise<string> { return this.callR('addBranch', b); }
  async updateBranch(b: any): Promise<void> { return this.callV('updateBranch', b); }
  async deleteBranch(id: string): Promise<void> { return this.callV('deleteBranch', id); }
  async getLeadSources(): Promise<any[]> { return this.callR('getLeadSources'); }
  async addLeadSource(s: any): Promise<string> { return this.callR('addLeadSource', s); }
  async updateLeadSource(s: any): Promise<void> { return this.callV('updateLeadSource', s); }
  async deleteLeadSource(id: string): Promise<void> { return this.callV('deleteLeadSource', id); }
  async getTeamMembers(): Promise<any[]> { return this.callR('getTeamMembers'); }
  async addTeamMember(m: any): Promise<string> { return this.callR('addTeamMember', m); }
  async updateTeamMember(m: any): Promise<void> { return this.callV('updateTeamMember', m); }
  async deleteTeamMember(id: string): Promise<void> { return this.callV('deleteTeamMember', id); }
  async getAllTeachers(): Promise<any[]> { return this.callR('getAllTeachers'); }
  async getTeachersByBranch(branchId: string): Promise<any[]> { return this.callR('getTeachersByBranch', branchId); }
  async getTeacherByUsername(username: string): Promise<any | null> {
    const r = await this.callR<any[]>('getTeacherByUsername', username);
    return r.length === 0 ? null : r[0];
  }
  async addTeacher(t: any): Promise<string> { return this.callR('addTeacher', t); }
  async updateTeacher(t: any): Promise<void> { return this.callV('updateTeacher', t); }
  async deleteTeacher(id: string): Promise<void> { return this.callV('deleteTeacher', id); }
  async getAllStudents(): Promise<any[]> { return this.callR('getAllStudents'); }
  async getStudentsByParent(p: string): Promise<any[]> { return this.callR('getStudentsByParent', p); }
  async getStudentsByGrade(g: string): Promise<any[]> { return this.callR('getStudentsByGrade', g); }
  async addStudent(s: any): Promise<string> { return this.callR('addStudent', s); }
  async updateStudent(s: any): Promise<void> { return this.callV('updateStudent', s); }
  async deleteStudent(id: string): Promise<void> { return this.callV('deleteStudent', id); }
  async getAllReportCards(): Promise<any[]> { return this.callR('getAllReportCards'); }
  async getReportCardsByStudent(id: string): Promise<any[]> { return this.callR('getReportCardsByStudent', id); }
  async addReportCard(rc: any): Promise<string> { return this.callR('addReportCard', rc); }
  async updateReportCard(rc: any): Promise<void> { return this.callV('updateReportCard', rc); }
  async deleteReportCard(id: string): Promise<void> { return this.callV('deleteReportCard', id); }
  async getAllWorksheets(): Promise<any[]> { return this.callR('getAllWorksheets'); }
  async getWorksheetsByGrade(g: string): Promise<any[]> { return this.callR('getWorksheetsByGrade', g); }
  async addWorksheet(w: any): Promise<string> { return this.callR('addWorksheet', w); }
  async updateWorksheet(w: any): Promise<void> { return this.callV('updateWorksheet', w); }
  async deleteWorksheet(id: string): Promise<void> { return this.callV('deleteWorksheet', id); }
  async getSchoolUpdates(): Promise<any[]> { return this.callR('getSchoolUpdates'); }
  async addSchoolUpdate(u: any): Promise<string> { return this.callR('addSchoolUpdate', u); }
  async updateSchoolUpdate(u: any): Promise<void> { return this.callV('updateSchoolUpdate', u); }
  async deleteSchoolUpdate(id: string): Promise<void> { return this.callV('deleteSchoolUpdate', id); }
  async getCalendarEvents(): Promise<any[]> { return this.callR('getCalendarEvents'); }
  async addCalendarEvent(e: any): Promise<string> { return this.callR('addCalendarEvent', e); }
  async updateCalendarEvent(e: any): Promise<void> { return this.callV('updateCalendarEvent', e); }
  async deleteCalendarEvent(id: string): Promise<void> { return this.callV('deleteCalendarEvent', id); }
  async getAllLeadActivities(): Promise<any[]> { return this.callR('getAllLeadActivities'); }
  async getActivitiesByLead(leadId: string): Promise<any[]> { return this.callR('getActivitiesByLead', leadId); }
  async addLeadActivity(a: any): Promise<string> { return this.callR('addLeadActivity', a); }
  async deleteLeadActivity(id: string): Promise<void> { return this.callV('deleteLeadActivity', id); }
  async getNotesByLead(leadId: string): Promise<any[]> { return this.callR('getNotesByLead', leadId); }
  async addLeadNote(n: any): Promise<string> { return this.callR('addLeadNote', n); }
  async deleteLeadNote(id: string): Promise<void> { return this.callV('deleteLeadNote', id); }
  async getTasks(): Promise<any[]> { return this.callR('getTasks'); }
  async getTasksByAssignee(assignedTo: string): Promise<any[]> { return this.callR('getTasksByAssignee', assignedTo); }
  async getTasksByLead(leadId: string): Promise<any[]> { return this.callR('getTasksByLead', leadId); }
  async addTask(t: any): Promise<string> { return this.callR('addTask', t); }
  async updateTask(t: any): Promise<void> { return this.callV('updateTask', t); }
  async deleteTask(id: string): Promise<void> { return this.callV('deleteTask', id); }
  async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
    const candid = role === UserRole.admin ? { admin: null } : role === UserRole.user ? { user: null } : { guest: null };
    return this.callV('assignCallerUserRole', user, candid);
  }
  async getCallerUserRole(): Promise<UserRole> {
    const r = await this.callR<any>('getCallerUserRole');
    return 'admin' in r ? UserRole.admin : 'user' in r ? UserRole.user : UserRole.guest;
  }
  async getCallerUserProfile(): Promise<any | null> {
    const r = await this.callR<any[]>('getCallerUserProfile');
    return r.length === 0 ? null : r[0];
  }
  async getUserProfile(user: Principal): Promise<any | null> {
    const r = await this.callR<any[]>('getUserProfile', user);
    return r.length === 0 ? null : r[0];
  }
  async saveCallerUserProfile(profile: any): Promise<void> { return this.callV('saveCallerUserProfile', profile); }
  async isCallerAdmin(): Promise<boolean> { return this.callR('isCallerAdmin'); }
}

export function createActor(
  canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions = {}
): Backend {
  const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions.");
  }
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
