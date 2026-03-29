import type { Page } from "../App";
import CampaignsPage from "../pages/CampaignsPage";
import DashboardPage from "../pages/DashboardPage";
import LeadManagementPage from "../pages/LeadManagementPage";
import ManagementPage from "../pages/ManagementPage";
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
  const titles: Record<Page, string> = {
    dashboard: "Dashboard",
    leads: "Lead Management",
    campaigns: "Campaigns",
    management: "Management",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar page={page} setPage={setPage} onLogout={onLogout} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar title={titles[page]} user={user} />
        <main className="flex-1 overflow-auto p-6 bg-background">
          {page === "dashboard" && <DashboardPage user={user} />}
          {page === "leads" && <LeadManagementPage />}
          {page === "campaigns" && <CampaignsPage />}
          {page === "management" && <ManagementPage />}
        </main>
      </div>
    </div>
  );
}
