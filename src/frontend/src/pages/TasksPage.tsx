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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { backendInterface as FullBackend, Task } from "../backend.d";
import { useActor } from "../hooks/useActor";

const PRIORITY_BADGE: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

const EMPTY_TASK: Task = {
  id: "",
  title: "",
  description: "",
  assignedTo: "",
  dueDate: "",
  priority: "Medium",
  completed: false,
  leadId: "",
  createdAt: "",
};

export default function TasksPage() {
  const { actor: _actor } = useActor();
  const actor = _actor as unknown as FullBackend | null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Task>(EMPTY_TASK);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!actor) return;
    actor
      .getTasks()
      .then(setTasks)
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [actor]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const dueToday = tasks.filter(
      (t) => !t.completed && t.dueDate === today,
    ).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate < today,
    ).length;
    const completed = tasks.filter((t) => t.completed).length;
    return { total, dueToday, overdue, completed };
  }, [tasks, today]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "today":
        return tasks.filter((t) => !t.completed && t.dueDate === today);
      case "overdue":
        return tasks.filter((t) => !t.completed && t.dueDate < today);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter, today]);

  async function handleComplete(task: Task) {
    if (!actor) return;
    const updated = { ...task, completed: true };
    try {
      await actor.updateTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to update task");
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  async function handleAddTask() {
    if (!actor || !form.title.trim()) return;
    setSaving(true);
    const newTask: Task = {
      ...form,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await actor.addTask(newTask);
      setTasks((prev) => [...prev, newTask]);
      setDialogOpen(false);
      setForm(EMPTY_TASK);
      toast.success("Task added!");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="tasks.loading_state">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5" data-ocid="tasks.page">
      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        data-ocid="tasks.stats.panel"
      >
        <Card className="border-border shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Total
            </p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Due Today
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: stats.dueToday > 0 ? "#6BA3D6" : undefined }}
            >
              {stats.dueToday}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Overdue
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: stats.overdue > 0 ? "#EF4444" : undefined }}
            >
              {stats.overdue}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Completed
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#A8CB48" }}>
              {stats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all" data-ocid="tasks.all.tab">
              All
            </TabsTrigger>
            <TabsTrigger value="today" data-ocid="tasks.today.tab">
              Due Today
            </TabsTrigger>
            <TabsTrigger value="overdue" data-ocid="tasks.overdue.tab">
              Overdue
            </TabsTrigger>
            <TabsTrigger value="completed" data-ocid="tasks.completed.tab">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          size="sm"
          className="ml-auto h-9"
          style={{ background: "#78C8C8" }}
          onClick={() => {
            setForm(EMPTY_TASK);
            setDialogOpen(true);
          }}
          data-ocid="tasks.add.primary_button"
        >
          <Plus size={14} className="mr-1" />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <Card className="border-border">
            <CardContent
              className="py-12 text-center"
              data-ocid="tasks.empty_state"
            >
              <CheckSquare
                className="mx-auto mb-2 text-muted-foreground"
                size={32}
              />
              <p className="text-sm text-muted-foreground">No tasks here</p>
            </CardContent>
          </Card>
        )}
        {filtered.map((task, i) => {
          const isOverdue = !task.completed && task.dueDate < today;
          const isDueToday = !task.completed && task.dueDate === today;
          return (
            <Card
              key={task.id}
              className={`border-border shadow-card transition-opacity ${
                task.completed ? "opacity-60" : ""
              }`}
              data-ocid={`tasks.item.${i + 1}`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.Medium
                        }`}
                      >
                        {task.priority}
                      </span>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-[10px] text-red-600 font-medium">
                          <AlertTriangle size={10} /> Overdue
                        </span>
                      )}
                      {isDueToday && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                          <Clock size={10} /> Due today
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {task.assignedTo && (
                        <span className="text-[11px] text-muted-foreground">
                          👤 {task.assignedTo}
                        </span>
                      )}
                      {task.dueDate && (
                        <span
                          className={`text-[11px] ${
                            isOverdue ? "text-red-500" : "text-muted-foreground"
                          }`}
                        >
                          📅 {task.dueDate}
                        </span>
                      )}
                      {task.leadId && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          Lead #{task.leadId.slice(-4)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!task.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:text-green-600"
                        onClick={() => handleComplete(task)}
                        title="Mark complete"
                        data-ocid={`tasks.checkbox.${i + 1}`}
                      >
                        <CheckCircle2 size={16} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:text-red-500"
                      onClick={() => handleDelete(task.id)}
                      title="Delete"
                      data-ocid={`tasks.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="tasks.add.dialog">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Task title..."
                data-ocid="tasks.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-[60px] resize-none"
                placeholder="Optional description..."
                data-ocid="tasks.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Assigned To</Label>
                <Input
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assignedTo: e.target.value }))
                  }
                  placeholder="Name..."
                  data-ocid="tasks.assignedto.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  data-ocid="tasks.duedate.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger data-ocid="tasks.priority.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Lead ID (optional)</Label>
                <Input
                  value={form.leadId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, leadId: e.target.value }))
                  }
                  placeholder="Lead ID..."
                  data-ocid="tasks.leadid.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="tasks.add.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#78C8C8" }}
              onClick={handleAddTask}
              disabled={saving || !form.title.trim()}
              data-ocid="tasks.add.submit_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
