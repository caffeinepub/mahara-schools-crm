import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../store";

interface FormQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: string[];
  required: boolean;
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

interface FormResponse {
  id: string;
  formId: string;
  parentUsername: string;
  studentName: string;
  answers: { questionId: string; questionText: string; answer: string }[];
  submittedAt: string;
}

const QUESTION_TYPES = [
  { value: "short_text", label: "Short Text" },
  { value: "paragraph", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "rating", label: "Rating (1–5)" },
];

function newQuestion(): FormQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    questionText: "",
    questionType: "short_text",
    options: [],
    required: false,
  };
}

export default function FormBuilderPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const user = getAuthUser();

  const [forms, setForms] = useState<SchoolForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<SchoolForm | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const emptyForm: SchoolForm = {
    id: "",
    title: "",
    description: "",
    questions: [],
    publishedAt: "",
    isDraft: true,
    createdBy: user?.username ?? "",
    responseCount: BigInt(0),
  };

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getAllForms(), actor.getFormResponses("")])
      .then(([fs, _]: [SchoolForm[], FormResponse[]]) => {
        setForms(fs ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  async function loadResponses(formId: string) {
    if (!actor || !formId) return;
    try {
      const res = await actor.getFormResponses(formId);
      setResponses(res ?? []);
    } catch {
      toast.error("Failed to load responses");
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadResponses is stable
  useEffect(() => {
    if (selectedFormId) loadResponses(selectedFormId);
  }, [selectedFormId]);

  function openCreate() {
    setEditingForm({ ...emptyForm, id: `form-${Date.now()}` });
    setEditorOpen(true);
  }

  function openEdit(form: SchoolForm) {
    setEditingForm({ ...form, questions: [...form.questions] });
    setEditorOpen(true);
  }

  async function handleSave(publish: boolean) {
    if (!actor || !editingForm) return;
    setSaving(true);
    try {
      const form: SchoolForm = {
        ...editingForm,
        isDraft: !publish,
        publishedAt: publish
          ? new Date().toISOString()
          : editingForm.publishedAt,
      };
      const isNew = !forms.find((f) => f.id === form.id);
      if (isNew) {
        await actor.addForm(form);
      } else {
        await actor.updateForm(form);
      }
      const updated = await actor.getAllForms();
      setForms(updated ?? []);
      setEditorOpen(false);
      toast.success(publish ? "Form published!" : "Form saved as draft");
    } catch {
      toast.error("Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(form: SchoolForm) {
    if (!actor) return;
    try {
      await actor.updateForm({
        ...form,
        isDraft: !form.isDraft,
        publishedAt: form.isDraft ? new Date().toISOString() : form.publishedAt,
      });
      const updated = await actor.getAllForms();
      setForms(updated ?? []);
    } catch {
      toast.error("Failed to update form");
    }
  }

  async function handleDeleteForm(id: string) {
    if (!actor) return;
    try {
      await actor.deleteForm(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
      toast.success("Form deleted");
    } catch {
      toast.error("Failed to delete form");
    }
  }

  function addQuestion() {
    if (!editingForm) return;
    setEditingForm((prev) =>
      prev ? { ...prev, questions: [...prev.questions, newQuestion()] } : prev,
    );
  }

  function removeQuestion(qId: string) {
    if (!editingForm) return;
    setEditingForm((prev) =>
      prev
        ? { ...prev, questions: prev.questions.filter((q) => q.id !== qId) }
        : prev,
    );
  }

  function updateQuestion(qId: string, patch: Partial<FormQuestion>) {
    if (!editingForm) return;
    setEditingForm((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === qId ? { ...q, ...patch } : q,
            ),
          }
        : prev,
    );
  }

  function moveQuestion(qId: string, dir: -1 | 1) {
    if (!editingForm) return;
    const idx = editingForm.questions.findIndex((q) => q.id === qId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= editingForm.questions.length) return;
    const qs = [...editingForm.questions];
    [qs[idx], qs[newIdx]] = [qs[newIdx], qs[idx]];
    setEditingForm((prev) => (prev ? { ...prev, questions: qs } : prev));
  }

  // Export to CSV
  function exportCSV() {
    const form = forms.find((f) => f.id === selectedFormId);
    if (!form || responses.length === 0) return;
    const headers = [
      "Submitted At",
      "Parent",
      "Student",
      ...form.questions.map((q) => q.questionText),
    ];
    const rows = responses.map((r) => [
      r.submittedAt,
      r.parentUsername,
      r.studentName,
      ...form.questions.map((q) => {
        const ans = r.answers.find((a) => a.questionId === q.id);
        return ans?.answer ?? "";
      }),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Response breakdown for MCQ/rating
  const responseBreakdown = useMemo(() => {
    const form = forms.find((f) => f.id === selectedFormId);
    if (!form) return [];
    return form.questions
      .filter((q) =>
        ["multiple_choice", "dropdown", "rating"].includes(q.questionType),
      )
      .map((q) => {
        const optionCounts: Record<string, number> = {};
        for (const r of responses) {
          const ans =
            r.answers.find((a) => a.questionId === q.id)?.answer ?? "";
          if (ans) optionCounts[ans] = (optionCounts[ans] ?? 0) + 1;
        }
        return {
          question: q.questionText,
          data: Object.entries(optionCounts).map(([name, count]) => ({
            name,
            count,
          })),
        };
      });
  }, [forms, responses, selectedFormId]);

  if (loading) {
    return (
      <div className="space-y-3" data-ocid="forms.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Form Builder</h1>
            <p className="text-xs text-muted-foreground">
              Create and manage school forms
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={openCreate}
          data-ocid="forms.open_modal_button"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Button>
      </div>

      <Tabs defaultValue="forms" data-ocid="forms.tab">
        <TabsList>
          <TabsTrigger value="forms" data-ocid="forms.forms.tab">
            Forms
          </TabsTrigger>
          <TabsTrigger value="responses" data-ocid="forms.responses.tab">
            Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-4 space-y-3">
          {forms.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="forms.empty_state"
            >
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No forms yet</p>
              <p className="text-xs mt-1">
                Create your first form to collect responses from parents.
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="forms.list">
              {forms.map((form, idx) => (
                <Card key={form.id} data-ocid={`forms.item.${idx + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm text-foreground truncate">
                            {form.title}
                          </p>
                          <Badge
                            className={
                              form.isDraft
                                ? "bg-gray-100 text-gray-600 text-[10px]"
                                : "bg-green-100 text-green-700 text-[10px]"
                            }
                          >
                            {form.isDraft ? "Draft" : "Published"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {form.questions.length} questions ·{" "}
                          {Number(form.responseCount)} responses
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={!form.isDraft}
                          onCheckedChange={() => handleTogglePublish(form)}
                          data-ocid={`forms.toggle.${idx + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(form)}
                          data-ocid={`forms.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteForm(form.id)}
                          data-ocid={`forms.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responses" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger
                className="h-8 w-56 text-xs"
                data-ocid="forms.select"
              >
                <SelectValue placeholder="Select a form..." />
              </SelectTrigger>
              <SelectContent>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {responses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 text-xs"
                onClick={exportCSV}
                data-ocid="forms.download_button"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            )}
          </div>

          {selectedFormId && responses.length === 0 && (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="forms.responses.empty_state"
            >
              <p className="text-sm">No responses yet for this form.</p>
            </div>
          )}

          {/* Breakdown charts */}
          {responseBreakdown.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: breakdown order is static per form
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={item.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#78C8C8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}

          {/* Responses table */}
          {responses.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Student</TableHead>
                        {forms
                          .find((f) => f.id === selectedFormId)
                          ?.questions.map((q) => (
                            <TableHead
                              key={q.id}
                              className="text-xs max-w-32 truncate"
                            >
                              {q.questionText}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((r, idx) => (
                        <TableRow
                          key={r.id}
                          data-ocid={`forms.response.${idx + 1}`}
                        >
                          <TableCell className="text-xs">
                            {new Date(r.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.parentUsername}
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.studentName}
                          </TableCell>
                          {forms
                            .find((f) => f.id === selectedFormId)
                            ?.questions.map((q) => (
                              <TableCell
                                key={q.id}
                                className="text-xs max-w-32 truncate"
                              >
                                {r.answers.find((a) => a.questionId === q.id)
                                  ?.answer ?? "—"}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="forms.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingForm?.id && forms.find((f) => f.id === editingForm.id)
                ? "Edit Form"
                : "Create Form"}
            </DialogTitle>
          </DialogHeader>

          {editingForm && (
            <div className="space-y-5">
              <div>
                <Label className="text-xs">Form Title *</Label>
                <Input
                  value={editingForm.title}
                  onChange={(e) =>
                    setEditingForm((p) =>
                      p ? { ...p, title: e.target.value } : p,
                    )
                  }
                  placeholder="e.g. Parent Feedback Form 2026"
                  className="mt-1"
                  data-ocid="forms.input"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={editingForm.description}
                  onChange={(e) =>
                    setEditingForm((p) =>
                      p ? { ...p, description: e.target.value } : p,
                    )
                  }
                  placeholder="Brief description of this form..."
                  className="mt-1 h-20 resize-none"
                  data-ocid="forms.textarea"
                />
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Questions
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={addQuestion}
                    data-ocid="forms.add_question_button"
                  >
                    <Plus className="w-3 h-3" /> Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingForm.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="border border-border rounded-lg p-3 space-y-2 bg-muted/20"
                      data-ocid={`forms.question.${idx + 1}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5">
                          {idx + 1}.
                        </span>
                        <Input
                          value={q.questionText}
                          onChange={(e) =>
                            updateQuestion(q.id, {
                              questionText: e.target.value,
                            })
                          }
                          placeholder="Enter question..."
                          className="flex-1 h-7 text-xs"
                        />
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveQuestion(q.id, -1)}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveQuestion(q.id, 1)}
                            disabled={idx === editingForm.questions.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeQuestion(q.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-5">
                        <Select
                          value={q.questionType}
                          onValueChange={(v) =>
                            updateQuestion(q.id, { questionType: v })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1.5">
                          <Checkbox
                            id={`req-${q.id}`}
                            checked={q.required}
                            onCheckedChange={(c) =>
                              updateQuestion(q.id, { required: c === true })
                            }
                            className="w-3.5 h-3.5"
                          />
                          <Label
                            htmlFor={`req-${q.id}`}
                            className="text-xs cursor-pointer"
                          >
                            Required
                          </Label>
                        </div>
                      </div>
                      {["multiple_choice", "checkbox", "dropdown"].includes(
                        q.questionType,
                      ) && (
                        <div className="pl-5 space-y-1">
                          {q.options.map((opt, oi) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: option order is user-defined
                            <div key={oi} className="flex gap-1">
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.options];
                                  newOpts[oi] = e.target.value;
                                  updateQuestion(q.id, { options: newOpts });
                                }}
                                placeholder={`Option ${oi + 1}`}
                                className="h-6 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => {
                                  const newOpts = q.options.filter(
                                    (_, i) => i !== oi,
                                  );
                                  updateQuestion(q.id, { options: newOpts });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs gap-1 text-muted-foreground"
                            onClick={() =>
                              updateQuestion(q.id, {
                                options: [...q.options, ""],
                              })
                            }
                          >
                            <Plus className="w-3 h-3" /> Add option
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {editingForm.questions.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No questions yet. Click "Add Question" to start.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditorOpen(false)}
              data-ocid="forms.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              data-ocid="forms.save_button"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : null}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              data-ocid="forms.submit_button"
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
