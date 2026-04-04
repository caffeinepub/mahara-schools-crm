import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Image,
  Loader2,
  LogOut,
  Newspaper,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import ParentArticles from "../pages/parent/ParentArticles";
import ParentCalendar from "../pages/parent/ParentCalendar";
import ParentReportCards from "../pages/parent/ParentReportCards";
import ParentUpdates from "../pages/parent/ParentUpdates";
import ParentWorksheets from "../pages/parent/ParentWorksheets";
import type { AuthUser } from "../types";

type Tab =
  | "report-cards"
  | "worksheets"
  | "updates"
  | "calendar"
  | "articles"
  | "activities"
  | "forms"
  | "blog";

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

interface ClassActivity {
  id: string;
  classGrade: string;
  teacherId: string;
  teacherName: string;
  branchId: string;
  date: string;
  title: string;
  description: string;
  mediaUrls: string[];
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  publishedAt: string;
  isDraft: boolean;
  tags: string;
}

interface SchoolForm {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  publishedAt: string;
  isDraft: boolean;
  createdBy: string;
  responseCount: bigint;
}

interface FormQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: string[];
  required: boolean;
}

interface ParentNotification {
  id: string;
  parentUsername: string;
  title: string;
  message: string;
  notifType: string;
  isRead: boolean;
  createdAt: string;
  linkId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Education: "bg-blue-100 text-blue-700",
  Parenting: "bg-pink-100 text-pink-700",
  Events: "bg-yellow-100 text-yellow-700",
  Announcements: "bg-teal-100 text-teal-700",
  "Child Development": "bg-green-100 text-green-700",
};

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              i <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "report-cards",
    label: "Report Cards",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "worksheets",
    label: "Worksheets",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: "updates",
    label: "Updates",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: "activities",
    label: "Activities",
    icon: <Image className="w-4 h-4" />,
  },
  {
    id: "forms",
    label: "Forms",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "blog",
    label: "Blog",
    icon: <Newspaper className="w-4 h-4" />,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    id: "articles",
    label: "Learning Hub",
    icon: <GraduationCap className="w-4 h-4" />,
  },
];

