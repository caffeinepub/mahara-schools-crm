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

  type Teacher = {
    id : Text;
    username : Text;
    name : Text;
    branchId : Text;
    grade : Text;
    subjects : Text;
  };

  // Parent Portal Types
  type Student = {
    id : Text;
    name : Text;
    grade : Text;
    parentUsername : Text;
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

  stable var leadsData : [(Text, Lead)] = [];
  stable var followUpsData : [(Text, FollowUp)] = [];
  stable var campaignsData : [(Text, Campaign)] = [];
  stable var branchesData : [(Text, Branch)] = [];
  stable var leadSourcesData : [(Text, LeadSource)] = [];
  stable var teamMembersData : [(Text, TeamMember)] = [];
  stable var usersData : [(Text, UserRecord)] = [];
  stable var teachersData : [(Text, Teacher)] = [];
  stable var studentsData : [(Text, Student)] = [];
  stable var reportCardsData : [(Text, ReportCard)] = [];
  stable var worksheetsData : [(Text, Worksheet)] = [];
  stable var schoolUpdatesData : [(Text, SchoolUpdate)] = [];
  stable var calendarEventsData : [(Text, CalendarEvent)] = [];
  stable var seeded : Bool = false;

  let leads = Map.fromIter<Text, Lead>(leadsData.vals());
  let followUps = Map.fromIter<Text, FollowUp>(followUpsData.vals());
  let campaigns = Map.fromIter<Text, Campaign>(campaignsData.vals());
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

  system func preupgrade() {
    leadsData := leads.entries().toArray();
    followUpsData := followUps.entries().toArray();
    campaignsData := campaigns.entries().toArray();
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

    // Users
    users.add("founder", { username = "founder"; password = "founder123"; role = "Founder"; fullName = "Dr. Anita Sharma" });
    users.add("admin", { username = "admin"; password = "admin123"; role = "Admin"; fullName = "Admin User" });
    users.add("agent", { username = "agent"; password = "agent123"; role = "Agent"; fullName = "Sara Ahmed" });
    users.add("centrehead1", { username = "centrehead1"; password = "ch123"; role = "CentreHead"; fullName = "Mr. Rajan Pillai" });
    users.add("centrehead2", { username = "centrehead2"; password = "ch456"; role = "CentreHead"; fullName = "Ms. Hana Al-Blooshi" });
    users.add("teacher1", { username = "teacher1"; password = "teacher123"; role = "Teacher"; fullName = "Ms. Monica Joseph" });
    users.add("teacher2", { username = "teacher2"; password = "teacher456"; role = "Teacher"; fullName = "Ms. Tulasi Reddy" });
    users.add("teacher3", { username = "teacher3"; password = "teacher789"; role = "Teacher"; fullName = "Ms. Reena Mathew" });
    users.add("parent1", { username = "parent1"; password = "parent123"; role = "Parent"; fullName = "Mr. Rajesh Nair" });
    users.add("parent2", { username = "parent2"; password = "parent456"; role = "Parent"; fullName = "Ms. Fatima Al-Hassan" });

    // Branches
    branches.add("b1", { id = "b1"; name = "Mahara — Dubai Main Campus"; location = "Al Quoz, Dubai" });
    branches.add("b2", { id = "b2"; name = "Mahara — Abu Dhabi Branch"; location = "Khalidiyah, Abu Dhabi" });

    // Teachers
    teachers.add("tc1", { id = "tc1"; username = "teacher1"; name = "Ms. Monica Joseph"; branchId = "b1"; grade = "Nursery"; subjects = "Language Development, Numeracy, Creative Arts, Physical Development" });
    teachers.add("tc2", { id = "tc2"; username = "teacher2"; name = "Ms. Tulasi Reddy"; branchId = "b1"; grade = "Pre Nursery"; subjects = "Circle Time, Language Development, Sensory Play, Numeracy" });
    teachers.add("tc3", { id = "tc3"; username = "teacher3"; name = "Ms. Reena Mathew"; branchId = "b2"; grade = "Grade 1"; subjects = "English, Mathematics, EVS, Islamic Studies, Arabic" });

    leadSources.add("s1", { id = "s1"; name = "Website" });
    leadSources.add("s2", { id = "s2"; name = "Referral" });
    leadSources.add("s3", { id = "s3"; name = "Social Media" });
    leadSources.add("s4", { id = "s4"; name = "Exhibition" });

    teamMembers.add("t1", { id = "t1"; name = "Sara Ahmed"; role = "Admissions Officer"; branchId = "b1" });
    teamMembers.add("t2", { id = "t2"; name = "Khalid Mansoor"; role = "Senior Advisor"; branchId = "b1" });
    teamMembers.add("t3", { id = "t3"; name = "Fatima Al-Zaabi"; role = "Admissions Officer"; branchId = "b2" });

    leads.add("l1", { id = "l1"; name = "Aisha Rahman"; email = "aisha@example.com"; phone = "+971-50-1234567"; gradeLevel = "Grade 7"; source = "Website"; status = "New Inquiry"; assignedAgent = "Sara Ahmed"; notes = "Interested in STEM program."; createdAt = "2026-03-20T08:00:00Z" });
    leads.add("l2", { id = "l2"; name = "Omar Al-Farsi"; email = "omar@example.com"; phone = "+971-55-9876543"; gradeLevel = "Grade 9"; source = "Referral"; status = "Qualified"; assignedAgent = "Khalid Mansoor"; notes = "Father works at government ministry."; createdAt = "2026-03-18T10:00:00Z" });
    leads.add("l3", { id = "l3"; name = "Lena Kowalski"; email = "lena@example.com"; phone = "+971-52-4561230"; gradeLevel = "Grade 5"; source = "Social Media"; status = "Campus Tour"; assignedAgent = "Sara Ahmed"; notes = "Scheduled campus tour."; createdAt = "2026-03-15T09:00:00Z" });
    leads.add("l4", { id = "l4"; name = "Yusuf Ibrahim"; email = "yusuf@example.com"; phone = "+971-56-7890123"; gradeLevel = "Grade 11"; source = "Exhibition"; status = "Application Sent"; assignedAgent = "Khalid Mansoor"; notes = "Application submitted."; createdAt = "2026-03-10T11:00:00Z" });
    leads.add("l5", { id = "l5"; name = "Sofia Martinez"; email = "sofia@example.com"; phone = "+971-50-3456789"; gradeLevel = "Grade 3"; source = "Website"; status = "Enrolled"; assignedAgent = "Sara Ahmed"; notes = "Starting April 2026."; createdAt = "2026-03-05T08:00:00Z" });

    followUps.add("f1", { id = "f1"; leadId = "l1"; followUpType = "Call"; assignedTo = "Sara Ahmed"; dueDate = "2026-03-29"; completed = false; notes = "Follow up on program inquiry" });
    followUps.add("f2", { id = "f2"; leadId = "l2"; followUpType = "Email"; assignedTo = "Khalid Mansoor"; dueDate = "2026-03-29"; completed = false; notes = "Send enrollment package" });
    followUps.add("f3", { id = "f3"; leadId = "l3"; followUpType = "Meet"; assignedTo = "Sara Ahmed"; dueDate = "2026-03-30"; completed = false; notes = "Campus tour meeting" });

    campaigns.add("c1", { id = "c1"; name = "Spring Enrollment 2026"; description = "Targeted campaign for Q2 enrollments."; status = "Active"; createdAt = "2026-03-01T08:00:00Z" });
    campaigns.add("c2", { id = "c2"; name = "Open Day — April 2026"; description = "Invite prospective families for campus open day."; status = "Draft"; createdAt = "2026-03-10T10:00:00Z" });

    // Students
    students.add("st1", { id = "st1"; name = "Priya Nair"; grade = "Nursery"; parentUsername = "parent1"; admissionNumber = "MIS-2024-081" });
    students.add("st2", { id = "st2"; name = "Arjun Nair"; grade = "Pre Nursery"; parentUsername = "parent1"; admissionNumber = "MIS-2025-014" });
    students.add("st3", { id = "st3"; name = "Layla Al-Hassan"; grade = "Grade 1"; parentUsername = "parent2"; admissionNumber = "MIS-2023-042" });

    // Report Cards
    reportCards.add("rc1", {
      id = "rc1";
      studentId = "st1";
      term = "Term 2";
      academicYear = "2025-2026";
      subjects = [
        { subject = "Language Development (English)"; grade = "A"; marks = "92/100"; remarks = "Excellent progress in reading and phonics" },
        { subject = "Numeracy"; grade = "A"; marks = "88/100"; remarks = "Strong number recognition and counting skills" },
        { subject = "Creative Arts"; grade = "A+"; marks = "96/100"; remarks = "Outstanding creativity and expression" },
        { subject = "Physical Development"; grade = "B+"; marks = "82/100"; remarks = "Good motor skills development" },
        { subject = "Social & Emotional Learning"; grade = "A"; marks = "90/100"; remarks = "Excellent teamwork and communication" }
      ];
      overallGrade = "A";
      attendance = "94%";
      teacherComment = "Priya is a bright and enthusiastic learner. She shows great curiosity and participates actively in all activities. Keep up the wonderful work!";
      date = "2026-03-25";
    });
    reportCards.add("rc2", {
      id = "rc2";
      studentId = "st2";
      term = "Term 2";
      academicYear = "2025-2026";
      subjects = [
        { subject = "Language Development (English)"; grade = "B+"; marks = "84/100"; remarks = "Good progress, continue practicing letter sounds" },
        { subject = "Numeracy"; grade = "A"; marks = "91/100"; remarks = "Excellent number concepts" },
        { subject = "Creative Arts"; grade = "B+"; marks = "85/100"; remarks = "Enjoys art activities, good participation" },
        { subject = "Physical Development"; grade = "A"; marks = "93/100"; remarks = "Very active and energetic" },
        { subject = "Social & Emotional Learning"; grade = "B+"; marks = "86/100"; remarks = "Growing confidence in class interactions" }
      ];
      overallGrade = "B+";
      attendance = "91%";
      teacherComment = "Arjun is a cheerful and active child. He is making good progress across all areas. Encourage reading at home to further strengthen his language skills.";
      date = "2026-03-25";
    });
    reportCards.add("rc3", {
      id = "rc3";
      studentId = "st3";
      term = "Term 2";
      academicYear = "2025-2026";
      subjects = [
        { subject = "English"; grade = "A"; marks = "90/100"; remarks = "Excellent reading comprehension" },
        { subject = "Mathematics"; grade = "A"; marks = "88/100"; remarks = "Strong arithmetic skills" },
        { subject = "Science"; grade = "B+"; marks = "83/100"; remarks = "Curious and attentive in lab activities" },
        { subject = "Islamic Studies"; grade = "A"; marks = "95/100"; remarks = "Outstanding dedication" },
        { subject = "Arabic"; grade = "B"; marks = "78/100"; remarks = "Good effort, continue practice" }
      ];
      overallGrade = "A";
      attendance = "97%";
      teacherComment = "Layla is an exceptional student with a positive attitude. Her dedication to studies is commendable. We are proud of her progress this term.";
      date = "2026-03-25";
    });

    // Worksheets
    worksheets.add("ws1", {
      id = "ws1";
      grade = "Nursery";
      title = "Weekly Log Sheet";
      date = "2026-02-14";
      teacherName = "Ms. Monica";
      subjects = [
        { subject = "Beginning & Extended Circle Time"; activities = "Reporting, Roll call, Prayer, Warm up song, Washy washy clean, Stories Galorie."; homework = "N/A"; notes = "N/A" },
        { subject = "Language Development (English)"; activities = "Alphabets and Numbers HB pn-30,31 Leta Roll and Read. Alphabets and Numbers HB pn-32 Matching Game ABC Phonic Songs. Alphabets and Numbers WB pn-63 Dancing Dino ABC Phonic song. Gender Equality-Dialogue, Character Building."; homework = "N/A"; notes = "N/A" },
        { subject = "Numeracy"; activities = "Theme-8 Animals Around Me PN-31 Number song. Alphabets and Numbers WB pn-84 Dinosaur egg. Alphabets and Numbers HB pn-44 Pre-Mathematical Concept. Template Tracing. Financial Literacy."; homework = "N/A"; notes = "N/A" },
        { subject = "Creative Arts"; activities = "Nature collage, Finger painting, Paper folding activity."; homework = "N/A"; notes = "N/A" },
        { subject = "Physical Development"; activities = "Outdoor play, Ball games, Dance and movement."; homework = "N/A"; notes = "N/A" }
      ];
    });
    worksheets.add("ws2", {
      id = "ws2";
      grade = "Pre Nursery";
      title = "Weekly Log Sheet";
      date = "2026-02-14";
      teacherName = "Ms. Tulasi";
      subjects = [
        { subject = "Circle Time"; activities = "Good morning song, Calendar activity, Weather chart, Show and tell."; homework = "N/A"; notes = "N/A" },
        { subject = "Language Development"; activities = "Colour recognition Red, Blue, Yellow. Flashcard activities. Rhymes: Twinkle Twinkle, Baa Baa Black Sheep."; homework = "N/A"; notes = "N/A" },
        { subject = "Sensory Play"; activities = "Sand play, Water play, Play dough activity."; homework = "N/A"; notes = "N/A" },
        { subject = "Numeracy"; activities = "Counting 1-5, Shape recognition circle and square, Sorting by colour."; homework = "N/A"; notes = "N/A" }
      ];
    });
    worksheets.add("ws3", {
      id = "ws3";
      grade = "Grade 1";
      title = "Weekly Log Sheet";
      date = "2026-03-10";
      teacherName = "Ms. Reena";
      subjects = [
        { subject = "English"; activities = "Reading comprehension pg 45-48. Spelling test: family words. Creative writing: My Weekend."; homework = "Complete workbook pg 23"; notes = "N/A" },
        { subject = "Mathematics"; activities = "Addition with carrying over. Subtraction concepts. Number patterns 2s and 5s."; homework = "Math worksheet pg 31-32"; notes = "N/A" },
        { subject = "EVS"; activities = "Our Community helpers. Field observation of school garden."; homework = "Draw your favourite community helper"; notes = "N/A" }
      ];
    });

    // School Updates
    schoolUpdates.add("su1", { id = "su1"; title = "Milestone Meet — March 28, 2026"; content = "Dear Parents, we are pleased to invite you to our Milestone Meet on Saturday, 28th March 2026. Please check the schedule for your child's time slot. This is an opportunity to discuss your child's progress with their teacher one-on-one. Kindly arrive 5 minutes before your scheduled time."; date = "2026-03-24"; category = "Event" });
    schoolUpdates.add("su2", { id = "su2"; title = "Holi Holiday Notice"; content = "School will remain closed on Wednesday, 4th March 2026 on account of Holi. Holi celebrations will be held on Tuesday, 3rd March. Children may wear traditional/festive attire on that day."; date = "2026-02-28"; category = "Notice" });
    schoolUpdates.add("su3", { id = "su3"; title = "Founders Day Celebrations — March 11"; content = "We invite all parents and students to join us for Founders Day Celebrations on Wednesday, 11th March 2026. There will be special performances by students, prize distributions, and refreshments. Entry is complimentary for all."; date = "2026-03-04"; category = "Announcement" });
    schoolUpdates.add("su4", { id = "su4"; title = "Term 2 Report Cards Available"; content = "Term 2 report cards are now available in the Parent Portal under 'Report Cards'. Please review your child's progress and feel free to schedule a follow-up meeting with the class teacher if needed. Term 3 begins on April 7, 2026."; date = "2026-03-25"; category = "Announcement" });
    schoolUpdates.add("su5", { id = "su5"; title = "Last Working Day & Class Celebrations — March 25"; content = "Wednesday, 25th March will be the last working day of Term 2. Classes will have special celebration activities. Children are encouraged to bring a small snack to share. School ends at 12:00 PM on this day."; date = "2026-03-20"; category = "Notice" });
    schoolUpdates.add("su6", { id = "su6"; title = "Ugadi Celebrations — March 18"; content = "Join us for Ugadi Celebrations on Wednesday, 18th March 2026. Students will participate in cultural activities, traditional dress is encouraged. Ugadi Holiday will be observed on Thursday, 19th March."; date = "2026-03-14"; category = "Event" });

    // Calendar Events
    calendarEvents.add("ce1", { id = "ce1"; title = "Holi Celebrations"; date = "2026-03-03"; category = "Event"; color = "#4FC3F7" });
    calendarEvents.add("ce2", { id = "ce2"; title = "Holi Holiday"; date = "2026-03-04"; category = "Holiday"; color = "#EF5350" });
    calendarEvents.add("ce3", { id = "ce3"; title = "Founders Day Celebrations"; date = "2026-03-11"; category = "Event"; color = "#4FC3F7" });
    calendarEvents.add("ce4", { id = "ce4"; title = "Ugadi Celebrations"; date = "2026-03-18"; category = "Event"; color = "#4FC3F7" });
    calendarEvents.add("ce5", { id = "ce5"; title = "Ugadi Holiday"; date = "2026-03-19"; category = "Holiday"; color = "#EF5350" });
    calendarEvents.add("ce6", { id = "ce6"; title = "Eid al-Fitr"; date = "2026-03-21"; category = "Holiday"; color = "#EF5350" });
    calendarEvents.add("ce7", { id = "ce7"; title = "Last Working Day & Class Celebrations"; date = "2026-03-25"; category = "Event"; color = "#4FC3F7" });
    calendarEvents.add("ce8", { id = "ce8"; title = "Shri Ram Navami"; date = "2026-03-26"; category = "Holiday"; color = "#EF5350" });
    calendarEvents.add("ce9", { id = "ce9"; title = "Milestone Meet"; date = "2026-03-28"; category = "CCMeet"; color = "#7B1FA2" });
    calendarEvents.add("ce10", { id = "ce10"; title = "Term 3 Begins"; date = "2026-04-07"; category = "Event"; color = "#4FC3F7" });
    calendarEvents.add("ce11", { id = "ce11"; title = "Parent-Teacher Meeting"; date = "2026-04-15"; category = "CCMeet"; color = "#7B1FA2" });
    calendarEvents.add("ce12", { id = "ce12"; title = "Earth Day Celebrations"; date = "2026-04-22"; category = "Event"; color = "#4FC3F7" });
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

  // Teachers
  public query func getAllTeachers() : async [Teacher] { teachers.values().toArray() };
  public query func getTeachersByBranch(branchId : Text) : async [Teacher] {
    teachers.values().toArray().filter(func(t : Teacher) : Bool { t.branchId == branchId });
  };
  public query func getTeacherByUsername(username : Text) : async ?Teacher {
    let matched = teachers.values().toArray().filter(func(t : Teacher) : Bool { t.username == username });
    if (matched.size() > 0) { ?matched[0] } else { null };
  };
  public shared func addTeacher(t : Teacher) : async Text {
    let id = await genId();
    teachers.add(id, { t with id });
    id;
  };
  public shared func updateTeacher(t : Teacher) : async () { teachers.add(t.id, t) };
  public shared func deleteTeacher(id : Text) : async () { teachers.remove(id) };

  // Students
  public query func getStudentsByParent(parentUsername : Text) : async [Student] {
    students.values().toArray().filter(func(s : Student) : Bool { s.parentUsername == parentUsername });
  };
  public query func getStudentsByGrade(grade : Text) : async [Student] {
    students.values().toArray().filter(func(s : Student) : Bool { s.grade == grade });
  };
  public shared func addStudent(s : Student) : async Text {
    let id = await genId();
    students.add(id, { s with id });
    id;
  };
  public shared func updateStudent(s : Student) : async () { students.add(s.id, s) };
  public shared func deleteStudent(id : Text) : async () { students.remove(id) };
  public query func getAllStudents() : async [Student] { students.values().toArray() };

  // Report Cards
  public query func getReportCardsByStudent(studentId : Text) : async [ReportCard] {
    reportCards.values().toArray().filter(func(rc : ReportCard) : Bool { rc.studentId == studentId });
  };
  public shared func addReportCard(rc : ReportCard) : async Text {
    let id = await genId();
    reportCards.add(id, { rc with id });
    id;
  };
  public shared func updateReportCard(rc : ReportCard) : async () { reportCards.add(rc.id, rc) };
  public shared func deleteReportCard(id : Text) : async () { reportCards.remove(id) };
  public query func getAllReportCards() : async [ReportCard] { reportCards.values().toArray() };

  // Worksheets
  public query func getWorksheetsByGrade(grade : Text) : async [Worksheet] {
    worksheets.values().toArray().filter(func(w : Worksheet) : Bool { w.grade == grade });
  };
  public query func getAllWorksheets() : async [Worksheet] { worksheets.values().toArray() };
  public shared func addWorksheet(w : Worksheet) : async Text {
    let id = await genId();
    worksheets.add(id, { w with id });
    id;
  };
  public shared func updateWorksheet(w : Worksheet) : async () { worksheets.add(w.id, w) };
  public shared func deleteWorksheet(id : Text) : async () { worksheets.remove(id) };

  // School Updates
  public query func getSchoolUpdates() : async [SchoolUpdate] { schoolUpdates.values().toArray() };
  public shared func addSchoolUpdate(u : SchoolUpdate) : async Text {
    let id = await genId();
    schoolUpdates.add(id, { u with id });
    id;
  };
  public shared func updateSchoolUpdate(u : SchoolUpdate) : async () { schoolUpdates.add(u.id, u) };
  public shared func deleteSchoolUpdate(id : Text) : async () { schoolUpdates.remove(id) };

  // Calendar Events
  public query func getCalendarEvents() : async [CalendarEvent] { calendarEvents.values().toArray() };
  public shared func addCalendarEvent(e : CalendarEvent) : async Text {
    let id = await genId();
    calendarEvents.add(id, { e with id });
    id;
  };
  public shared func updateCalendarEvent(e : CalendarEvent) : async () { calendarEvents.add(e.id, e) };
  public shared func deleteCalendarEvent(id : Text) : async () { calendarEvents.remove(id) };
};
