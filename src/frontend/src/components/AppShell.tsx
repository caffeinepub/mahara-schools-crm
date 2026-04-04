import React, { useState } from "react";
import type { Page } from "../App";
import AIReplyPage from "../pages/AIReplyPage";
import AcademicsPage from "../pages/AcademicsPage";
import BlogManagerPage from "../pages/BlogManagerPage";
import CampaignsPage from "../pages/CampaignsPage";
import ClassroomActivitiesPage from "../pages/ClassroomActivitiesPage";
import DashboardPage from "../pages/DashboardPage";
import FormBuilderPage from "../pages/FormBuilderPage";
import IntegrationsPage from "../pages/IntegrationsPage";
import LeadManagementPage from "../pages/LeadManagementPage";
import ManagementPage from "../pages/ManagementPage";
import ReportsPage from "../pages/ReportsPage";
import StaffAttendancePage from "../pages/StaffAttendancePage";
import TasksPage from "../pages/TasksPage";
import TeacherPerformancePage from "../pages/TeacherPerformancePage";
import WhatsAppHistoryPage from "../pages/WhatsAppHistoryPage";
import type { AuthUser } from "../types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error("Page error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-sm text-muted-foreground">
              Something went wrong loading this page.
            </p>
            <button
              type="button"
              className="text-xs text-teal-600 underline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

interface Props {
  user: AuthUser;
  page: Page;
  setPage: (p: Page) => void;
  onLogout: () => void;
}

export default function AppShell({ user, page, setPage, onLogout }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const titles: Record<Page, string> = {
    dashboard: "Dashboard",
    leads: "Lead Management",
    campaigns: "Campaigns",
    management: "Management",
    "ai-reply": "AI Suggestions",
    academics: "Academics",
    reports: "Reports & Analytics",
    tasks: "Tasks",
    integrations: "Integrations",
    "whatsapp-history": "WhatsApp History",
    attendance: "Staff Attendance",
    "teacher-performance": "Teacher Performance",
    activities: "Classroom Activities",
    forms: "Form Builder",
    blog: "Blog Manager",
  };

  // Counselor default page
  const effectivePage =
    page === "dashboard" && user.role === "Counselor" ? "leads" : page;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          user={user}
          page={effectivePage}
          setPage={setPage}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar
              user={user}
              page={effectivePage}
              setPage={setPage}
              onLogout={onLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          title={titles[effectivePage] ?? "Mahara Schools"}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <ErrorBoundary>
            {effectivePage === "dashboard" && <DashboardPage user={user} />}
            {effectivePage === "leads" && <LeadManagementPage />}
            {effectivePage === "campaigns" && <CampaignsPage />}
            {effectivePage === "management" && (
              <ErrorBoundary>
                <ManagementPage user={user} />
              </ErrorBoundary>
            )}
            {effectivePage === "ai-reply" && <AIReplyPage />}
            {effectivePage === "academics" && <AcademicsPage />}
            {effectivePage === "reports" && <ReportsPage />}
            {effectivePage === "tasks" && <TasksPage />}
            {effectivePage === "integrations" && <IntegrationsPage />}
            {effectivePage === "whatsapp-history" && <WhatsAppHistoryPage />}
            {effectivePage === "attendance" && <StaffAttendancePage />}
            {effectivePage === "teacher-performance" && (
              <TeacherPerformancePage />
            )}
            {effectivePage === "activities" && <ClassroomActivitiesPage />}
            {effectivePage === "forms" && <FormBuilderPage />}
            {effectivePage === "blog" && <BlogManagerPage />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
