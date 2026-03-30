import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Megaphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParentActor } from "../../hooks/useParentActor";
import type { AuthUser, SchoolUpdate } from "../../types";

interface Props {
  user: AuthUser;
}

function categoryStyle(cat: string): { badge: string; icon: React.ReactNode } {
  switch (cat.toLowerCase()) {
    case "announcement":
      return {
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Megaphone className="w-4 h-4" />,
      };
    case "event":
      return {
        badge: "bg-teal-100 text-teal-800 border-teal-200",
        icon: <CalendarDays className="w-4 h-4" />,
      };
    default:
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertCircle className="w-4 h-4" />,
      };
  }
}

export default function ParentUpdates({ user: _user }: Props) {
  const { actor } = useParentActor();
  const [updates, setUpdates] = useState<SchoolUpdate[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor
      .getSchoolUpdates()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setUpdates(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="space-y-3" data-ocid="updates.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          School Updates
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest announcements and notices from Mahara Schools
        </p>
      </div>

      {updates.length === 0 ? (
        <Card data-ocid="updates.empty_state">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No updates available</p>
            <p className="text-sm mt-1">
              School announcements will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update, idx) => {
            const style = categoryStyle(update.category);
            const isOpen = expanded.has(update.id);
            return (
              <Card
                key={update.id}
                className="shadow-sm overflow-hidden"
                data-ocid={`updates.item.${idx + 1}`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => toggleExpand(update.id)}
                >
                  <CardHeader className="py-3 px-4 flex flex-row items-start justify-between gap-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-muted-foreground">
                        {style.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {update.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {update.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`text-xs border ${style.badge}`}>
                        {update.category}
                      </Badge>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </button>
                {isOpen && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="border-t pt-3">
                      <p className="text-sm text-foreground leading-relaxed">
                        {update.content}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
