import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, TrendingUp, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { FollowUp, Lead } from "../types";
import { followUpFromBackend, leadFromBackend } from "../utils/backendAdapters";

const BRAND_COLORS = [
  "#78C8C8",
  "#6BA3D6",
  "#A8CB48",
  "#B8A7CC",
  "#F5C518",
  "#F4A8BE",
];

const PIPELINE_STAGES = [
  "New Inquiry",
  "Qualified",
  "Campus Tour",
  "Application Sent",
  "Enrolled",
  "Rejected",
];

export default function ReportsPage() {
  const { actor } = useActor();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getLeads(), actor.getFollowUps()])
      .then(([ls, fus]) => {
        setLeads(ls.map(leadFromBackend));
        setFollowUps(fus.map(followUpFromBackend));
      })
      .catch(() => toast.error("Failed to load report data"))
      .finally(() => setLoading(false));
  }, [actor]);

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const total = leads.length;
    const enrolled = leads.filter((l) => l.status === "Enrolled").length;
    const rate = total > 0 ? ((enrolled / total) * 100).toFixed(1) : "0";
    const overdue = followUps.filter(
      (f) => !f.completed && f.dueDate < today,
    ).length;
    return { total, enrolled, rate, overdue };
  }, [leads, followUps, today]);

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of leads) {
      map[l.source] = (map[l.source] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const pipelineData = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      name: stage,
      count: leads.filter((l) => l.status === stage).length,
    }));
  }, [leads]);

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of leads) {
      const month = l.createdAt.slice(0, 7);
      map[month] = (map[month] || 0) + 1;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        count,
      }));
  }, [leads]);

  const agentData = useMemo(() => {
    const map: Record<string, { total: number; enrolled: number }> = {};
    for (const l of leads) {
      if (!map[l.assignedAgent])
        map[l.assignedAgent] = { total: 0, enrolled: 0 };
      map[l.assignedAgent].total++;
      if (l.status === "Enrolled") map[l.assignedAgent].enrolled++;
    }
    return Object.entries(map)
      .map(([agent, data]) => ({
        agent,
        ...data,
        rate:
          data.total > 0
            ? `${((data.enrolled / data.total) * 100).toFixed(0)}%`
            : "0%",
      }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  if (loading) {
    return (
      <div className="space-y-6" data-ocid="reports.loading_state">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="reports.page">
      {/* Quick stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        data-ocid="reports.stats.panel"
      >
        <Card className="border-border shadow-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Leads
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.total}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#E8F6F6" }}
              >
                <Users size={18} style={{ color: "#78C8C8" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Enrolled
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.enrolled}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#EEF7E0" }}
              >
                <UserCheck size={18} style={{ color: "#A8CB48" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversion
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.rate}%
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#EBF2FA" }}
              >
                <TrendingUp size={18} style={{ color: "#6BA3D6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Overdue Follow-ups
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.overdue}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#FFF3E0" }}
              >
                <AlertTriangle size={18} style={{ color: "#F59E0B" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Lead Source Breakdown */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Lead Source Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {sourceData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={BRAND_COLORS[i % BRAND_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={BRAND_COLORS[i % BRAND_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Monthly Lead Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#78C8C8"
                    strokeWidth={2}
                    dot={{ fill: "#78C8C8", r: 4 }}
                    name="New Leads"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Agents */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {agentData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Agent</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Enrolled</TableHead>
                    <TableHead className="text-right pr-4">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentData.map((row, i) => (
                    <TableRow
                      key={row.agent}
                      data-ocid={`reports.agent.item.${i + 1}`}
                    >
                      <TableCell className="pl-4 text-sm font-medium">
                        {row.agent}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.total}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.enrolled}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#EEF7E0", color: "#5A8A1A" }}
                        >
                          {row.rate}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