export default function ParentPortal({ user, onLogout }: Props) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [activeTab, setActiveTab] = useState<Tab>("report-cards");
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activities, setActivities] = useState<ClassActivity[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [forms, setForms] = useState<SchoolForm[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedForm, setSelectedForm] = useState<SchoolForm | null>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});
  const [submittedForms, setSubmittedForms] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  // Teacher rating
  const [ratingOpen, setRatingOpen] = useState(false);

  const [ratingTeacherName, setRatingTeacherName] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingStudentName, setRatingStudentName] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getNotificationsForParent(user.username).catch(() => []),
      actor.getAllClassActivities().catch(() => []),
      actor.getPublishedBlogPosts().catch(() => []),
      actor.getPublishedForms().catch(() => []),
      actor.getMyFormResponses(user.username).catch(() => []),
    ]).then(
      ([notifs, acts, posts, pubForms, myResponses]: [
        ParentNotification[],
        ClassActivity[],
        BlogPost[],
        SchoolForm[],
        { formId: string }[],
      ]) => {
        setNotifications(notifs ?? []);
        setActivities(acts ?? []);
        setBlogPosts(posts ?? []);
        setForms(pubForms ?? []);
        setSubmittedForms(new Set((myResponses ?? []).map((r) => r.formId)));
      },
    );
  }, [actor, user.username]);

  async function markNotifRead(id: string) {
    if (!actor) return;
    try {
      await actor.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      // ignore
    }
  }

  async function handleFormSubmit() {
    if (!actor || !selectedForm) return;
    setSubmitting(true);
    try {
      const answers = selectedForm.questions.map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        answer: formAnswers[q.id] ?? "",
      }));
      await actor.submitFormResponse({
        id: `fr-${Date.now()}`,
        formId: selectedForm.id,
        parentUsername: user.username,
        studentName: ratingStudentName || user.name,
        answers,
        submittedAt: new Date().toISOString(),
      });
      setSubmittedForms((prev) => new Set([...prev, selectedForm.id]));
      setSelectedForm(null);
      setFormAnswers({});
      toast.success("Form submitted successfully!");
    } catch {
      toast.error("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitRating() {
    if (!actor || !ratingTeacherName) return;
    setSubmittingRating(true);
    try {
      await actor.submitParentFeedback({
        id: `fb-${Date.now()}`,
        teacherId: ratingTeacherName.toLowerCase().replace(/\s+/g, "-"),
        teacherName: ratingTeacherName,
        parentUsername: user.username,
        studentName: ratingStudentName || user.name,
        rating: BigInt(ratingValue),
        comment: ratingComment,
        submittedAt: new Date().toISOString(),
      });
      setRatingOpen(false);
      setRatingValue(5);
      setRatingComment("");
      toast.success("Thank you for your feedback!");
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F7F7" }}>
      <header
        style={{
          background: "linear-gradient(90deg, #78C8C8 0%, #64A0A3 100%)",
        }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <img
                src="/assets/mahara_common_logo_png-019d3e56-ac03-771c-a137-577f15f3bff3.png"
                alt="Mahara"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                Mahara Schools
              </h1>
              <p className="text-white/70 text-xs">Parent Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-1.5 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setNotifOpen(true)}
              data-ocid="parent.notifications.button"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-white/60 text-xs">Parent Account</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/20 hover:text-white gap-1.5"
              data-ocid="parent.logout_button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-0">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-ocid={`parent.${tab.id}.tab`}
                className={[
                  "flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-white text-white"
                    : "border-transparent text-white/60 hover:text-white/90 hover:border-white/40",
                ].join(" ")}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "report-cards" && <ParentReportCards user={user} />}
        {activeTab === "worksheets" && <ParentWorksheets user={user} />}
        {activeTab === "updates" && <ParentUpdates user={user} />}
        {activeTab === "calendar" && <ParentCalendar user={user} />}
        {activeTab === "articles" && <ParentArticles user={user} />}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Class Activities
                </h2>
                <p className="text-sm text-gray-500">
                  Daily activities from your child's class
                </p>
              </div>
            </div>
            {activities.length === 0 ? (
              <div
                className="text-center py-12 text-gray-400"
                data-ocid="parent.activities.empty_state"
              >
                <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activities uploaded yet.</p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-ocid="parent.activities.list"
              >
                {activities.map((act, idx) => (
                  <Card
                    key={act.id}
                    data-ocid={`parent.activities.item.${idx + 1}`}
                  >
                    <div
                      className="h-24 flex items-center justify-center rounded-t-lg"
                      style={{
                        background: "linear-gradient(135deg, #78C8C8, #4A90D9)",
                      }}
                    >
                      <Image className="w-8 h-8 text-white/50" />
                    </div>
                    <CardContent className="p-3">
                      <Badge className="bg-teal-100 text-teal-700 text-[10px] mb-1">
                        {act.classGrade}
                      </Badge>
                      <h3 className="font-semibold text-sm text-gray-800 mb-0.5">
                        {act.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        {act.teacherName} •{" "}
                        {new Date(act.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div>
            {selectedBlog ? (
              <div className="max-w-2xl mx-auto">
                <Button
                  variant="ghost"
                  className="mb-4 text-teal-600"
                  onClick={() => setSelectedBlog(null)}
                  data-ocid="parent.blog.back_button"
                >
                  ← Back to Blog
                </Button>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedBlog.title}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    className={
                      CATEGORY_COLORS[selectedBlog.category] ??
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedBlog.category}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedBlog.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  {selectedBlog.content.split("\n").map((line, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is static
                    <p key={i} className="text-gray-700 leading-relaxed mb-2">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-800">
                    School Blog
                  </h2>
                  <p className="text-sm text-gray-500">
                    Articles and updates from Mahara Schools
                  </p>
                </div>
                {blogPosts.length === 0 ? (
                  <div
                    className="text-center py-12 text-gray-400"
                    data-ocid="parent.blog.empty_state"
                  >
                    <Newspaper className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No blog posts yet.</p>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    data-ocid="parent.blog.list"
                  >
                    {blogPosts.map((post, idx) => (
                      <Card
                        key={post.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedBlog(post)}
                        data-ocid={`parent.blog.item.${idx + 1}`}
                      >
                        <CardContent className="p-4">
                          <Badge
                            className={`text-[10px] mb-2 ${
                              CATEGORY_COLORS[post.category] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold text-sm text-gray-800 mb-1">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {post.content.slice(0, 120)}...
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {post.authorName} •{" "}
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === "forms" && (
          <div>
            {selectedForm ? (
              <div className="max-w-xl mx-auto">
                <Button
                  variant="ghost"
                  className="mb-4 text-teal-600"
                  onClick={() => {
                    setSelectedForm(null);
                    setFormAnswers({});
                  }}
                  data-ocid="parent.forms.back_button"
                >
                  ← Back to Forms
                </Button>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {selectedForm.title}
                </h2>
                {selectedForm.description && (
                  <p className="text-sm text-gray-500 mb-5">
                    {selectedForm.description}
                  </p>
                )}
                <div className="space-y-5">
                  {selectedForm.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      data-ocid={`parent.forms.question.${idx + 1}`}
                    >
                      <Label className="text-sm font-medium text-gray-700">
                        {idx + 1}. {q.questionText}
                        {q.required && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </Label>
                      {q.questionType === "short_text" && (
                        <Input
                          value={formAnswers[q.id] ?? ""}
                          onChange={(e) =>
                            setFormAnswers((p) => ({
                              ...p,
                              [q.id]: e.target.value,
                            }))
                          }
                          className="mt-1"
                          data-ocid="parent.forms.input"
                        />
                      )}
                      {q.questionType === "paragraph" && (
                        <Textarea
                          value={formAnswers[q.id] ?? ""}
                          onChange={(e) =>
                            setFormAnswers((p) => ({
                              ...p,
                              [q.id]: e.target.value,
                            }))
                          }
                          className="mt-1 h-24 resize-none"
                          data-ocid="parent.forms.textarea"
                        />
                      )}
                      {["multiple_choice", "dropdown"].includes(
                        q.questionType,
                      ) && (
                        <Select
                          value={formAnswers[q.id] ?? ""}
                          onValueChange={(v) =>
                            setFormAnswers((p) => ({ ...p, [q.id]: v }))
                          }
                        >
                          <SelectTrigger
                            className="mt-1"
                            data-ocid="parent.forms.select"
                          >
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {q.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {q.questionType === "date" && (
                        <Input
                          type="date"
                          value={formAnswers[q.id] ?? ""}
                          onChange={(e) =>
                            setFormAnswers((p) => ({
                              ...p,
                              [q.id]: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      )}
                      {q.questionType === "rating" && (
                        <div className="mt-2">
                          <StarRatingInput
                            value={Number(formAnswers[q.id] ?? 0)}
                            onChange={(v) =>
                              setFormAnswers((p) => ({
                                ...p,
                                [q.id]: String(v),
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedForm(null);
                      setFormAnswers({});
                    }}
                    data-ocid="parent.forms.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    disabled={submitting}
                    data-ocid="parent.forms.submit_button"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : null}
                    Submit
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-800">
                    School Forms
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fill out forms shared by Mahara Schools
                  </p>
                </div>
                {forms.length === 0 ? (
                  <div
                    className="text-center py-12 text-gray-400"
                    data-ocid="parent.forms.empty_state"
                  >
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No forms available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3" data-ocid="parent.forms.list">
                    {forms.map((form, idx) => (
                      <Card
                        key={form.id}
                        data-ocid={`parent.forms.item.${idx + 1}`}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-sm text-gray-800">
                              {form.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {form.description}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {form.questions.length} questions
                            </p>
                          </div>
                          {submittedForms.has(form.id) ? (
                            <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                              Completed
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-shrink-0 bg-teal-500 hover:bg-teal-600"
                              onClick={() => setSelectedForm(form)}
                              data-ocid={`parent.forms.fill_button.${idx + 1}`}
                            >
                              Fill Out
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Teacher Rating Widget */}
                <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">
                    Rate Your Child's Teacher
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Share feedback to help improve teaching quality
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-teal-300 text-teal-600 hover:bg-teal-50"
                    onClick={() => setRatingOpen(true)}
                    data-ocid="parent.rating.open_modal_button"
                  >
                    <Star className="w-3.5 h-3.5 mr-1.5" />
                    Leave Teacher Feedback
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end">
          <button
            type="button"
            aria-label="Close notifications"
            className="absolute inset-0 bg-black/30 w-full h-full cursor-default"
            onClick={() => setNotifOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setNotifOpen(false)}
          />
          <div
            className="relative z-10 w-full sm:w-96 bg-white sm:mt-16 sm:mr-4 rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto"
            data-ocid="parent.notifications.popover"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                data-ocid="parent.notifications.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div
                className="text-center py-10 text-gray-400"
                data-ocid="parent.notifications.empty_state"
              >
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n, idx) => (
                  <button
                    type="button"
                    key={n.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      n.isRead ? "opacity-60" : ""
                    }`}
                    onClick={() => markNotifRead(n.id)}
                    data-ocid={`parent.notifications.item.${idx + 1}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          n.isRead ? "bg-gray-300" : "bg-teal-500"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-800">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Rating Dialog */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent data-ocid="parent.rating.dialog">
          <DialogHeader>
            <DialogTitle>Rate Your Child's Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Teacher Name</Label>
              <Input
                value={ratingTeacherName}
                onChange={(e) => setRatingTeacherName(e.target.value)}
                placeholder="Enter teacher's name"
                className="mt-1"
                data-ocid="parent.rating.teacher_input"
              />
            </div>
            <div>
              <Label className="text-xs">Your Child's Name</Label>
              <Input
                value={ratingStudentName}
                onChange={(e) => setRatingStudentName(e.target.value)}
                placeholder="Enter your child's name"
                className="mt-1"
                data-ocid="parent.rating.student_input"
              />
            </div>
            <div>
              <Label className="text-xs">Rating</Label>
              <div className="mt-2">
                <StarRatingInput
                  value={ratingValue}
                  onChange={setRatingValue}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Comment (optional)</Label>
              <Textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience..."
                className="mt-1 h-20 resize-none"
                data-ocid="parent.rating.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRatingOpen(false)}
              data-ocid="parent.rating.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={submittingRating || !ratingTeacherName}
              data-ocid="parent.rating.submit_button"
            >
              {submittingRating ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : null}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
