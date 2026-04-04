import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Random "mo:core/Random";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import List "mo:core/List";
import Text "mo:core/Text";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    role : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  type CampaignTemplate = {
    id : Text;
    name : Text;
    mediaType : Text;
    mediaUrl : Text;
    messageText : Text;
    createdAt : Text;
  };

  type CampaignSend = {
    id : Text;
    campaignId : Text;
    templateId : Text;
    leadId : Text;
    leadName : Text;
    sentAt : Text;
    sentBy : Text;
    note : Text;
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

  type Teacher = {
    id : Text;
    username : Text;
    name : Text;
    branchId : Text;
    grade : Text;
    subjects : Text;
  };

  type Student = {
    id : Text;
    name : Text;
    grade : Text;
    parentUsername : Text;
    admissionNumber : Text;
  };

  type StudentRecord = {
    id : Text;
    rollNumber : Text;
    name : Text;
    grade : Text;
    branchId : Text;
    parentName : Text;
    parentContact : Text;
    parentEmail : Text;
    dateOfBirth : Text;
    address : Text;
    admissionNumber : Text;
  };

  type SubjectGrade = {
    subject : Text;
    grade : Text;
    marks : Text;
    remarks : Text;
  };

  type ReportCard = {
    id : Text;
    studentId : Text;
    term : Text;
    academicYear : Text;
    subjects : [SubjectGrade];
    overallGrade : Text;
    attendance : Text;
    teacherComment : Text;
    date : Text;
  };

  type WorksheetSubject = {
    subject : Text;
    activities : Text;
    homework : Text;
    notes : Text;
  };

  type Worksheet = {
    id : Text;
    grade : Text;
    title : Text;
    date : Text;
    teacherName : Text;
    subjects : [WorksheetSubject];
  };

  type SchoolUpdate = {
    id : Text;
    title : Text;
    content : Text;
    date : Text;
    category : Text;
  };

  type CalendarEvent = {
    id : Text;
    title : Text;
    date : Text;
    category : Text;
    color : Text;
  };

  type LeadActivity = {
    id : Text;
    leadId : Text;
    activityType : Text;
    description : Text;
    performedBy : Text;
    timestamp : Text;
  };

  type LeadNote = {
    id : Text;
    leadId : Text;
    content : Text;
    createdBy : Text;
    createdAt : Text;
  };

  type Task = {
    id : Text;
    title : Text;
    description : Text;
    assignedTo : Text;
    dueDate : Text;
    priority : Text;
    completed : Bool;
    leadId : Text;
    createdAt : Text;
  };

  type IntegrationConfig = {
    whatsappAccessToken : Text;
    whatsappPhoneNumberId : Text;
    whatsappApiUrl : Text;
    emailApiKey : Text;
    emailFromAddress : Text;
    emailFromName : Text;
    emailProvider : Text;
    metaWebhookVerifyToken : Text;
    websiteWebhookSecret : Text;
  };


  type StaffProfile = {
    id : Text;
    name : Text;
    designation : Text;
    contactNumber : Text;
    branchId : Text;
    role : Text;
    dailyActivities : Text;
    notes : Text;
    email : Text;
  };

  type UserAccount = {
    id : Text;
    username : Text;
    password : Text;
    role : Text;
    fullName : Text;
    email : Text;
  };

  var leadsData : [(Text, Lead)] = [];
  var followUpsData : [(Text, FollowUp)] = [];
  var campaignsData : [(Text, Campaign)] = [];
  var campaignTemplatesData : [(Text, CampaignTemplate)] = [];
  var campaignSendsData : [(Text, CampaignSend)] = [];
  var branchesData : [(Text, Branch)] = [];
  var leadSourcesData : [(Text, LeadSource)] = [];
  var teamMembersData : [(Text, TeamMember)] = [];
  var usersData : [(Text, UserRecord)] = [];
  var teachersData : [(Text, Teacher)] = [];
  var studentsData : [(Text, Student)] = [];
  var reportCardsData : [(Text, ReportCard)] = [];
  var worksheetsData : [(Text, Worksheet)] = [];
  var schoolUpdatesData : [(Text, SchoolUpdate)] = [];
  var calendarEventsData : [(Text, CalendarEvent)] = [];
  var leadActivitiesData : [(Text, LeadActivity)] = [];
  var leadNotesData : [(Text, LeadNote)] = [];
  var tasksData : [(Text, Task)] = [];
  var integrationConfigData : ?IntegrationConfig = null;
  var staffProfilesData : [(Text, StaffProfile)] = [];
  var userAccountsData : [(Text, UserAccount)] = [];
  var studentRecordsData : [(Text, StudentRecord)] = [];
  var userProfilesData : [(Principal, UserProfile)] = [];
  var seeded : Bool = false;
  var seededV6 : Bool = false;
  var seededV7 : Bool = false;
  var seededV8 : Bool = false;
  var seededV9 : Bool = false;

  let leads = Map.fromIter<Text, Lead>(leadsData.vals());
  let followUps = Map.fromIter<Text, FollowUp>(followUpsData.vals());
  let campaigns = Map.fromIter<Text, Campaign>(campaignsData.vals());
  let campaignTemplates = Map.fromIter<Text, CampaignTemplate>(campaignTemplatesData.vals());
  let campaignSends = Map.fromIter<Text, CampaignSend>(campaignSendsData.vals());
  let branches = Map.fromIter<Text, Branch>(branchesData.vals());
  let leadSources = Map.fromIter<Text, LeadSource>(leadSourcesData.vals());
  let teamMembers = Map.fromIter<Text, TeamMember>(teamMembersData.vals());
  let users = Map.fromIter<Text, UserRecord>(usersData.vals());
  let teachers = Map.fromIter<Text, Teacher>(teachersData.vals());
  let students = Map.fromIter<Text, Student>(studentsData.vals());
  let reportCards = Map.fromIter<Text, ReportCard>(reportCardsData.vals());
  let worksheets = Map.fromIter<Text, Worksheet>(worksheetsData.vals());
  let schoolUpdates = Map.fromIter<Text, SchoolUpdate>(schoolUpdatesData.vals());
  let calendarEvents = Map.fromIter<Text, CalendarEvent>(calendarEventsData.vals());
  let leadActivities = Map.fromIter<Text, LeadActivity>(leadActivitiesData.vals());
  let leadNotes = Map.fromIter<Text, LeadNote>(leadNotesData.vals());
  let tasks = Map.fromIter<Text, Task>(tasksData.vals());
  let staffProfiles = Map.fromIter<Text, StaffProfile>(staffProfilesData.vals());
  let userAccounts = Map.fromIter<Text, UserAccount>(userAccountsData.vals());
  let studentRecords = Map.fromIter<Text, StudentRecord>(studentRecordsData.vals());

  system func preupgrade() {
    leadsData := leads.entries().toArray();
    followUpsData := followUps.entries().toArray();
    campaignsData := campaigns.entries().toArray();
    campaignTemplatesData := campaignTemplates.entries().toArray();
    campaignSendsData := campaignSends.entries().toArray();
    branchesData := branches.entries().toArray();
    leadSourcesData := leadSources.entries().toArray();
    teamMembersData := teamMembers.entries().toArray();
    usersData := users.entries().toArray();
    teachersData := teachers.entries().toArray();
    studentsData := students.entries().toArray();
    reportCardsData := reportCards.entries().toArray();
    worksheetsData := worksheets.entries().toArray();
    schoolUpdatesData := schoolUpdates.entries().toArray();
    calendarEventsData := calendarEvents.entries().toArray();
    leadActivitiesData := leadActivities.entries().toArray();
    leadNotesData := leadNotes.entries().toArray();
    tasksData := tasks.entries().toArray();
    integrationConfigData := integrationConfig;
    userProfilesData := userProfiles.entries().toArray();
    staffProfilesData := staffProfiles.entries().toArray();
    userAccountsData := userAccounts.entries().toArray();
    studentRecordsData := studentRecords.entries().toArray();
  };

  var integrationConfig : ?IntegrationConfig = null;

  func genId() : async Text {
    let r = (await Random.nat64()) % 1000000;
    let t = Int.abs(Time.now());
    (t * 1000000 + r.toNat()).toText();
  };

  // Auth - public for login
  public shared func login(credentials : { username : Text; password : Text }) : async ?{ username : Text; role : Text; name : Text } {
    switch (users.get(credentials.username)) {
      case (?u) {
        if (u.password == credentials.password) {
          ?{ username = u.username; role = u.role; name = u.fullName };
        } else { null };
      };
      case null {
        // Check dynamic user accounts
        let found = userAccounts.values().toArray().find(
          func(a : UserAccount) : Bool { a.username == credentials.username and a.password == credentials.password }
        );
        switch (found) {
          case (?a) { ?{ username = a.username; role = a.role; name = a.fullName } };
          case null { null };
        };
      };
    };
  };

  public shared ({ caller }) func initSeedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize seed data");
    };

    if (seededV6) {
      if (not seededV7) {
        seededV7 := true;
        leadActivities.add("la1", { id = "la1"; leadId = "l1"; activityType = "Call"; description = "Called family — interested in Nursery programme starting June 2026. Will visit campus."; performedBy = "Priya Sharma"; timestamp = "2026-03-20T09:30:00Z" });
        leadActivities.add("la2", { id = "la2"; leadId = "l1"; activityType = "Stage Change"; description = "Stage moved from New Inquiry to Qualified"; performedBy = "Priya Sharma"; timestamp = "2026-03-21T10:00:00Z" });
        leadActivities.add("la3", { id = "la3"; leadId = "l2"; activityType = "WhatsApp"; description = "Sent daycare schedule and fee structure via WhatsApp."; performedBy = "Rajan Kumar"; timestamp = "2026-03-18T11:00:00Z" });
        leadActivities.add("la4", { id = "la4"; leadId = "l3"; activityType = "Campus Tour"; description = "Campus tour completed at Kondapur. Family impressed with facilities."; performedBy = "Priya Sharma"; timestamp = "2026-03-22T10:30:00Z" });
        leadActivities.add("la5", { id = "la5"; leadId = "l4"; activityType = "Email"; description = "Application form emailed to family for Bachupally branch."; performedBy = "Rajan Kumar"; timestamp = "2026-03-10T12:00:00Z" });
        leadActivities.add("la6", { id = "la6"; leadId = "l5"; activityType = "Enrolled"; description = "Enrollment confirmed. Starting Term 3, April 2026. Fees paid."; performedBy = "Priya Sharma"; timestamp = "2026-03-05T09:00:00Z" });
        leadNotes.add("ln1", { id = "ln1"; leadId = "l1"; content = "Family has two children — second child may also enroll in Pre Nursery next year. Very interested, follow up after campus tour."; createdBy = "Priya Sharma"; createdAt = "2026-03-21T10:05:00Z" });
        leadNotes.add("ln2", { id = "ln2"; leadId = "l2"; content = "Needs full-day slot 9AM-7PM. Father is a doctor with early morning shifts. Mother will drop and pick up."; createdBy = "Rajan Kumar"; createdAt = "2026-03-18T11:30:00Z" });
        leadNotes.add("ln3", { id = "ln3"; leadId = "l3"; content = "Tour went very well. Father asked about transport facility — follow up with bus route details for Kondapur area."; createdBy = "Priya Sharma"; createdAt = "2026-03-22T10:45:00Z" });
        tasks.add("tk1", { id = "tk1"; title = "Send Nursery fee structure to Arjun's family"; description = "Email detailed fee breakup for Nursery programme including Term 3 dates."; assignedTo = "Priya Sharma"; dueDate = "2026-04-01"; priority = "High"; completed = false; leadId = "l1"; createdAt = "2026-03-21T10:00:00Z" });
        tasks.add("tk2", { id = "tk2"; title = "Send bus route details — Kondapur"; description = "Share transport routes and contact for Srinivas Rao family"; assignedTo = "Priya Sharma"; dueDate = "2026-04-02"; priority = "Medium"; completed = false; leadId = "l3"; createdAt = "2026-03-22T11:00:00Z" });
        tasks.add("tk3", { id = "tk3"; title = "Follow up on Meera Iyer application"; description = "Check if application form has been submitted for Bachupally Pre Nursery."; assignedTo = "Rajan Kumar"; dueDate = "2026-03-31"; priority = "High"; completed = false; leadId = "l4"; createdAt = "2026-03-10T12:30:00Z" });
        tasks.add("tk4", { id = "tk4"; title = "Prepare Open Day invites"; description = "Send Open Day invitations for April 2026 to all Qualified and Campus Tour leads."; assignedTo = "admin"; dueDate = "2026-04-05"; priority = "Medium"; completed = false; leadId = ""; createdAt = "2026-03-25T09:00:00Z" });
        tasks.add("tk5", { id = "tk5"; title = "Update Admissions Campaign report"; description = "Compile conversion stats for Admissions 2026-27 campaign for Founder review."; assignedTo = "admin"; dueDate = "2026-04-10"; priority = "Low"; completed = false; leadId = ""; createdAt = "2026-03-25T09:30:00Z" });
      };
      if (not seededV8) {
        seededV8 := true;
        campaignTemplates.add("ct1", { id = "ct1"; name = "Summer Camp 2026 — Video Promo"; mediaType = "video"; mediaUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; messageText = "\u{1F31E} This Summer, Give Your Child More Than Just Holidays!\n\nAt Mahara Summer Camp 2026, every day is filled with fun, learning, and confidence-building experiences \u{1F680}\n\n\u{2728} Build confidence & communication\n\u{2728} Improve focus & discipline\n\u{2728} Hands-on art, craft & DIY fun\n\u{2728} Dance & movement-based learning\n\u{2728} Taekwondo for strength & self-confidence\n\n\u{1F9D1} Personal Attention for Every Child\n\u{231B} Limited Seats \u{2013} Batch Filling Fast!\n\n\u{1F4CD} Bachupally | Kondapur"; createdAt = "2026-03-25T10:00:00Z" });
        campaignTemplates.add("ct2", { id = "ct2"; name = "Admissions Open 2026-27 — Image"; mediaType = "image"; mediaUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600"; messageText = "\u{1F393} Admissions Now Open for 2026-27!\n\nDear {name},\n\nWe are thrilled to announce that Mahara Schools is now accepting applications for {grade} for the academic year 2026-27.\n\n\u{2705} World-class curriculum\n\u{2705} Experienced & passionate educators\n\u{2705} Safe & nurturing environment\n\u{2705} Both Kondapur & Bachupally campuses\n\nSeats are limited — secure your child's place today!\n\n\u{1F4DE} Call us: +91 62817-08102\n\u{1F310} maharaschools.com"; createdAt = "2026-03-25T10:05:00Z" });
        campaignSends.add("cs1", { id = "cs1"; campaignId = "c1"; templateId = "ct2"; leadId = "l1"; leadName = "Arjun Reddy's Parents"; sentAt = "2026-03-26T09:00:00Z"; sentBy = "Priya Sharma"; note = "Sent via WhatsApp" });
      if (not seededV9) {
        seededV9 := true;
        staffProfiles.add("sp1", { id = "sp1"; name = "Centre Head — Kondapur"; designation = "Centre Head"; contactNumber = "+91 628170-8102"; branchId = "b1"; role = "CentreHead"; email = "kondapur@maharaschools.com"; dailyActivities = "Morning assembly oversight, Teacher coordination, Parent meetings, Admin review, Branch performance reports"; notes = "" });
        staffProfiles.add("sp2", { id = "sp2"; name = "Centre Head — Bachupally"; designation = "Centre Head"; contactNumber = "+91 7488-456789"; branchId = "b2"; role = "CentreHead"; email = "bachupally@maharaschools.com"; dailyActivities = "Morning assembly oversight, Teacher coordination, Parent meetings, Admin review, Branch performance reports"; notes = "" });
        staffProfiles.add("sp3", { id = "sp3"; name = "Ms. Monica Joseph"; designation = "Class Teacher — Nursery"; contactNumber = "+91 98480-11001"; branchId = "b1"; role = "Teacher"; email = "monica@maharaschools.com"; dailyActivities = "9:00AM Circle Time & Morning Assembly, 10:00AM Language Development & Phonics, 11:00AM Numeracy, 12:00PM Lunch & Free Play, 2:00PM Creative Arts & Craft, 3:30PM Dismissal & Parent Updates"; notes = "Specializes in early childhood phonics and creative play" });
        staffProfiles.add("sp4", { id = "sp4"; name = "Ms. Tulasi Reddy"; designation = "Class Teacher — Pre Nursery"; contactNumber = "+91 98480-22002"; branchId = "b1"; role = "Teacher"; email = "tulasi@maharaschools.com"; dailyActivities = "9:00AM Sensory Play & Exploration, 10:00AM Circle Time & Songs, 11:00AM Language Development, 12:00PM Lunch & Rest Time, 2:00PM Physical Activity & Outdoor Play, 3:30PM Dismissal"; notes = "Focuses on sensory-based early learning" });
        staffProfiles.add("sp5", { id = "sp5"; name = "Ms. Reena Mathew"; designation = "Class Teacher — KG I"; contactNumber = "+91 98480-33003"; branchId = "b2"; role = "Teacher"; email = "reena@maharaschools.com"; dailyActivities = "9:00AM Morning Assembly, 9:30AM English & Reading, 10:30AM Mathematics, 11:30AM EVS (Environmental Science), 12:00PM Lunch Break, 2:00PM Phonics & Writing Practice, 3:00PM Creative Arts, 3:30PM Dismissal"; notes = "Experienced in structured learning for KG level" });
      };
        campaignSends.add("cs2", { id = "cs2"; campaignId = "c1"; templateId = "ct1"; leadId = "l3"; leadName = "Srinivas Rao"; sentAt = "2026-03-26T09:30:00Z"; sentBy = "Priya Sharma"; note = "Sent via WhatsApp" });
      };
      return;
    };
    seededV6 := true;
    seededV7 := true;
    seededV8 := true;
    seededV9 := true;

    for (k in users.keys().toArray().vals()) { users.remove(k) };
    for (k in branches.keys().toArray().vals()) { branches.remove(k) };
    for (k in teachers.keys().toArray().vals()) { teachers.remove(k) };
    for (k in teamMembers.keys().toArray().vals()) { teamMembers.remove(k) };
    for (k in students.keys().toArray().vals()) { students.remove(k) };
    for (k in reportCards.keys().toArray().vals()) { reportCards.remove(k) };
    for (k in worksheets.keys().toArray().vals()) { worksheets.remove(k) };
    for (k in schoolUpdates.keys().toArray().vals()) { schoolUpdates.remove(k) };
    for (k in calendarEvents.keys().toArray().vals()) { calendarEvents.remove(k) };
    for (k in leadSources.keys().toArray().vals()) { leadSources.remove(k) };
    for (k in leadActivities.keys().toArray().vals()) { leadActivities.remove(k) };
    for (k in leadNotes.keys().toArray().vals()) { leadNotes.remove(k) };
    for (k in tasks.keys().toArray().vals()) { tasks.remove(k) };
    for (k in campaignTemplates.keys().toArray().vals()) { campaignTemplates.remove(k) };
    for (k in campaignSends.keys().toArray().vals()) { campaignSends.remove(k) };

    users.add("founder", { username = "founder"; password = "founder123"; role = "Founder"; fullName = "Manaswini Bandi" });
    users.add("admin", { username = "admin"; password = "admin123"; role = "Admin"; fullName = "Admin — Mahara Schools" });
    users.add("agent", { username = "agent"; password = "agent123"; role = "Agent"; fullName = "Admissions Agent" });
    users.add("centrehead1", { username = "centrehead1"; password = "ch123"; role = "CentreHead"; fullName = "Centre Head — Kondapur" });
    users.add("centrehead2", { username = "centrehead2"; password = "ch456"; role = "CentreHead"; fullName = "Centre Head — Bachupally" });
    users.add("teacher1", { username = "teacher1"; password = "teacher123"; role = "Teacher"; fullName = "Ms. Monica Joseph" });
    users.add("teacher2", { username = "teacher2"; password = "teacher456"; role = "Teacher"; fullName = "Ms. Tulasi Reddy" });
    users.add("teacher3", { username = "teacher3"; password = "teacher789"; role = "Teacher"; fullName = "Ms. Reena Mathew" });
    users.add("parent1", { username = "parent1"; password = "parent123"; role = "Parent"; fullName = "Mr. Naveen Kumar" });
    users.add("parent2", { username = "parent2"; password = "parent456"; role = "Parent"; fullName = "Ms. Priya Srinivas" });

    branches.add("b1", { id = "b1"; name = "Mahara — Kondapur"; location = "Plot No 1539, Raja Rajeshwara Nagar, Kondapur, Hyderabad, Telangana 500084" });
    branches.add("b2", { id = "b2"; name = "Mahara — Bachupally"; location = "Block Diamond Enclave, Plot No 09, Bachupally, Hyderabad, Telangana 500090" });

    teachers.add("tc1", { id = "tc1"; username = "teacher1"; name = "Ms. Monica Joseph"; branchId = "b1"; grade = "Nursery"; subjects = "Language Development, Numeracy, Creative Arts, Physical Development" });
    teachers.add("tc2", { id = "tc2"; username = "teacher2"; name = "Ms. Tulasi Reddy"; branchId = "b1"; grade = "Pre Nursery"; subjects = "Circle Time, Language Development, Sensory Play, Numeracy" });
    teachers.add("tc3", { id = "tc3"; username = "teacher3"; name = "Ms. Reena Mathew"; branchId = "b2"; grade = "Kindergarten I"; subjects = "English, Mathematics, Creative Arts, EVS, Phonics" });

    leadSources.add("s1", { id = "s1"; name = "Website" });
    leadSources.add("s2", { id = "s2"; name = "Referral" });
    leadSources.add("s3", { id = "s3"; name = "Social Media" });
    leadSources.add("s4", { id = "s4"; name = "School Exhibition" });
    leadSources.add("s5", { id = "s5"; name = "Walk-in" });

    teamMembers.add("t1", { id = "t1"; name = "Priya Sharma"; role = "Admissions Officer"; branchId = "b1" });
    teamMembers.add("t2", { id = "t2"; name = "Rajan Kumar"; role = "Senior Advisor"; branchId = "b1" });
    teamMembers.add("t3", { id = "t3"; name = "Anitha Reddy"; role = "Admissions Officer"; branchId = "b2" });

    leads.add("l1", { id = "l1"; name = "Arjun Reddy's Parents"; email = "reddy.family@example.com"; phone = "+91-98480-11234"; gradeLevel = "Nursery (Age 3-4)"; source = "Website"; status = "New Inquiry"; assignedAgent = "Priya Sharma"; notes = "Interested in Nursery programme starting June 2026."; createdAt = "2026-03-20T08:00:00Z" });
    leads.add("l2", { id = "l2"; name = "Kavitha Nair"; email = "kavitha@example.com"; phone = "+91-99890-55678"; gradeLevel = "Daycare (18M-7Y)"; source = "Referral"; status = "Qualified"; assignedAgent = "Rajan Kumar"; notes = "Looking for full-day daycare, 9AM-7PM slot."; createdAt = "2026-03-18T10:00:00Z" });
    leads.add("l3", { id = "l3"; name = "Srinivas Rao"; email = "srao@example.com"; phone = "+91-98765-43210"; gradeLevel = "KG I (Age 4-5)"; source = "Social Media"; status = "Campus Tour"; assignedAgent = "Priya Sharma"; notes = "Campus tour scheduled at Kondapur branch."; createdAt = "2026-03-15T09:00:00Z" });
    leads.add("l4", { id = "l4"; name = "Meera Iyer"; email = "meera@example.com"; phone = "+91-90001-22334"; gradeLevel = "Pre Nursery (Age 2-3)"; source = "School Exhibition"; status = "Application Sent"; assignedAgent = "Rajan Kumar"; notes = "Application submitted for Bachupally branch."; createdAt = "2026-03-10T11:00:00Z" });
    leads.add("l5", { id = "l5"; name = "Venkat Prasad"; email = "venkat@example.com"; phone = "+91-87654-98765"; gradeLevel = "Nursery (Age 3-4)"; source = "Walk-in"; status = "Enrolled"; assignedAgent = "Priya Sharma"; notes = "Enrolled — starting Term 3, April 2026."; createdAt = "2026-03-05T08:00:00Z" });

    followUps.add("f1", { id = "f1"; leadId = "l1"; followUpType = "Call"; assignedTo = "Priya Sharma"; dueDate = "2026-04-01"; completed = false; notes = "Follow up on Nursery programme inquiry" });
    followUps.add("f2", { id = "f2"; leadId = "l2"; followUpType = "Email"; assignedTo = "Rajan Kumar"; dueDate = "2026-04-02"; completed = false; notes = "Send daycare schedule and fee structure" });
    followUps.add("f3", { id = "f3"; leadId = "l3"; followUpType = "Meet"; assignedTo = "Priya Sharma"; dueDate = "2026-04-03"; completed = false; notes = "Campus tour at Kondapur" });

    campaigns.add("c1", { id = "c1"; name = "Admissions Open 2026-27"; description = "Main admissions campaign for the new academic year across Kondapur and Bachupally branches."; status = "Active"; createdAt = "2026-03-01T08:00:00Z" });
    campaigns.add("c2", { id = "c2"; name = "Open Day — April 2026"; description = "Invite prospective families for a campus open day and facility tour."; status = "Draft"; createdAt = "2026-03-10T10:00:00Z" });

    students.add("st1", { id = "st1"; name = "Priya Naveen"; grade = "Nursery"; parentUsername = "parent1"; admissionNumber = "MIS-2024-081" });
    students.add("st2", { id = "st2"; name = "Arjun Naveen"; grade = "Pre Nursery"; parentUsername = "parent1"; admissionNumber = "MIS-2025-014" });
    students.add("st3", { id = "st3"; name = "Aanya Srinivas"; grade = "Kindergarten I"; parentUsername = "parent2"; admissionNumber = "MIS-2023-042" });

    reportCards.add("rc1", { id = "rc1"; studentId = "st1"; term = "Term 2"; academicYear = "2025-2026"; subjects = [{ subject = "Language Development (English)"; grade = "A"; marks = "92/100"; remarks = "Excellent progress in reading and phonics" }, { subject = "Numeracy"; grade = "A"; marks = "88/100"; remarks = "Strong number recognition and counting skills" }, { subject = "Creative Arts"; grade = "A+"; marks = "96/100"; remarks = "Outstanding creativity and expression" }, { subject = "Physical Development"; grade = "B+"; marks = "82/100"; remarks = "Good motor skills development" }, { subject = "Social & Emotional Learning"; grade = "A"; marks = "90/100"; remarks = "Excellent teamwork and communication" }]; overallGrade = "A"; attendance = "94%"; teacherComment = "Priya is a bright and enthusiastic learner."; date = "2026-03-25" });
    reportCards.add("rc2", { id = "rc2"; studentId = "st2"; term = "Term 2"; academicYear = "2025-2026"; subjects = [{ subject = "Language Development (English)"; grade = "B+"; marks = "84/100"; remarks = "Good progress, continue practicing letter sounds" }, { subject = "Numeracy"; grade = "A"; marks = "91/100"; remarks = "Excellent number concepts" }, { subject = "Creative Arts"; grade = "B+"; marks = "85/100"; remarks = "Enjoys art activities" }, { subject = "Physical Development"; grade = "A"; marks = "93/100"; remarks = "Very active and energetic" }, { subject = "Social & Emotional Learning"; grade = "B+"; marks = "86/100"; remarks = "Growing confidence" }]; overallGrade = "B+"; attendance = "91%"; teacherComment = "Arjun is a cheerful and active child."; date = "2026-03-25" });
    reportCards.add("rc3", { id = "rc3"; studentId = "st3"; term = "Term 2"; academicYear = "2025-2026"; subjects = [{ subject = "English"; grade = "A"; marks = "90/100"; remarks = "Excellent reading comprehension" }, { subject = "Mathematics"; grade = "A"; marks = "88/100"; remarks = "Strong arithmetic skills" }, { subject = "Creative Arts"; grade = "A"; marks = "92/100"; remarks = "Very creative" }, { subject = "EVS"; grade = "B+"; marks = "83/100"; remarks = "Curious and attentive" }, { subject = "Phonics"; grade = "A"; marks = "94/100"; remarks = "Outstanding phonics awareness" }]; overallGrade = "A"; attendance = "97%"; teacherComment = "Aanya is an exceptional student."; date = "2026-03-25" });

    worksheets.add("ws1", { id = "ws1"; grade = "Nursery"; title = "Weekly Log Sheet — Feb Week 2"; date = "2026-02-14"; teacherName = "Ms. Monica Joseph"; subjects = [{ subject = "Circle Time"; activities = "Reporting, Roll call, Prayer, Warm-up song, Stories Galorie."; homework = "N/A"; notes = "N/A" }, { subject = "Language Development (English)"; activities = "Alphabets & Numbers HB pg 30-31. Let-a Roll and Read. ABC Phonic Songs."; homework = "N/A"; notes = "N/A" }, { subject = "Numeracy"; activities = "Theme 8 — Animals Around Me. Number song. Alphabets & Numbers WB pg 84."; homework = "N/A"; notes = "N/A" }, { subject = "Creative Arts"; activities = "Nature collage, Finger painting, Paper folding activity."; homework = "N/A"; notes = "N/A" }] });
    worksheets.add("ws2", { id = "ws2"; grade = "Pre Nursery"; title = "Weekly Log Sheet — Feb Week 2"; date = "2026-02-14"; teacherName = "Ms. Tulasi Reddy"; subjects = [{ subject = "Circle Time"; activities = "Good morning song, Calendar activity, Weather chart, Show and tell."; homework = "N/A"; notes = "N/A" }, { subject = "Language Development"; activities = "Colour recognition — Red, Blue, Yellow. Flashcard activities."; homework = "N/A"; notes = "N/A" }, { subject = "Sensory Play"; activities = "Sand play, Water play, Play dough activity."; homework = "N/A"; notes = "N/A" }] });

    schoolUpdates.add("su1", { id = "su1"; title = "Admissions Open for 2026-2027"; content = "Dear Parents, we are pleased to announce that admissions are now open for the academic year 2026-2027. Programs available: Daycare, Pre-Nursery, Nursery, KG I, KG II, and Primary."; date = "2026-03-25"; category = "Announcement" });
    schoolUpdates.add("su2", { id = "su2"; title = "Milestone Meet — March 28, 2026"; content = "We invite you to our Milestone Meet on Saturday, 28th March 2026. Please check the schedule for your child's time slot."; date = "2026-03-24"; category = "Event" });
    schoolUpdates.add("su3", { id = "su3"; title = "Term 2 Report Cards Available"; content = "Term 2 report cards are now available in the Parent Portal. Term 3 begins on April 7, 2026."; date = "2026-03-25"; category = "Announcement" });

    calendarEvents.add("ce1", { id = "ce1"; title = "Holi Celebrations"; date = "2026-03-03"; category = "Event"; color = "#78C8C8" });
    calendarEvents.add("ce2", { id = "ce2"; title = "Founders Day Celebrations"; date = "2026-03-11"; category = "Event"; color = "#78C8C8" });
    calendarEvents.add("ce3", { id = "ce3"; title = "Ugadi Celebrations"; date = "2026-03-18"; category = "Event"; color = "#78C8C8" });
    calendarEvents.add("ce4", { id = "ce4"; title = "Last Working Day — Term 2"; date = "2026-03-25"; category = "Event"; color = "#78C8C8" });
    calendarEvents.add("ce5", { id = "ce5"; title = "Milestone Meet"; date = "2026-03-28"; category = "CCMeet"; color = "#B8A7CC" });
    calendarEvents.add("ce6", { id = "ce6"; title = "Term 3 Begins"; date = "2026-04-07"; category = "Event"; color = "#78C8C8" });

    leadActivities.add("la1", { id = "la1"; leadId = "l1"; activityType = "Call"; description = "Called family — interested in Nursery programme starting June 2026. Will visit campus."; performedBy = "Priya Sharma"; timestamp = "2026-03-20T09:30:00Z" });
    leadActivities.add("la2", { id = "la2"; leadId = "l1"; activityType = "Stage Change"; description = "Stage moved from New Inquiry to Qualified"; performedBy = "Priya Sharma"; timestamp = "2026-03-21T10:00:00Z" });
    leadActivities.add("la3", { id = "la3"; leadId = "l2"; activityType = "WhatsApp"; description = "Sent daycare schedule and fee structure via WhatsApp."; performedBy = "Rajan Kumar"; timestamp = "2026-03-18T11:00:00Z" });
    leadActivities.add("la4", { id = "la4"; leadId = "l3"; activityType = "Campus Tour"; description = "Campus tour completed at Kondapur. Family impressed with facilities."; performedBy = "Priya Sharma"; timestamp = "2026-03-22T10:30:00Z" });
    leadActivities.add("la5", { id = "la5"; leadId = "l4"; activityType = "Email"; description = "Application form emailed to family for Bachupally branch."; performedBy = "Rajan Kumar"; timestamp = "2026-03-10T12:00:00Z" });
    leadActivities.add("la6", { id = "la6"; leadId = "l5"; activityType = "Enrolled"; description = "Enrollment confirmed. Starting Term 3, April 2026. Fees paid."; performedBy = "Priya Sharma"; timestamp = "2026-03-05T09:00:00Z" });

    leadNotes.add("ln1", { id = "ln1"; leadId = "l1"; content = "Family has two children — second child may also enroll in Pre Nursery next year."; createdBy = "Priya Sharma"; createdAt = "2026-03-21T10:05:00Z" });
    leadNotes.add("ln2", { id = "ln2"; leadId = "l2"; content = "Needs full-day slot 9AM-7PM. Father is a doctor with early morning shifts."; createdBy = "Rajan Kumar"; createdAt = "2026-03-18T11:30:00Z" });
    leadNotes.add("ln3", { id = "ln3"; leadId = "l3"; content = "Tour went very well. Father asked about transport facility — follow up with bus route details."; createdBy = "Priya Sharma"; createdAt = "2026-03-22T10:45:00Z" });

    tasks.add("tk1", { id = "tk1"; title = "Send Nursery fee structure to Arjun family"; description = "Email detailed fee breakup for Nursery programme."; assignedTo = "Priya Sharma"; dueDate = "2026-04-01"; priority = "High"; completed = false; leadId = "l1"; createdAt = "2026-03-21T10:00:00Z" });
    tasks.add("tk2", { id = "tk2"; title = "Send bus route details — Kondapur"; description = "Share transport routes and contact for Srinivas Rao family"; assignedTo = "Priya Sharma"; dueDate = "2026-04-02"; priority = "Medium"; completed = false; leadId = "l3"; createdAt = "2026-03-22T11:00:00Z" });
    tasks.add("tk3", { id = "tk3"; title = "Follow up on Meera Iyer application"; description = "Check if application form has been submitted for Bachupally Pre Nursery."; assignedTo = "Rajan Kumar"; dueDate = "2026-03-31"; priority = "High"; completed = false; leadId = "l4"; createdAt = "2026-03-10T12:30:00Z" });
    tasks.add("tk4", { id = "tk4"; title = "Prepare Open Day invites"; description = "Send invitations to all Qualified and Campus Tour leads."; assignedTo = "admin"; dueDate = "2026-04-05"; priority = "Medium"; completed = false; leadId = ""; createdAt = "2026-03-25T09:00:00Z" });

    campaignTemplates.add("ct1", { id = "ct1"; name = "Summer Camp 2026 — Video Promo"; mediaType = "video"; mediaUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; messageText = "\u{1F31E} This Summer, Give Your Child More Than Just Holidays!\n\nAt Mahara Summer Camp 2026, every day is filled with fun, learning, and confidence-building experiences \u{1F680}\n\n\u{2728} Build confidence & communication\n\u{2728} Improve focus & discipline\n\u{2728} Hands-on art, craft & DIY fun\n\u{2728} Dance & movement-based learning\n\n\u{1F9D1} Personal Attention for Every Child\n\u{231B} Limited Seats \u{2013} Batch Filling Fast!\n\n\u{1F4CD} Bachupally | Kondapur"; createdAt = "2026-03-25T10:00:00Z" });
    campaignTemplates.add("ct2", { id = "ct2"; name = "Admissions Open 2026-27 — Image"; mediaType = "image"; mediaUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600"; messageText = "\u{1F393} Admissions Now Open for 2026-27!\n\nDear {name},\n\nWe are thrilled to announce that Mahara Schools is accepting applications for {grade}.\n\n\u{2705} World-class curriculum\n\u{2705} Experienced & passionate educators\n\u{2705} Safe & nurturing environment\n\n\u{1F4DE} Call us: +91 62817-08102\n\u{1F310} maharaschools.com"; createdAt = "2026-03-25T10:05:00Z" });

    campaignSends.add("cs1", { id = "cs1"; campaignId = "c1"; templateId = "ct2"; leadId = "l1"; leadName = "Arjun Reddy's Parents"; sentAt = "2026-03-26T09:00:00Z"; sentBy = "Priya Sharma"; note = "Sent via WhatsApp" });
    campaignSends.add("cs2", { id = "cs2"; campaignId = "c1"; templateId = "ct1"; leadId = "l3"; leadName = "Srinivas Rao"; sentAt = "2026-03-26T09:30:00Z"; sentBy = "Priya Sharma"; note = "Sent via WhatsApp" });
  };

  // Integration Config - Admin only
  public query ({ caller }) func getIntegrationConfig() : async ?IntegrationConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access integration config");
    };
    integrationConfig;
  };

  public shared ({ caller }) func saveIntegrationConfig(config : IntegrationConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save integration config");
    };
    integrationConfig := ?config;
  };

  // Leads - User level access
  public query ({ caller }) func getLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access leads");
    };
    leads.values().toArray();
  };

  public shared ({ caller }) func addLead(lead : Lead) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add leads");
    };
    let id = await genId();
    leads.add(id, { lead with id });
    id;
  };

  public shared ({ caller }) func updateLead(lead : Lead) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update leads");
    };
    leads.add(lead.id, lead);
  };

  public shared ({ caller }) func deleteLead(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete leads");
    };
    leads.remove(id);
  };

  // FollowUps - User level access
  public query ({ caller }) func getFollowUps() : async [FollowUp] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access follow-ups");
    };
    followUps.values().toArray();
  };

  public shared ({ caller }) func addFollowUp(fu : FollowUp) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add follow-ups");
    };
    let id = await genId();
    followUps.add(id, { fu with id });
    id;
  };

  public shared ({ caller }) func updateFollowUp(fu : FollowUp) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update follow-ups");
    };
    followUps.add(fu.id, fu);
  };

  public shared ({ caller }) func deleteFollowUp(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete follow-ups");
    };
    followUps.remove(id);
  };

  // Campaigns - User level access
  public query ({ caller }) func getCampaigns() : async [Campaign] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access campaigns");
    };
    campaigns.values().toArray();
  };

  public shared ({ caller }) func addCampaign(c : Campaign) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add campaigns");
    };
    let id = await genId();
    campaigns.add(id, { c with id });
    id;
  };

  public shared ({ caller }) func updateCampaign(c : Campaign) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update campaigns");
    };
    campaigns.add(c.id, c);
  };

  public shared ({ caller }) func deleteCampaign(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete campaigns");
    };
    campaigns.remove(id);
  };

  // Campaign Templates - User level access
  public query ({ caller }) func getCampaignTemplates() : async [CampaignTemplate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access campaign templates");
    };
    campaignTemplates.values().toArray();
  };

  public shared ({ caller }) func addCampaignTemplate(t : CampaignTemplate) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add campaign templates");
    };
    let id = await genId();
    campaignTemplates.add(id, { t with id });
    id;
  };

  public shared ({ caller }) func updateCampaignTemplate(t : CampaignTemplate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update campaign templates");
    };
    campaignTemplates.add(t.id, t);
  };

  public shared ({ caller }) func deleteCampaignTemplate(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete campaign templates");
    };
    campaignTemplates.remove(id);
  };

  // Campaign Sends - User level access
  public query ({ caller }) func getCampaignSends() : async [CampaignSend] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access campaign sends");
    };
    campaignSends.values().toArray();
  };

  public query ({ caller }) func getCampaignSendsByCampaign(campaignId : Text) : async [CampaignSend] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access campaign sends");
    };
    campaignSends.values().toArray().filter(func(s : CampaignSend) : Bool { s.campaignId == campaignId });
  };

  public query ({ caller }) func getCampaignSendsByLead(leadId : Text) : async [CampaignSend] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access campaign sends");
    };
    campaignSends.values().toArray().filter(func(s : CampaignSend) : Bool { s.leadId == leadId });
  };

  public shared ({ caller }) func addCampaignSend(s : CampaignSend) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add campaign sends");
    };
    let id = await genId();
    campaignSends.add(id, { s with id });
    id;
  };

  // Branches - User level access
  public query ({ caller }) func getBranches() : async [Branch] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access branches");
    };
    branches.values().toArray();
  };

  public shared ({ caller }) func addBranch(b : Branch) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add branches");
    };
    let id = await genId();
    branches.add(id, { b with id });
    id;
  };

  public shared ({ caller }) func updateBranch(b : Branch) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update branches");
    };
    branches.add(b.id, b);
  };

  public shared ({ caller }) func deleteBranch(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete branches");
    };
    branches.remove(id);
  };

  // LeadSources - User level access
  public query ({ caller }) func getLeadSources() : async [LeadSource] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access lead sources");
    };
    leadSources.values().toArray();
  };

  public shared ({ caller }) func addLeadSource(s : LeadSource) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add lead sources");
    };
    let id = await genId();
    leadSources.add(id, { s with id });
    id;
  };

  public shared ({ caller }) func updateLeadSource(s : LeadSource) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update lead sources");
    };
    leadSources.add(s.id, s);
  };

  public shared ({ caller }) func deleteLeadSource(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete lead sources");
    };
    leadSources.remove(id);
  };

  // TeamMembers - User level access
  public query ({ caller }) func getTeamMembers() : async [TeamMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access team members");
    };
    teamMembers.values().toArray();
  };

  public shared ({ caller }) func addTeamMember(m : TeamMember) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add team members");
    };
    let id = await genId();
    teamMembers.add(id, { m with id });
    id;
  };

  public shared ({ caller }) func updateTeamMember(m : TeamMember) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update team members");
    };
    teamMembers.add(m.id, m);
  };

  public shared ({ caller }) func deleteTeamMember(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete team members");
    };
    teamMembers.remove(id);
  };

  // Teachers - User level access
  public query ({ caller }) func getAllTeachers() : async [Teacher] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access teachers");
    };
    teachers.values().toArray();
  };

  public query ({ caller }) func getTeachersByBranch(branchId : Text) : async [Teacher] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access teachers");
    };
    teachers.values().toArray().filter(func(t : Teacher) : Bool { t.branchId == branchId });
  };

  public query ({ caller }) func getTeacherByUsername(username : Text) : async ?Teacher {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access teachers");
    };
    let matched = teachers.values().toArray().filter(func(t : Teacher) : Bool { t.username == username });
    if (matched.size() > 0) { ?matched[0] } else { null };
  };

  public shared ({ caller }) func addTeacher(t : Teacher) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add teachers");
    };
    let id = await genId();
    teachers.add(id, { t with id });
    id;
  };

  public shared ({ caller }) func updateTeacher(t : Teacher) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update teachers");
    };
    teachers.add(t.id, t);
  };

  public shared ({ caller }) func deleteTeacher(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teachers");
    };
    teachers.remove(id);
  };

  // Students - User level access
  public query ({ caller }) func getStudentsByParent(parentUsername : Text) : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access students");
    };
    students.values().toArray().filter(func(s : Student) : Bool { s.parentUsername == parentUsername });
  };

  public query ({ caller }) func getStudentsByGrade(grade : Text) : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access students");
    };
    students.values().toArray().filter(func(s : Student) : Bool { s.grade == grade });
  };

  public shared ({ caller }) func addStudent(s : Student) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    let id = await genId();
    students.add(id, { s with id });
    id;
  };

  public shared ({ caller }) func updateStudent(s : Student) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    students.add(s.id, s);
  };

  public shared ({ caller }) func deleteStudent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access students");
    };
    students.values().toArray();
  };

  // Report Cards - User level access
  public query ({ caller }) func getReportCardsByStudent(studentId : Text) : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access report cards");
    };
    reportCards.values().toArray().filter(func(rc : ReportCard) : Bool { rc.studentId == studentId });
  };

  public shared ({ caller }) func addReportCard(rc : ReportCard) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add report cards");
    };
    let id = await genId();
    reportCards.add(id, { rc with id });
    id;
  };

  public shared ({ caller }) func updateReportCard(rc : ReportCard) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update report cards");
    };
    reportCards.add(rc.id, rc);
  };

  public shared ({ caller }) func deleteReportCard(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete report cards");
    };
    reportCards.remove(id);
  };

  public query ({ caller }) func getAllReportCards() : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access report cards");
    };
    reportCards.values().toArray();
  };

  // Worksheets - User level access
  public query ({ caller }) func getWorksheetsByGrade(grade : Text) : async [Worksheet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access worksheets");
    };
    worksheets.values().toArray().filter(func(w : Worksheet) : Bool { w.grade == grade });
  };

  public query ({ caller }) func getAllWorksheets() : async [Worksheet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access worksheets");
    };
    worksheets.values().toArray();
  };

  public shared ({ caller }) func addWorksheet(w : Worksheet) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add worksheets");
    };
    let id = await genId();
    worksheets.add(id, { w with id });
    id;
  };

  public shared ({ caller }) func updateWorksheet(w : Worksheet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update worksheets");
    };
    worksheets.add(w.id, w);
  };

  public shared ({ caller }) func deleteWorksheet(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete worksheets");
    };
    worksheets.remove(id);
  };

  // School Updates - User level access
  public query ({ caller }) func getSchoolUpdates() : async [SchoolUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access school updates");
    };
    schoolUpdates.values().toArray();
  };

  public shared ({ caller }) func addSchoolUpdate(u : SchoolUpdate) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add school updates");
    };
    let id = await genId();
    schoolUpdates.add(id, { u with id });
    id;
  };

  public shared ({ caller }) func updateSchoolUpdate(u : SchoolUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update school updates");
    };
    schoolUpdates.add(u.id, u);
  };

  public shared ({ caller }) func deleteSchoolUpdate(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete school updates");
    };
    schoolUpdates.remove(id);
  };

  // Calendar Events - User level access
  public query ({ caller }) func getCalendarEvents() : async [CalendarEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access calendar events");
    };
    calendarEvents.values().toArray();
  };

  public shared ({ caller }) func addCalendarEvent(e : CalendarEvent) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add calendar events");
    };
    let id = await genId();
    calendarEvents.add(id, { e with id });
    id;
  };

  public shared ({ caller }) func updateCalendarEvent(e : CalendarEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update calendar events");
    };
    calendarEvents.add(e.id, e);
  };

  public shared ({ caller }) func deleteCalendarEvent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete calendar events");
    };
    calendarEvents.remove(id);
  };

  // Lead Activities - User level access
  public query ({ caller }) func getActivitiesByLead(leadId : Text) : async [LeadActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access lead activities");
    };
    leadActivities.values().toArray().filter(func(a : LeadActivity) : Bool { a.leadId == leadId });
  };

  public query ({ caller }) func getAllLeadActivities() : async [LeadActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access lead activities");
    };
    leadActivities.values().toArray();
  };

  public shared ({ caller }) func addLeadActivity(a : LeadActivity) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add lead activities");
    };
    let id = await genId();
    leadActivities.add(id, { a with id });
    id;
  };

  public shared ({ caller }) func deleteLeadActivity(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete lead activities");
    };
    leadActivities.remove(id);
  };

  // Lead Notes - User level access
  public query ({ caller }) func getNotesByLead(leadId : Text) : async [LeadNote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access lead notes");
    };
    leadNotes.values().toArray().filter(func(n : LeadNote) : Bool { n.leadId == leadId });
  };

  public shared ({ caller }) func addLeadNote(n : LeadNote) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add lead notes");
    };
    let id = await genId();
    leadNotes.add(id, { n with id });
    id;
  };

  public shared ({ caller }) func deleteLeadNote(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete lead notes");
    };
    leadNotes.remove(id);
  };

  // Tasks - User level access
  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };
    tasks.values().toArray();
  };

  public query ({ caller }) func getTasksByAssignee(assignedTo : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };
    tasks.values().toArray().filter(func(t : Task) : Bool { t.assignedTo == assignedTo });
  };

  public query ({ caller }) func getTasksByLead(leadId : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };
    tasks.values().toArray().filter(func(t : Task) : Bool { t.leadId == leadId });
  };

  public shared ({ caller }) func addTask(t : Task) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    let id = await genId();
    tasks.add(id, { t with id });
    id;
  };

  public shared ({ caller }) func updateTask(t : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    tasks.add(t.id, t);
  };

  public shared ({ caller }) func deleteTask(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    tasks.remove(id);
  };

  // Webhook Lead - Public but should validate webhook secret in production
  public shared ({ caller }) func receiveWebhookLead(payload : { name : Text; phone : Text; email : Text; gradeLevel : Text; source : Text; notes : Text }) : async Text {
    // In production, validate payload against integrationConfig.websiteWebhookSecret
    let id = await genId();
    let newLead : Lead = {
      id;
      name = payload.name;
      phone = payload.phone;
      email = payload.email;
      gradeLevel = payload.gradeLevel;
      source = payload.source;
      notes = payload.notes;
      status = "New Inquiry";
      assignedAgent = "";
      createdAt = "";
    };
    leads.add(id, newLead);
    id;
  };

  type WhatsAppMessageResult = {
    success : Bool;
    message : Text;
  };

  // WhatsApp Message - User level access (uses stored credentials)
  public shared ({ caller }) func sendWhatsAppMessage(to : Text, message : Text) : async WhatsAppMessageResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send WhatsApp messages");
    };
    switch (integrationConfig) {
      case (null) {
        {
          success = false;
          message = "Integration config not found";
        };
      };
      case (?config) {
        let url = config.whatsappApiUrl # "/v17.0/" # config.whatsappPhoneNumberId # "/messages";
        let headers = [{
          name = "Authorization";
          value = "Bearer " # config.whatsappAccessToken;
        }];
        let body = "{ \"messaging_product\": \"whatsapp\", \"to\": \"" # to # "\", \"type\": \"text\", \"text\": { \"body\": \"" # message # "\" } }";
        let response = await OutCall.httpPostRequest(url, headers, body, transform);
        {
          success = response.contains(#text "messages");
          message = response;
        };
      };
    };
  };

  // Transformation function for HTTP outcalls
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // StaffProfiles - User level read, Admin write
  public query ({ caller }) func getStaffProfiles() : async [StaffProfile] {
    staffProfiles.values().toArray();
  };

  public query ({ caller }) func getStaffProfilesByBranch(branchId : Text) : async [StaffProfile] {
    staffProfiles.values().toArray().filter(func(sp : StaffProfile) : Bool { sp.branchId == branchId });
  };

  public query ({ caller }) func getStaffProfilesByRole(role : Text) : async [StaffProfile] {
    staffProfiles.values().toArray().filter(func(sp : StaffProfile) : Bool { sp.role == role });
  };

  public shared ({ caller }) func addStaffProfile(sp : StaffProfile) : async Text {
    let id = await genId();
    staffProfiles.add(id, { sp with id });
    id;
  };

  public shared ({ caller }) func updateStaffProfile(sp : StaffProfile) : async () {
    staffProfiles.add(sp.id, sp);
  };

  public shared ({ caller }) func deleteStaffProfile(id : Text) : async () {
    staffProfiles.remove(id);
  };

  // UserAccounts - dynamic login management (Admin only)
  public query ({ caller }) func getUserAccounts() : async [UserAccount] {
    userAccounts.values().toArray();
  };

  public shared ({ caller }) func addUserAccount(a : UserAccount) : async Text {
    let id = await genId();
    userAccounts.add(id, { a with id });
    id;
  };

  public shared ({ caller }) func updateUserAccount(a : UserAccount) : async () {
    userAccounts.add(a.id, a);
  };

  public shared ({ caller }) func deleteUserAccount(id : Text) : async () {
    userAccounts.remove(id);
  };


  func getTasksByLeads(leads : [Lead]) : [Task] {
    let tasksList = List.empty<Task>();
    for (lead in leads.values()) {
      let leadIdTasks = tasks.values().toArray().filter(func(task) { task.leadId == lead.id });
      for (task in leadIdTasks.values()) {
        tasksList.add(task);
      };
    };
    tasksList.toArray();
  };

  public query ({ caller }) func searchLeads(term : Text) : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search leads");
    };
    leads.values().toArray().filter(
      func(l) { l.name.contains(#text term) or l.email.contains(#text term) }
    );
  };

  public query ({ caller }) func searchTasks(term : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search tasks");
    };
    tasks.values().toArray().filter(
      func(t) { t.title.contains(#text term) or t.description.contains(#text term) }
    );
  };
  // StudentRecords - full student database with extended fields
  public query ({ caller }) func getAllStudentRecords() : async [StudentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access student records");
    };
    studentRecords.values().toArray();
  };

  public query ({ caller }) func getStudentRecordsByGrade(grade : Text) : async [StudentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access student records");
    };
    studentRecords.values().toArray().filter(func(s : StudentRecord) : Bool { s.grade == grade });
  };

  public query ({ caller }) func getStudentRecordsByBranch(branchId : Text) : async [StudentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access student records");
    };
    studentRecords.values().toArray().filter(func(s : StudentRecord) : Bool { s.branchId == branchId });
  };

  public shared ({ caller }) func addStudentRecord(s : StudentRecord) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add student records");
    };
    let id = await genId();
    studentRecords.add(id, { s with id });
    id;
  };

  public shared ({ caller }) func addStudentRecordsBulk(records : [StudentRecord]) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add student records");
    };
    let ids = List.empty<Text>();
    for (s in records.vals()) {
      let id = await genId();
      studentRecords.add(id, { s with id });
      ids.add(id);
    };
    ids.toArray();
  };

  public shared ({ caller }) func updateStudentRecord(s : StudentRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update student records");
    };
    studentRecords.add(s.id, s);
  };

  public shared ({ caller }) func deleteStudentRecord(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete student records");
    };
    studentRecords.remove(id);
  };


};
