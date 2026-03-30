import { Button } from "@/components/ui/button";
import {
  Bell,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import ParentCalendar from "../pages/parent/ParentCalendar";
import ParentReportCards from "../pages/parent/ParentReportCards";
import ParentUpdates from "../pages/parent/ParentUpdates";
import ParentWorksheets from "../pages/parent/ParentWorksheets";
import type { AuthUser } from "../types";

type Tab = "report-cards" | "worksheets" | "updates" | "calendar";

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "report-cards",
    label: "Report Cards",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "worksheets",
    label: "Daily Worksheets",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: "updates",
    label: "School Updates",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: "calendar",
    label: "School Calendar",
    icon: <Calendar className="w-4 h-4" />,
  },
];

export default function ParentPortal({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("report-cards");

  return (
    <div className="min-h-screen" style={{ background: "#F0F7F7" }}>
      <header
        style={{
          background: "linear-gradient(90deg, #4F8F92 0%, #64A0A3 100%)",
        }}
        className="sticky top-0 z-40 shadow-md"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                MAHARA SCHOOLS
              </h1>
              <p className="text-white/70 text-xs">Parent Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
      </main>

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
