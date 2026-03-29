import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { Campaign, CampaignStatus } from "../types";
import {
  campaignFromBackend,
  campaignToBackend,
} from "../utils/backendAdapters";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Active: "bg-green-100 text-green-700 border-green-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
};

const EMPTY: Campaign = {
  id: "",
  name: "",
  description: "",
  status: "Draft",
  createdAt: "",
};

export default function CampaignsPage() {
  const { actor } = useActor();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign>(EMPTY);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCampaigns()
      .then((cs) => setCampaigns(cs.map(campaignFromBackend)))
      .catch(() => toast.error("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, [actor]);

  function openNew() {
    setEditing({
      ...EMPTY,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setIsNew(true);
    setDialogOpen(true);
  }

  function openEdit(c: Campaign) {
    setEditing({ ...c });
    setIsNew(false);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor.addCampaign(campaignToBackend(editing));
        toast.success("Campaign created!");
      } else {
        await actor.updateCampaign(campaignToBackend(editing));
        toast.success("Campaign updated!");
      }
      const updated = await actor.getCampaigns();
      setCampaigns(updated.map(campaignFromBackend));
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
      toast.success("Campaign deleted");
    } catch {
      toast.error("Failed to delete campaign");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="campaigns.loading_state">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          style={{ background: "#4F8F92" }}
          onClick={openNew}
          data-ocid="campaigns.add.primary_button"
        >
          <Plus size={14} className="mr-1" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 && (
        <Card className="shadow-card border-border">
          <CardContent
            className="py-16 text-center"
            data-ocid="campaigns.empty_state"
          >
            <Megaphone
              size={32}
              className="mx-auto text-muted-foreground mb-3"
            />
            <p className="text-sm text-muted-foreground">
              No campaigns yet. Create your first one!
            </p>
          </CardContent>
        </Card>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        data-ocid="campaigns.list"
      >
        {campaigns.map((c, i) => (
          <Card
            key={c.id}
            className="shadow-card border-border"
            data-ocid={`campaigns.item.${i + 1}`}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold">
                  {c.name}
                </CardTitle>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[c.status as CampaignStatus] ?? ""}`}
                >
                  {c.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {c.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Created {c.createdAt.slice(0, 10)}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                    data-ocid={`campaigns.edit_button.${i + 1}`}
                  >
                    <Pencil size={13} className="text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                    data-ocid={`campaigns.delete_button.${i + 1}`}
                  >
                    <Trash2 size={13} className="text-destructive" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="campaigns.dialog">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "New Campaign" : "Edit Campaign"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign Name</Label>
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Fall Enrollment 2026"
                data-ocid="campaigns.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={editing.description}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-[80px] resize-none"
                placeholder="Brief campaign description..."
                data-ocid="campaigns.description.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={editing.status}
                onValueChange={(v) =>
                  setEditing((p) => ({ ...p, status: v as CampaignStatus }))
                }
              >
                <SelectTrigger data-ocid="campaigns.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="campaigns.cancel_button"
            >
              Cancel
            </Button>
            <Button
              style={{ background: "#4F8F92" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="campaigns.save_button"
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="campaigns.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="campaigns.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="campaigns.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
