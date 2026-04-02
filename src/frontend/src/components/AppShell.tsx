import { useState } from "react";
import type { Page } from "../App";
import AIReplyPage from "../pages/AIReplyPage";
import AcademicsPage from "../pages/AcademicsPage";
import CampaignsPage from "../pages/CampaignsPage";
import DashboardPage from "../pages/DashboardPage";
import IntegrationsPage from "../pages/IntegrationsPage";
import LeadManagementPage from "../pages/LeadManagementPage";
import ManagementPage from "../pages/ManagementPage";
import ReportsPage from "../pages/ReportsPage";
import TasksPage from "../pages/TasksPage";
import type { AuthUser } from "../types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

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
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          user={user}
          page={page}
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
              page={page}
              setPage={setPage}
              onLogout={onLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          title={titles[page]}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          {page === "dashboard" && <DashboardPage user={user} />}
          {page === "leads" && <LeadManagementPage />}
          {page === "campaigns" && <CampaignsPage />}
          {page === "management" && <ManagementPage user={user} />}
          {page === "ai-reply" && <AIReplyPage />}
          {page === "academics" && <AcademicsPage />}
          {page === "reports" && <ReportsPage />}
          {page === "tasks" && <TasksPage />}
          {page === "integrations" && <IntegrationsPage />}
        </main>
      </div>
    </div>
  );
}
