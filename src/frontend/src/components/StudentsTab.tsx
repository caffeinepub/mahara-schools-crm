import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { AuthUser, StudentRecord } from "../types";

const GRADES = [
  "Daycare",
  "Pre Nursery",
  "Nursery",
  "KG I",
  "KG II",
  "Primary",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
];

const BRANCHES = [
  { id: "b1", name: "Kondapur" },
  { id: "b2", name: "Bachupally" },
];

function branchName(branchId: string): string {
  return BRANCHES.find((b) => b.id === branchId)?.name ?? branchId;
}

function mapBranchInput(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("kondapur")) return "b1";
  if (lower.includes("bachupally")) return "b2";
  return "b1";
}

const TEMPLATE_HEADERS = [
  "Roll Number",
  "Student Name",
  "Class/Grade",
  "Branch",
  "Parent Name",
  "Parent Contact",
  "Parent Email",
  "Date of Birth",
  "Address",
];

const FIELD_MAP: { label: string; key: keyof StudentRecord }[] = [
  { label: "Roll Number", key: "rollNumber" },
  { label: "Student Name", key: "name" },
  { label: "Class/Grade", key: "grade" },
  { label: "Branch", key: "branchId" },
  { label: "Parent Name", key: "parentName" },
  { label: "Parent Contact", key: "parentContact" },
  { label: "Parent Email", key: "parentEmail" },
  { label: "Date of Birth", key: "dateOfBirth" },
  { label: "Address", key: "address" },
];

const REQUIRED_KEYS: (keyof StudentRecord)[] = ["rollNumber", "name", "grade"];

