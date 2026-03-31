import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { Lead, LeadStatus } from "../types";
import { leadFromBackend } from "../utils/backendAdapters";

// ----- Types -----
interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

// ----- Status Styles -----
const STATUS_COLORS: Record<LeadStatus, string> = {
  "New Inquiry": "bg-blue-100 text-blue-700 border-blue-200",
  Qualified: "bg-purple-100 text-purple-700 border-purple-200",
  "Campus Tour": "bg-amber-100 text-amber-700 border-amber-200",
  "Application Sent": "bg-orange-100 text-orange-700 border-orange-200",
  Enrolled: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

const STATUSES: LeadStatus[] = [
  "New Inquiry",
  "Qualified",
  "Campus Tour",
  "Application Sent",
  "Enrolled",
  "Rejected",
];

// ----- Avatar helpers -----
const AVATAR_COLORS = [
  "#4F8F92",
  "#7B9E87",
  "#9B7BAE",
  "#C67B5C",
  "#5B7FAE",
  "#AE7B9B",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ----- Starter prompts -----
const STARTER_PROMPTS = [
  "Write a follow-up message",
  "Parent is asking about fees",
  "They want to know about transport",
  "Schedule a campus tour visit",
  "Send enrollment confirmation",
];

// ----- AI Engine -----
function generateSmartReply(userMessage: string, lead: Lead): string {
  const text = userMessage.toLowerCase();
  const firstName = lead.name.split(" ")[0];
  const grade = lead.gradeLevel.split("(")[0].trim();
  const status = lead.status;

  if (/fee|cost|price|charges|amount|payment|scholarship/.test(text)) {
    return [
      `Hi ${firstName}! 😊 I'd be happy to walk you through the fee structure for ${grade} at Mahara Schools. Our programmes are thoughtfully designed to deliver exceptional learning value across our Kondapur and Bachupally centres.`,
      `The ${grade} fee includes the full academic curriculum, all learning materials, activity kits, and access to our extracurricular programmes. We offer flexible payment options — monthly, quarterly, or annually — so families can choose what works best for them.`,
      "We also have a limited number of merit-based scholarships available for deserving students. These cover partial tuition and are awarded based on academic performance and financial need.",
      `I'd love to share the complete fee schedule with you. You can also call us directly at +91 628170-8102 (Kondapur) or +91 7488-456789 (Bachupally). Looking forward to welcoming ${firstName} to Mahara! 🌟`,
    ].join("\n\n");
  }

  if (/transport|bus|pickup|drop|route|vehicle/.test(text)) {
    return [
      `Hi ${firstName}! 🚌 Great question — Mahara Schools provides safe, reliable, and well-monitored transport services across Hyderabad for families at both our Kondapur and Bachupally centres.`,
      `Our school buses are operated by trained drivers with an attendant on board at all times. All buses are GPS-tracked so parents can monitor their child's journey in real time. Your child's safety is our absolute priority.`,
      `For ${grade} students, morning pickups typically begin around 7:00–7:30 AM and afternoon drop-off is usually between 3:00–3:45 PM depending on your route area.`,
      `Could you share your approximate area or landmark? I'll check if your location is covered and send you the route details and transport fee information right away! 😊`,
    ].join("\n\n");
  }

  if (
    /curriculum|syllabus|subject|study|teach|learn|programme|program/.test(text)
  ) {
    return [
      `Hi ${firstName}! 📚 The ${grade} curriculum at Mahara Schools is designed around a holistic, child-centred learning philosophy that nurtures curiosity, creativity, and critical thinking.`,
      `We follow an internationally aligned curriculum that combines structured academic learning with experiential activities. For ${grade}, this includes Language & Literacy, Mathematics, Environmental Studies, Arts & Crafts, Music, Physical Education, and Value Education.`,
      "Our teaching approach emphasises learning through discovery, play-based methods (especially for younger grades), and project-based tasks. All our teachers are trained and qualified in early childhood and primary education.",
      `We'd love to show you the detailed curriculum booklet. You can also visit our campus to sit in on a short demo class — a great way to experience Mahara in action! Shall I arrange that for you? 🎓`,
    ].join("\n\n");
  }

  if (/tour|visit|campus|see|show|facility|facilities/.test(text)) {
    return [
      `Hi ${firstName}! 🏫 We'd absolutely love to have you and your family visit Mahara Schools! A campus tour is the best way to experience our vibrant learning environment firsthand.`,
      `During the visit, you'll get to see our classrooms, play areas, activity rooms, library, and all the facilities we've designed to support ${grade} students. Our admissions team will also be on hand to answer all your questions.`,
      "Visits are available Monday to Friday between 9:00 AM – 12:00 PM and 2:00 PM – 4:30 PM. Saturday mornings are also possible by prior appointment.",
      "Which date works best for you? I can book a slot at either our Kondapur or Bachupally campus — whichever is more convenient for you. Just let me know! 📅",
    ].join("\n\n");
  }

  if (/schedule|timing|time|slot|hour|open|close|session/.test(text)) {
    return [
      `Hi ${firstName}! ⏰ Here's a quick overview of the school schedule at Mahara Schools for ${grade}:`,
      "School hours: **Monday to Friday, 8:00 AM – 3:30 PM**. We also offer an Extended Day Care option from 3:30 PM to 6:00 PM for working parents — a safe, supervised, and activity-filled afterschool programme.",
      "The academic year runs from June to April with two terms. Key events include term exams, cultural programmes, annual sports day, and parent-teacher meetings each term.",
      `Is there a specific schedule detail you'd like to know more about — like activity timings, lunch breaks, or after-school programmes? Happy to help! 😊`,
    ].join("\n\n");
  }

  if (/document|form|paper|certificate|birth|aadhaar|passport/.test(text)) {
    return [
      `Hi ${firstName}! 📋 I'll help you get ready with the documents needed for ${grade} admission at Mahara Schools. Having these ready in advance makes the process smooth and quick!`,
      `**Required documents:**\n• Child's birth certificate (original + photocopy)\n• Aadhaar card of child (if available)\n• Parent/guardian Aadhaar cards (both)\n• 4 passport-size photographs of the child\n• Previous school records or progress report (if applicable)\n• Medical/immunisation record`,
      "For KG I and above, a school leaving or transfer certificate from the previous school is also required. All documents can be submitted at the time of enrolment.",
      `If you have any questions about a specific document, please feel free to ask! You can also bring them directly during your campus visit. We're here to make the process as easy as possible for you. 😊`,
    ].join("\n\n");
  }

  if (/enroll|admission|register|join|seat|apply|application/.test(text)) {
    return [
      `Hi ${firstName}! 🎉 Wonderful news — starting the admission process at Mahara Schools is simple and we're here to guide you every step of the way for ${grade}!`,
      "**Admission process:**\n1. Schedule a campus visit (optional but highly recommended)\n2. Fill out the admission application form (available at the campus or we can email it to you)\n3. Submit required documents\n4. Pay the registration fee (non-refundable)\n5. Receive confirmation of seat allocation",
      `We have limited seats for ${grade} this academic year, so I'd recommend moving forward as soon as possible to secure your child's place.`,
      `Shall I send you the application form right now? Or would you prefer to come to the campus and complete it in person? I'm here to help make this as smooth as possible! 📝`,
    ].join("\n\n");
  }

  if (/teacher|staff|faculty|qualified|experience/.test(text)) {
    return [
      `Hi ${firstName}! 👩‍🏫 I'm delighted to share more about our exceptional teaching team at Mahara Schools — this is one of the things our parents appreciate most about us!`,
      `All our teachers are professionally qualified with degrees in Education, Early Childhood Development, or relevant subject areas. For ${grade}, each class has a dedicated class teacher supported by assistant teachers, ensuring personalised attention for every child.`,
      "Our educators undergo regular training and professional development workshops to stay current with the latest teaching methodologies. We maintain a student-to-teacher ratio designed to ensure every child gets the attention and support they deserve.",
      `We'd love for you to meet our ${grade} team during your campus visit. Talking to the teachers directly often gives parents a great sense of our school's warm, nurturing culture. Would you like to schedule a visit? 😊`,
    ].join("\n\n");
  }

  if (
    /activit|sport|play|art|music|dance|taekwondo|hobby|extracurricular/.test(
      text,
    )
  ) {
    return [
      `Hi ${firstName}! 🎨 Mahara Schools believes in developing the whole child — and our extracurricular programme is designed to nurture every talent and interest!`,
      `For ${grade} students, we offer a rich variety of activities including:\n• Arts & Crafts workshops\n• Music and movement classes\n• Sports & Physical Education (cricket, football, yoga)\n• Dance performances\n• Taekwondo (self-defence and discipline)\n• Annual cultural shows and inter-school events`,
      "All activities are included as part of the school programme. We also run special holiday camps and skill workshops during term breaks.",
      "Your child will have so many opportunities to explore, grow, and shine at Mahara! Would you like to know more about a specific activity, or shall we arrange a visit so you can see everything in action? 🌟",
    ].join("\n\n");
  }

  if (/compar|other school|alternative|better|why mahara/.test(text)) {
    return [
      `Hi ${firstName}! 🌟 That's a great question, and I appreciate you doing your research — choosing the right school is one of the most important decisions for your child's future!`,
      `What sets Mahara Schools apart is our unique blend of academic rigour and holistic development. We combine a strong curriculum with experiential learning, ensuring children don't just memorise — they understand, explore, and create.`,
      "Our parent community often highlights three things they love most:\n• The warm, family-like atmosphere at both our campuses\n• Highly qualified and caring teachers who know every child by name\n• Transparent, responsive communication with parents",
      `We're proud to be trusted by hundreds of families in Hyderabad for ${grade} and beyond. The best way to see the Mahara difference is to visit us in person — we're confident you'll feel it from the moment you walk in. Can we book a tour for you? 😊`,
    ].join("\n\n");
  }

  if (/deadline|last date|when|how long|soon|urgent/.test(text)) {
    return [
      `Hi ${firstName}! ⚡ I completely understand the urgency — and I want to make sure you don't miss out on securing a seat for ${grade} at Mahara Schools!`,
      `Admissions for the upcoming academic year are open now, and seats for ${grade} are filling up quickly. We typically operate on a first-come, first-served basis, so early registration is strongly recommended.`,
      `The quickest way to secure your child's seat is to:\n1. Fill out the application form (5 minutes online or in-person)\n2. Submit basic documents\n3. Pay the registration fee\nThat's it — your seat will be reserved!`,
      `I can prioritise your application and walk you through the process step by step right now. Shall we do that? I want to make sure ${firstName} has a spot confirmed as soon as possible! 📅`,
    ].join("\n\n");
  }

  if (/safe|security|supervision|care|nurture/.test(text)) {
    return [
      `Hi ${firstName}! 🔒 Your child's safety is the foundation of everything we do at Mahara Schools — and we take this responsibility incredibly seriously at both our campuses.`,
      "Our safety measures include:\n• 24/7 CCTV surveillance across all areas of the campus\n• Biometric access control at entry/exit points\n• Trained security staff at the gate at all times\n• Strict visitor ID verification policy — only authorised persons can pick up children\n• GPS-tracked school buses with an attendant on every bus",
      "Our teachers and staff are trained in first aid and child safety protocols. We also conduct regular safety drills and have a dedicated school nurse on campus.",
      `As a parent, you'll also receive daily updates through our school communication app, so you're always in the loop. Your peace of mind matters deeply to us. Would you like to see these safety systems during a campus tour? 😊`,
    ].join("\n\n");
  }

  if (/follow.?up|check.?in|reach out|touch base/.test(text)) {
    return generateFollowUpByStatus(firstName, grade, status);
  }

  // Default: contextual follow-up based on stage
  return generateFollowUpByStatus(firstName, grade, status);
}

function generateFollowUpByStatus(
  firstName: string,
  grade: string,
  status: LeadStatus,
): string {
  switch (status) {
    case "New Inquiry":
      return [
        `Hi ${firstName}! 😊 Thank you so much for your interest in Mahara Schools. We're thrilled to connect with you and learn more about your child's educational journey!`,
        `I'd love to tell you more about our ${grade} programme — it's been designed to give every child a strong academic foundation while nurturing their unique personality and talents.`,
        `Would you be available for a quick 10-minute call this week? I can walk you through what makes Mahara special and answer any questions you might have. Alternatively, I'd love to invite you for a campus visit at our Kondapur or Bachupally centre — whichever is closer to you!`,
        "Looking forward to hearing from you. 🌟 Mahara Schools — where every child finds their spark!",
      ].join("\n\n");

    case "Qualified":
      return [
        `Hi ${firstName}! Following our recent conversation, I wanted to personally reach out to see how you're progressing with your decision for ${grade}.`,
        `Based on everything we discussed, I truly believe Mahara Schools would be a wonderful fit for your child. Our ${grade} programme is thoughtfully structured to build confidence, curiosity, and character alongside academic excellence.`,
        `I'd love to arrange a campus visit for you at your earliest convenience — it's the best way to experience our environment and meet the team. We have slots available this week!`,
        `Please don't hesitate to reach out with any questions at all. We're here to support you through every step of this decision. 😊`,
      ].join("\n\n");

    case "Campus Tour":
      return [
        `Hi ${firstName}! It was truly wonderful having your family visit Mahara Schools. I hope the tour gave you a real feel for our vibrant learning community and warm atmosphere! 🏫`,
        `I wanted to follow up and check if you had any questions after the visit, or if there's anything else I can clarify about the ${grade} programme, fees, or the admission process.`,
        `I also wanted to mention that seats for ${grade} are filling up, so if you're feeling positive about Mahara, now would be a great time to move forward with the application!`,
        `Looking forward to welcoming your child into the Mahara family. Please reach out anytime — I'm here to help! 😊`,
      ].join("\n\n");

    case "Application Sent":
      return [
        `Hi ${firstName}! Just wanted to check in and let you know that your application for ${grade} is with our admissions team and is being reviewed carefully.`,
        `Our board typically meets weekly and we aim to communicate decisions within 5–7 working days. Rest assured, your child's application is receiving the full attention it deserves.`,
        `In the meantime, if you have any questions or need to provide any additional documents, I'm just a message away. Please don't hesitate to reach out!`,
        `Thank you for choosing to apply to Mahara Schools — we're excited about the possibility of having your child as part of our community. 🌟`,
      ].join("\n\n");

    case "Enrolled":
      return [
        `Hi ${firstName}! Welcome to the Mahara Schools family! 🎉 We are absolutely thrilled to have your child with us in ${grade}.`,
        "Your orientation welcome pack will be sent to you within the next 24–48 hours. It includes the academic calendar, school rules, uniform guidelines, and all the information you need for a smooth start.",
        "Our class teacher will also be reaching out shortly to introduce themselves and share the classroom schedule for the term. We want to ensure your child settles in happily and confidently!",
        `Once again, welcome to Mahara! Please don't hesitate to call us at any time — we're always here for you and your child. 😊`,
      ].join("\n\n");

    case "Rejected":
      return [
        `Dear ${firstName}, thank you so much for your interest in Mahara Schools and for considering us for your child's ${grade} education. We genuinely appreciate the time and trust you placed in us.`,
        `While we are unable to accommodate your child's admission at this time due to limited availability, we sincerely hope this does not discourage you. We warmly invite you to reapply for the next academic year.`,
        `We would be happy to keep your child's details on our priority waitlist, so you are among the first to be contacted should a seat become available.`,
        "Please stay in touch with us, and thank you again for considering Mahara Schools. We wish your child all the very best on their educational journey. 🌟",
      ].join("\n\n");

    default:
      return `Hi ${firstName}! 😊 Just checking in from Mahara Schools. We'd love to connect and chat about the ${grade} programme and how we can support your child's learning journey. Please feel free to reach out anytime — we're always here to help!`;
  }
}

// ----- Custom templates type -----
type CustomTemplate = { id: string; name: string; content: string };

// ----- Component -----
export default function AIReplyPage() {
  const { actor } = useActor();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Chat state: Map<leadId, messages[]>
  const [chatHistories, setChatHistories] = useState<
    Map<string, ChatMessage[]>
  >(new Map());
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sent tracking
  const [sent, _setSent] = useState<Set<string>>(new Set());

  // Custom templates
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");

  useEffect(() => {
    if (!actor) return;
    actor
      .getLeads()
      .then((ls) => {
        const mapped = ls.map(leadFromBackend);
        setLeads(mapped);
        if (mapped.length > 0) {
          const first = mapped
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
          setSelectedLead(first);
        }
      })
      .catch(() => toast.error("Failed to load leads"))
      .finally(() => setLoading(false));
  }, [actor]);

  // Scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: chatEndRef is a stable ref
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, isThinking]);

  const currentMessages = selectedLead
    ? (chatHistories.get(selectedLead.id) ?? [])
    : [];

  function addMessage(leadId: string, msg: ChatMessage) {
    setChatHistories((prev) => {
      const next = new Map(prev);
      const existing = next.get(leadId) ?? [];
      next.set(leadId, [...existing, msg]);
      return next;
    });
  }

  async function sendMessage(text: string) {
    if (!selectedLead || !text.trim() || isThinking) return;
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    addMessage(selectedLead.id, userMsg);
    setInput("");
    setIsThinking(true);
    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 800));
    const reply = generateSmartReply(text, selectedLead);
    const aiMsg: ChatMessage = {
      id: `m${Date.now()}${Math.random()}`,
      role: "ai",
      content: reply,
      timestamp: new Date(),
    };
    addMessage(selectedLead.id, aiMsg);
    setIsThinking(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  }

  function selectLead(lead: Lead) {
    setSelectedLead(lead);
    setInput("");
    setIsThinking(false);
  }

  function applyCustomTemplate(t: CustomTemplate) {
    if (!selectedLead) return;
    const filled = t.content
      .replace(/{name}/g, selectedLead.name.split(" ")[0])
      .replace(/{grade}/g, selectedLead.gradeLevel);
    setInput(filled);
    inputRef.current?.focus();
  }

  function addCustomTemplate() {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;
    setCustomTemplates((prev) => [
      ...prev,
      {
        id: `ct${Date.now()}`,
        name: newTemplateName.trim(),
        content: newTemplateContent.trim(),
      },
    ]);
    setNewTemplateName("");
    setNewTemplateContent("");
    setShowNewTemplate(false);
    toast.success("Template saved!");
  }

  function deleteCustomTemplate(id: string) {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-120px)]">
        <div className="space-y-3">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
        <Skeleton className="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-120px)]">
      {/* ---- Lead List ---- */}
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="space-y-2 flex-shrink-0">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
              data-ocid="ai.search_input"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-sm" data-ocid="ai.status.select">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No leads found
            </p>
          )}
          {filtered.map((lead) => {
            const isSent = sent.has(lead.id);
            const isSelected = selectedLead?.id === lead.id;
            const msgCount = chatHistories.get(lead.id)?.length ?? 0;
            return (
              <button
                type="button"
                key={lead.id}
                onClick={() => selectLead(lead)}
                className={`w-full text-left rounded-xl p-3 transition-all border ${
                  isSelected
                    ? "border-[#4F8F92] bg-[#EEF8F8]"
                    : "border-border bg-white hover:border-[#4F8F92]/40 hover:bg-[#EEF8F8]/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className="text-[11px] font-bold"
                      style={{
                        background: avatarColor(lead.name),
                        color: "white",
                      }}
                    >
                      {initials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold truncate">
                        {lead.name}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {msgCount > 0 && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#EEF8F8", color: "#4F8F92" }}
                          >
                            {msgCount}
                          </span>
                        )}
                        {isSent && (
                          <CheckCircle2 size={13} className="text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {lead.gradeLevel} · {lead.source}
                    </p>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${STATUS_COLORS[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Right Panel ---- */}
      <div className="flex flex-col gap-4 overflow-hidden">
        {!selectedLead ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#EEF8F8" }}
              >
                <Sparkles size={28} style={{ color: "#4F8F92" }} />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Select a lead to start the AI conversation
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask questions, get tailored reply suggestions
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Card */}
            <Card className="shadow-card border-border flex-1 flex flex-col overflow-hidden">
              {/* Lead Header */}
              <div
                className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-shrink-0"
                style={{ background: "#F7FBFB" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback
                      className="text-xs font-bold"
                      style={{
                        background: avatarColor(selectedLead.name),
                        color: "white",
                      }}
                    >
                      {initials(selectedLead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">{selectedLead.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[selectedLead.status]}`}
                      >
                        {selectedLead.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {selectedLead.gradeLevel}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        via {selectedLead.source}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] gap-1 flex-shrink-0"
                >
                  <Bot size={10} style={{ color: "#4F8F92" }} />
                  AI Powered
                </Badge>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {currentMessages.length === 0 && !isThinking && (
                  <div className="text-center py-8">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "#EEF8F8" }}
                    >
                      <Sparkles size={20} style={{ color: "#4F8F92" }} />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      How can I help you with {selectedLead.name.split(" ")[0]}?
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Ask anything or choose a quick prompt below
                    </p>
                    {/* Starter chips */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="text-xs px-3 py-1.5 rounded-full border border-[#4F8F92]/40 text-[#4F8F92] hover:bg-[#EEF8F8] transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "#EEF8F8" }}
                      >
                        <Bot size={14} style={{ color: "#4F8F92" }} />
                      </div>
                    )}
                    <div
                      className={`relative group max-w-[82%] rounded-2xl px-4 py-2.5 ${
                        msg.role === "user"
                          ? "rounded-tr-sm text-white"
                          : "rounded-tl-sm text-foreground"
                      }`}
                      style={{
                        background: msg.role === "user" ? "#4F8F92" : "#EEF8F8",
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <span className="text-[10px] opacity-60">
                          {msg.timestamp.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.role === "ai" && (
                          <button
                            type="button"
                            onClick={() => copyMessage(msg.content, msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                            title="Copy message"
                          >
                            {copied === msg.id ? (
                              <Check size={11} style={{ color: "#4F8F92" }} />
                            ) : (
                              <ClipboardCopy
                                size={11}
                                className="text-muted-foreground"
                              />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thinking animation */}
                {isThinking && (
                  <div className="flex gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "#EEF8F8" }}
                    >
                      <Bot size={14} style={{ color: "#4F8F92" }} />
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3"
                      style={{ background: "#EEF8F8" }}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: "#4F8F92",
                            animationDelay: "0ms",
                          }}
                        />
                        <span
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: "#4F8F92",
                            animationDelay: "150ms",
                          }}
                        />
                        <span
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: "#4F8F92",
                            animationDelay: "300ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Starter chips (when messages exist) */}
              {currentMessages.length > 0 && !isThinking && (
                <div className="px-4 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                  {STARTER_PROMPTS.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-[#4F8F92]/30 text-[#4F8F92] hover:bg-[#EEF8F8] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="px-4 pb-4 pt-2 flex gap-2 flex-shrink-0 border-t border-border">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask about ${selectedLead.name.split(" ")[0]}...`}
                  className="flex-1 h-10 text-sm"
                  disabled={isThinking}
                  data-ocid="ai.message.input"
                />
                <Button
                  size="sm"
                  className="h-10 px-4 gap-1.5"
                  style={{ background: "#4F8F92" }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isThinking}
                  data-ocid="ai.send.primary_button"
                >
                  <Send size={14} />
                  Ask AI
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Custom Templates */}
        <Card className="shadow-card border-border flex-shrink-0">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot size={15} style={{ color: "#4F8F92" }} />
                Custom Reply Templates
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => setShowNewTemplate((v) => !v)}
                data-ocid="ai.template.toggle"
              >
                {showNewTemplate ? <X size={11} /> : <Plus size={11} />}
                {showNewTemplate ? "Cancel" : "New Template"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {showNewTemplate && (
              <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border">
                <Input
                  placeholder="Template name (e.g. Warm Welcome)"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="h-8 text-xs"
                  data-ocid="ai.template.name.input"
                />
                <Textarea
                  placeholder="Use {name} for lead name, {grade} for grade level"
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="min-h-[70px] text-xs resize-none"
                  data-ocid="ai.template.content.textarea"
                />
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  style={{ background: "#4F8F92" }}
                  onClick={addCustomTemplate}
                  disabled={
                    !newTemplateName.trim() || !newTemplateContent.trim()
                  }
                  data-ocid="ai.template.save.primary_button"
                >
                  Save Template
                </Button>
              </div>
            )}
            {customTemplates.length === 0 && !showNewTemplate && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No custom templates yet. Create one to reuse across leads.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {customTemplates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-1.5 bg-[#EEF8F8] border border-[#4F8F92]/30 rounded-lg px-2.5 py-1"
                >
                  <button
                    type="button"
                    className="text-xs font-medium text-[#4F8F92] hover:underline"
                    onClick={() => applyCustomTemplate(t)}
                  >
                    {t.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomTemplate(t.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid="ai.template.delete_button"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
