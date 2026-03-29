import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Random "mo:core/Random";

actor {

  type Lead = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    gradeLevel : Text;
    source : Text;
    status : Text;
    assignedAgent : Text;
    notes : Text;
    createdAt : Text;
  };

  type FollowUp = {
    id : Text;
    leadId : Text;
    followUpType : Text;
    assignedTo : Text;
    dueDate : Text;
    completed : Bool;
    notes : Text;
  };

  type Campaign = {
    id : Text;
    name : Text;
    description : Text;
    status : Text;
    createdAt : Text;
  };

  type Branch = {
    id : Text;
    name : Text;
    location : Text;
  };

  type LeadSource = {
    id : Text;
    name : Text;
  };

  type TeamMember = {
    id : Text;
    name : Text;
    role : Text;
    branchId : Text;
  };

  type UserRecord = {
    username : Text;
    password : Text;
    role : Text;
    fullName : Text;
  };

  stable var leadsData : [(Text, Lead)] = [];
  stable var followUpsData : [(Text, FollowUp)] = [];
  stable var campaignsData : [(Text, Campaign)] = [];
  stable var branchesData : [(Text, Branch)] = [];
  stable var leadSourcesData : [(Text, LeadSource)] = [];
  stable var teamMembersData : [(Text, TeamMember)] = [];
  stable var usersData : [(Text, UserRecord)] = [];
  stable var seeded : Bool = false;

  let leads = Map.fromIter<Text, Lead>(leadsData.vals());
  let followUps = Map.fromIter<Text, FollowUp>(followUpsData.vals());
  let campaigns = Map.fromIter<Text, Campaign>(campaignsData.vals());
  let branches = Map.fromIter<Text, Branch>(branchesData.vals());
  let leadSources = Map.fromIter<Text, LeadSource>(leadSourcesData.vals());
  let teamMembers = Map.fromIter<Text, TeamMember>(teamMembersData.vals());
  let users = Map.fromIter<Text, UserRecord>(usersData.vals());

  system func preupgrade() {
    leadsData := leads.entries().toArray();
    followUpsData := followUps.entries().toArray();
    campaignsData := campaigns.entries().toArray();
    branchesData := branches.entries().toArray();
    leadSourcesData := leadSources.entries().toArray();
    teamMembersData := teamMembers.entries().toArray();
    usersData := users.entries().toArray();
  };

  func genId() : async Text {
    let r = (await Random.nat64()) % 1000000;
    let t = Int.abs(Time.now());
    (t * 1000000 + r.toNat()).toText();
  };

  // Auth
  public shared func login(credentials : { username : Text; password : Text }) : async ?{ username : Text; role : Text; name : Text } {
    switch (users.get(credentials.username)) {
      case (?u) {
        if (u.password == credentials.password) {
          ?{ username = u.username; role = u.role; name = u.fullName };
        } else { null };
      };
      case null { null };
    };
  };

  // Seed
  public shared func initSeedData() : async () {
    if (seeded) return;
    seeded := true;

    users.add("admin", { username = "admin"; password = "admin123"; role = "Admin"; fullName = "Admin User" });
    users.add("agent", { username = "agent"; password = "agent123"; role = "Agent"; fullName = "Sara Ahmed" });

    branches.add("b1", { id = "b1"; name = "Mahara — Dubai Main Campus"; location = "Al Quoz, Dubai" });
    branches.add("b2", { id = "b2"; name = "Mahara — Abu Dhabi Branch"; location = "Khalidiyah, Abu Dhabi" });

    leadSources.add("s1", { id = "s1"; name = "Website" });
    leadSources.add("s2", { id = "s2"; name = "Referral" });
    leadSources.add("s3", { id = "s3"; name = "Social Media" });
    leadSources.add("s4", { id = "s4"; name = "Exhibition" });

    teamMembers.add("t1", { id = "t1"; name = "Sara Ahmed"; role = "Admissions Officer"; branchId = "b1" });
    teamMembers.add("t2", { id = "t2"; name = "Khalid Mansoor"; role = "Senior Advisor"; branchId = "b1" });
    teamMembers.add("t3", { id = "t3"; name = "Fatima Al-Zaabi"; role = "Admissions Officer"; branchId = "b2" });

    leads.add("l1", { id = "l1"; name = "Aisha Rahman"; email = "aisha@example.com"; phone = "+971-50-1234567"; gradeLevel = "Grade 7"; source = "Website"; status = "New Inquiry"; assignedAgent = "Sara Ahmed"; notes = "Interested in STEM program. Parent called twice."; createdAt = "2026-03-20T08:00:00Z" });
    leads.add("l2", { id = "l2"; name = "Omar Al-Farsi"; email = "omar@example.com"; phone = "+971-55-9876543"; gradeLevel = "Grade 9"; source = "Referral"; status = "Qualified"; assignedAgent = "Khalid Mansoor"; notes = "Father works at government ministry."; createdAt = "2026-03-18T10:00:00Z" });
    leads.add("l3", { id = "l3"; name = "Lena Kowalski"; email = "lena@example.com"; phone = "+971-52-4561230"; gradeLevel = "Grade 5"; source = "Social Media"; status = "Campus Tour"; assignedAgent = "Sara Ahmed"; notes = "Scheduled campus tour for Saturday morning."; createdAt = "2026-03-15T09:00:00Z" });
    leads.add("l4", { id = "l4"; name = "Yusuf Ibrahim"; email = "yusuf@example.com"; phone = "+971-56-7890123"; gradeLevel = "Grade 11"; source = "Exhibition"; status = "Application Sent"; assignedAgent = "Khalid Mansoor"; notes = "Application submitted. Awaiting board review."; createdAt = "2026-03-10T11:00:00Z" });
    leads.add("l5", { id = "l5"; name = "Sofia Martinez"; email = "sofia@example.com"; phone = "+971-50-3456789"; gradeLevel = "Grade 3"; source = "Website"; status = "Enrolled"; assignedAgent = "Sara Ahmed"; notes = "Successfully enrolled. Starting April 2026."; createdAt = "2026-03-05T08:00:00Z" });
    leads.add("l6", { id = "l6"; name = "Ahmed Hassan"; email = "ahmed@example.com"; phone = "+971-54-6543210"; gradeLevel = "Grade 8"; source = "Referral"; status = "Rejected"; assignedAgent = "Khalid Mansoor"; notes = "Family relocated to another emirate."; createdAt = "2026-02-28T14:00:00Z" });
    leads.add("l7", { id = "l7"; name = "Priya Nair"; email = "priya@example.com"; phone = "+971-55-2345678"; gradeLevel = "Grade 6"; source = "Social Media"; status = "New Inquiry"; assignedAgent = "Sara Ahmed"; notes = "Inquiry via Instagram ad."; createdAt = "2026-03-25T07:00:00Z" });
    leads.add("l8", { id = "l8"; name = "James Okafor"; email = "james@example.com"; phone = "+971-52-8901234"; gradeLevel = "Grade 10"; source = "Exhibition"; status = "Qualified"; assignedAgent = "Khalid Mansoor"; notes = "Very interested in IB curriculum."; createdAt = "2026-03-22T13:00:00Z" });

    followUps.add("f1", { id = "f1"; leadId = "l1"; followUpType = "Call"; assignedTo = "Sara Ahmed"; dueDate = "2026-03-29"; completed = false; notes = "Follow up on program inquiry" });
    followUps.add("f2", { id = "f2"; leadId = "l2"; followUpType = "Email"; assignedTo = "Khalid Mansoor"; dueDate = "2026-03-29"; completed = false; notes = "Send enrollment package" });
    followUps.add("f3", { id = "f3"; leadId = "l3"; followUpType = "Meet"; assignedTo = "Sara Ahmed"; dueDate = "2026-03-30"; completed = false; notes = "Campus tour meeting" });
    followUps.add("f4", { id = "f4"; leadId = "l4"; followUpType = "Call"; assignedTo = "Khalid Mansoor"; dueDate = "2026-03-28"; completed = true; notes = "Confirm application receipt" });

    campaigns.add("c1", { id = "c1"; name = "Spring Enrollment 2026"; description = "Targeted campaign for Q2 enrollments via social media and email blasts."; status = "Active"; createdAt = "2026-03-01T08:00:00Z" });
    campaigns.add("c2", { id = "c2"; name = "Open Day — April 2026"; description = "Invite prospective families for campus open day."; status = "Draft"; createdAt = "2026-03-10T10:00:00Z" });
  };

  // Leads
  public query func getLeads() : async [Lead] { leads.values().toArray() };
  public shared func addLead(lead : Lead) : async Text {
    let id = await genId();
    leads.add(id, { lead with id });
    id;
  };
  public shared func updateLead(lead : Lead) : async () { leads.add(lead.id, lead) };
  public shared func deleteLead(id : Text) : async () { leads.remove(id) };

  // FollowUps
  public query func getFollowUps() : async [FollowUp] { followUps.values().toArray() };
  public shared func addFollowUp(fu : FollowUp) : async Text {
    let id = await genId();
    followUps.add(id, { fu with id });
    id;
  };
  public shared func updateFollowUp(fu : FollowUp) : async () { followUps.add(fu.id, fu) };
  public shared func deleteFollowUp(id : Text) : async () { followUps.remove(id) };

  // Campaigns
  public query func getCampaigns() : async [Campaign] { campaigns.values().toArray() };
  public shared func addCampaign(c : Campaign) : async Text {
    let id = await genId();
    campaigns.add(id, { c with id });
    id;
  };
  public shared func updateCampaign(c : Campaign) : async () { campaigns.add(c.id, c) };
  public shared func deleteCampaign(id : Text) : async () { campaigns.remove(id) };

  // Branches
  public query func getBranches() : async [Branch] { branches.values().toArray() };
  public shared func addBranch(b : Branch) : async Text {
    let id = await genId();
    branches.add(id, { b with id });
    id;
  };
  public shared func updateBranch(b : Branch) : async () { branches.add(b.id, b) };
  public shared func deleteBranch(id : Text) : async () { branches.remove(id) };

  // LeadSources
  public query func getLeadSources() : async [LeadSource] { leadSources.values().toArray() };
  public shared func addLeadSource(s : LeadSource) : async Text {
    let id = await genId();
    leadSources.add(id, { s with id });
    id;
  };
  public shared func updateLeadSource(s : LeadSource) : async () { leadSources.add(s.id, s) };
  public shared func deleteLeadSource(id : Text) : async () { leadSources.remove(id) };

  // TeamMembers
  public query func getTeamMembers() : async [TeamMember] { teamMembers.values().toArray() };
  public shared func addTeamMember(m : TeamMember) : async Text {
    let id = await genId();
    teamMembers.add(id, { m with id });
    id;
  };
  public shared func updateTeamMember(m : TeamMember) : async () { teamMembers.add(m.id, m) };
  public shared func deleteTeamMember(id : Text) : async () { teamMembers.remove(id) };
};