function downloadTemplate() {
  const csvContent = `${TEMPLATE_HEADERS.join(",")}\n`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mahara-students-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type ImportStep = "upload" | "map" | "import";

interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

function ImportWizard({ open, onClose, onImported }: ImportWizardProps) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [step, setStep] = useState<ImportStep>("upload");
  const [dragging, setDragging] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [columnMap, setColumnMap] = useState<
    Record<string, keyof StudentRecord | "">
  >({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setDragging(false);
    setParsedHeaders([]);
    setParsedRows([]);
    setColumnMap({});
    setImporting(false);
    setImportProgress(0);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  function autoDetectMapping(
    headers: string[],
  ): Record<string, keyof StudentRecord | ""> {
    const map: Record<string, keyof StudentRecord | ""> = {};
    for (const h of headers) {
      const lower = h.toLowerCase();
      if (lower.includes("roll")) map[h] = "rollNumber";
      else if (lower.includes("student") || lower === "name") map[h] = "name";
      else if (lower.includes("class") || lower.includes("grade"))
        map[h] = "grade";
      else if (lower.includes("branch")) map[h] = "branchId";
      else if (lower.includes("parent") && lower.includes("name"))
        map[h] = "parentName";
      else if (lower.includes("contact") || lower.includes("phone"))
        map[h] = "parentContact";
      else if (lower.includes("email")) map[h] = "parentEmail";
      else if (lower.includes("birth") || lower.includes("dob"))
        map[h] = "dateOfBirth";
      else if (lower.includes("address")) map[h] = "address";
      else map[h] = "";
    }
    return map;
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  function parseFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          toast.error("File is empty or has no data rows");
          return;
        }
        const headers = parseCSVLine(lines[0]);
        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = cells[idx] ?? "";
          });
          rows.push(row);
        }
        if (rows.length === 0) {
          toast.error("No data rows found in file");
          return;
        }
        setParsedHeaders(headers);
        setParsedRows(rows);
        setColumnMap(autoDetectMapping(headers));
        setStep("map");
      } catch {
        toast.error("Failed to parse file. Please use .csv format.");
      }
    };
    reader.readAsText(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }

  function buildRecords(): StudentRecord[] {
    return parsedRows.map((row) => {
      const rec: StudentRecord = {
        id: "",
        rollNumber: "",
        name: "",
        grade: "",
        branchId: "b1",
        parentName: "",
        parentContact: "",
        parentEmail: "",
        dateOfBirth: "",
        address: "",
        admissionNumber: "",
      };
      for (const [header, field] of Object.entries(columnMap)) {
        if (!field) continue;
        const val = String(row[header] ?? "").trim();
        if (field === "branchId") {
          rec.branchId = mapBranchInput(val);
        } else {
          (rec as any)[field] = val;
        }
      }
      return rec;
    });
  }

  const missingRequired = REQUIRED_KEYS.filter(
    (k) => !Object.values(columnMap).includes(k),
  );

  async function handleImport() {
    if (!actor) return;
    const records = buildRecords();
    setImporting(true);
    setImportProgress(10);
    try {
      setImportProgress(40);
      await actor.addStudentRecordsBulk(records);
      setImportProgress(100);
      toast.success(
        `${records.length} student${records.length !== 1 ? "s" : ""} imported successfully`,
      );
      onImported();
      handleClose();
    } catch {
      toast.error("Import failed. Please try again.");
      setImporting(false);
      setImportProgress(0);
    }
  }

  const previewRows = parsedRows.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-2xl w-full"
        data-ocid="students.import.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet
              size={18}
              className="text-[oklch(var(--primary))]"
            />
            Import Students
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs mb-2">
          {(["upload", "map", "import"] as ImportStep[]).map((s, i) => (
            <>
              <span
                key={s}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : i < ["upload", "map", "import"].indexOf(step)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 2 && <span className="text-muted-foreground">→</span>}
            </>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <button
              type="button"
              className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileRef.current?.click()}
              data-ocid="students.import.dropzone"
            >
              <Upload
                className="mx-auto mb-3 text-muted-foreground"
                size={32}
              />
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Accepts .csv, .xlsx, .xls
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                data-ocid="students.import.upload_button"
              />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              data-ocid="students.import.template_button"
            >
              <Download size={14} className="mr-1.5" />
              Download Template
            </Button>
          </div>
        )}

        {/* Step 2: Map columns */}
        {step === "map" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {parsedRows.length} rows detected. Map columns to student fields
              below.
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {parsedHeaders.map((h) => (
                <div key={h} className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">{h}</Label>
                  <Select
                    value={columnMap[h] ?? ""}
                    onValueChange={(v) =>
                      setColumnMap((prev) => ({
                        ...prev,
                        [h]: v as keyof StudentRecord | "",
                      }))
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-xs"
                      data-ocid="students.import.select"
                    >
                      <SelectValue placeholder="— skip —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— skip —</SelectItem>
                      {FIELD_MAP.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Preview rows */}
            {previewRows.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Preview (first 3 rows)
                </p>
                <div className="text-xs bg-muted/40 rounded-lg p-2 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {parsedHeaders.map((h) => (
                          <th
                            key={h}
                            className="text-left pr-3 pb-1 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr
                          key={
                            Object.values(row).slice(0, 2).join("-") ||
                            String(i)
                          }
                        >
                          {parsedHeaders.map((h) => (
                            <td
                              key={h}
                              className="pr-3 py-0.5 text-muted-foreground"
                            >
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {missingRequired.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
                <AlertTriangle size={14} />
                Required fields not mapped: {missingRequired.join(", ")}
              </div>
            )}

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("upload")}
                data-ocid="students.import.cancel_button"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setStep("import")}
                disabled={missingRequired.length > 0}
                data-ocid="students.import.confirm_button"
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Import */}
        {step === "import" && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <Users className="mx-auto mb-2 text-primary" size={32} />
              <p className="text-2xl font-bold text-primary">
                {parsedRows.length}
              </p>
              <p className="text-sm text-muted-foreground">
                student{parsedRows.length !== 1 ? "s" : ""} ready to import
              </p>
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Importing...
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("map")}
                disabled={importing}
                data-ocid="students.import.cancel_button"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={importing || !actor}
                className="bg-primary text-primary-foreground"
                data-ocid="students.import.submit_button"
              >
                {importing ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${parsedRows.length} Student${parsedRows.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---- Add/Edit Student Dialog ----
const EMPTY_STUDENT: StudentRecord = {
  id: "",
  rollNumber: "",
  name: "",
  grade: "",
  branchId: "b1",
  parentName: "",
  parentContact: "",
  parentEmail: "",
  dateOfBirth: "",
  address: "",
  admissionNumber: "",
};

interface StudentFormProps {
  open: boolean;
  student: StudentRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

function StudentFormDialog({
  open,
  student,
  onClose,
  onSaved,
}: StudentFormProps) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [form, setForm] = useState<StudentRecord>(EMPTY_STUDENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(student ?? EMPTY_STUDENT);
  }, [student]);

  const isEdit = !!student?.id;

  function update(key: keyof StudentRecord, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!actor) return;
    if (!form.rollNumber.trim() || !form.name.trim() || !form.grade) {
      toast.error("Roll Number, Student Name, and Class/Grade are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await actor.updateStudentRecord(form);
        toast.success("Student updated successfully");
      } else {
        await actor.addStudentRecord({ ...form, id: "" });
        toast.success("Student added successfully");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save student. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg w-full"
        data-ocid="students.form.dialog"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-1">
            <Label className="text-xs">Roll Number *</Label>
            <Input
              value={form.rollNumber}
              onChange={(e) => update("rollNumber", e.target.value)}
              placeholder="e.g. 001"
              data-ocid="students.form.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Student Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Full name"
              data-ocid="students.form.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Class / Grade *</Label>
            <Select
              value={form.grade}
              onValueChange={(v) => update("grade", v)}
            >
              <SelectTrigger data-ocid="students.form.select">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Branch</Label>
            <Select
              value={form.branchId}
              onValueChange={(v) => update("branchId", v)}
            >
              <SelectTrigger data-ocid="students.form.select">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date of Birth</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              data-ocid="students.form.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Admission Number</Label>
            <Input
              value={form.admissionNumber}
              onChange={(e) => update("admissionNumber", e.target.value)}
              placeholder="Optional"
              data-ocid="students.form.input"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Full address"
              rows={2}
              data-ocid="students.form.textarea"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Parent Name</Label>
            <Input
              value={form.parentName}
              onChange={(e) => update("parentName", e.target.value)}
              placeholder="Parent / Guardian"
              data-ocid="students.form.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Parent Phone</Label>
            <Input
              value={form.parentContact}
              onChange={(e) => update("parentContact", e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              data-ocid="students.form.input"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Parent Email</Label>
            <Input
              type="email"
              value={form.parentEmail}
              onChange={(e) => update("parentEmail", e.target.value)}
              placeholder="parent@email.com"
              data-ocid="students.form.input"
            />
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
            data-ocid="students.form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !actor}
            data-ocid="students.form.submit_button"
          >
            {saving ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : null}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main StudentsTab ----
interface StudentsTabProps {
  user: AuthUser;
}

export default function StudentsTab({ user: _user }: StudentsTabProps) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as any;

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<"all" | "b1" | "b2">("all");
  const [activeGrade, setActiveGrade] = useState<string>("all");
  const [importOpen, setImportOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const data: StudentRecord[] = await actor.getAllStudentRecords();
      setStudents(data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      await loadStudents();
    })();
  }, [actor, isFetching, loadStudents]);

  // Derived: filtered students
  const filtered = students.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBranch = branchFilter === "all" || s.branchId === branchFilter;
    const matchGrade = activeGrade === "all" || s.grade === activeGrade;
    return matchSearch && matchBranch && matchGrade;
  });

  // Derive grades that have students (for tabs)
  const gradesWithStudents = GRADES.filter((g) =>
    students.some((s) => {
      const matchBranch = branchFilter === "all" || s.branchId === branchFilter;
      return s.grade === g && matchBranch;
    }),
  );

  const countForGrade = (grade: string) =>
    students.filter((s) => {
      const matchBranch = branchFilter === "all" || s.branchId === branchFilter;
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return s.grade === grade && matchBranch && matchSearch;
    }).length;

  const allCount = students.filter((s) => {
    const matchBranch = branchFilter === "all" || s.branchId === branchFilter;
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchSearch;
  }).length;

  async function handleDelete(id: string) {
    if (!actor) return;
    setDeleting(true);
    try {
      await actor.deleteStudentRecord(id);
      toast.success("Student deleted");
      setDeleteId(null);
      await loadStudents();
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  }

  function openAdd() {
    setEditingStudent(null);
    setFormOpen(true);
  }

  function openEdit(s: StudentRecord) {
    setEditingStudent(s);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4" data-ocid="students.section">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold">Student Database</h2>
          <p className="text-xs text-muted-foreground">
            {students.length} student{students.length !== 1 ? "s" : ""} across
            all classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            data-ocid="students.import.open_modal_button"
          >
            <FileSpreadsheet size={14} className="mr-1.5" />
            Import CSV/Excel
          </Button>
          <Button
            size="sm"
            onClick={openAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="students.add.open_modal_button"
          >
            <Plus size={14} className="mr-1.5" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search by name or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-ocid="students.search_input"
          />
        </div>
        <Select
          value={branchFilter}
          onValueChange={(v) => setBranchFilter(v as "all" | "b1" | "b2")}
        >
          <SelectTrigger
            className="h-8 w-36 text-sm"
            data-ocid="students.branch.select"
          >
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="b1">Kondapur</SelectItem>
            <SelectItem value="b2">Bachupally</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Class-wise grade tabs */}
      <Tabs
        value={activeGrade}
        onValueChange={setActiveGrade}
        data-ocid="students.grade.tab"
      >
        <TabsList className="h-8 flex-wrap gap-1 bg-muted/50 p-1 overflow-x-auto">
          <TabsTrigger
            value="all"
            className="h-6 text-xs px-3"
            data-ocid="students.filter.tab"
          >
            All
            {allCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 h-4 min-w-[18px] text-[10px] px-1"
              >
                {allCount}
              </Badge>
            )}
          </TabsTrigger>
          {gradesWithStudents.map((grade) => (
            <TabsTrigger
              key={grade}
              value={grade}
              className="h-6 text-xs px-3"
              data-ocid="students.filter.tab"
            >
              {grade}
              {countForGrade(grade) > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 min-w-[18px] text-[10px] px-1"
                >
                  {countForGrade(grade)}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table */}
      {loading ? (
        <div className="space-y-2" data-ocid="students.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
          data-ocid="students.empty_state"
        >
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {students.length === 0
              ? "No students yet"
              : "No students match your filters"}
          </p>
          <p className="text-xs mt-1">
            {students.length === 0
              ? "Import a CSV/Excel file or add a student manually."
              : "Try adjusting your search or filters."}
          </p>
          {students.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => setImportOpen(true)}
              data-ocid="students.import.open_modal_button"
            >
              <FileSpreadsheet size={14} className="mr-1.5" />
              Import CSV/Excel
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold w-16">
                    Roll No
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold">Class</TableHead>
                  <TableHead className="text-xs font-semibold">
                    Branch
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Date of Birth
                  </TableHead>
                  <TableHead className="text-xs font-semibold hidden lg:table-cell">
                    Address
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Parent
                  </TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">
                    Parent Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold w-20">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, idx) => (
                  <TableRow
                    key={s.id || idx}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`students.item.${idx + 1}`}
                  >
                    <TableCell className="text-xs font-mono font-medium text-primary">
                      {s.rollNumber || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {s.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-primary/30 text-primary bg-primary/5"
                      >
                        {s.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {branchName(s.branchId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.dateOfBirth || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[140px] truncate">
                      {s.address || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.parentName || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {s.parentContact || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {s.parentEmail || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openEdit(s)}
                          data-ocid={`students.edit_button.${idx + 1}`}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                          data-ocid={`students.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {students.length} students
            </p>
          </div>
        </div>
      )}

      {/* Import Wizard */}
      <ImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={loadStudents}
      />

      {/* Add/Edit Form */}
      <StudentFormDialog
        open={formOpen}
        student={editingStudent}
        onClose={() => setFormOpen(false)}
        onSaved={loadStudents}
      />

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="students.delete.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-destructive" />
              Delete Student
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this student? This action cannot be
            undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              data-ocid="students.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              data-ocid="students.delete.confirm_button"
            >
              {deleting ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : null}
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
