import {
  BarChart2,
  BookOpen,
  Bot,
  Building2,
  CalendarCheck,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  Newspaper,
  Plug,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Page } from "../App";
import type { AuthUser } from "../types";

const LOGO =
  "/assets/mahara_common_logo_png-019d4d86-52fa-7582-a628-0e0c9b0a7c23.png";

interface Props {
  user: AuthUser;
  page: Page;
  setPage: (p: Page) => void;
  onLogout: () => void;
  onClose?: () => void;
}

type NavRole = AuthUser["role"];

const allNavItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
  roles: NavRole[];
  section?: string;
}[] = [
  // Main
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["Founder", "Admin", "CentreHead", "Agent"],
    section: "main",
  },
  {
    id: "leads",
    label: "Lead Management",
    icon: Users,
    roles: ["Founder", "Admin", "Agent", "Counselor"],
    section: "main",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Megaphone,
    roles: ["Founder", "Admin", "Agent", "Counselor"],
    section: "main",
  },
  {
    id: "activities",
    label: "Class Activities",
    icon: Image,
    roles: ["Founder", "Admin", "CentreHead", "Agent", "Counselor"],
    section: "academic",
  },
  {
    id: "academics",
    label: "Academics",
    icon: BookOpen,
    roles: ["Founder", "Admin", "CentreHead"],
    section: "academic",
  },
  {
    id: "forms",
    label: "Form Builder",
    icon: ClipboardList,
    roles: ["Founder", "Admin"],
    section: "academic",
  },
  {
    id: "blog",
    label: "Blog Manager",
    icon: Newspaper,
    roles: ["Founder", "Admin"],
    section: "academic",
  },
  // People
  {
    id: "attendance",
    label: "Staff Attendance",
    icon: CalendarCheck,
    roles: ["Founder", "Admin", "CentreHead"],
    section: "people",
  },
  {
    id: "teacher-performance",
    label: "Teacher Performance",
    icon: TrendingUp,
    roles: ["Founder", "Admin", "CentreHead"],
    section: "people",
  },
  {
    id: "management",
    label: "Management",
    icon: Building2,
    roles: ["Founder", "Admin", "CentreHead", "Counselor"],
    section: "people",
  },
  // Analytics
  {
    id: "reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["Founder", "Admin", "CentreHead", "Agent"],
    section: "analytics",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    roles: ["Founder", "Admin", "CentreHead", "Agent", "Counselor"],
    section: "analytics",
  },
  {
    id: "ai-reply",
    label: "AI Suggestions",
    icon: Bot,
    roles: ["Founder", "Admin", "Agent", "Counselor"],
    section: "analytics",
  },
  // Messaging
  {
    id: "whatsapp-history",
    label: "WhatsApp History",
    icon: MessageCircle,
    roles: ["Founder", "Admin"],
    section: "messaging",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    roles: ["Founder", "Admin"],
    section: "messaging",
  },
];

const SECTION_LABELS: Record<string, string> = {
  main: "CRM",
  academic: "Academic",
  people: "People",
  analytics: "Analytics",
  messaging: "Messaging",
};

const ROLE_LABELS: Record<string, string> = {
  Founder: "Founder",
  Admin: "Admin",
  CentreHead: "Centre Head",
  Agent: "Admissions Agent",
  Counselor: "Admissions Counselor",
  Teacher: "Teacher",
  Parent: "Parent",
};

export default function Sidebar({
  user,
  page,
  setPage,
  onLogout,
  onClose,
}: Props) {
  const navItems = allNavItems.filter((item) => item.roles.includes(user.role));

  // Group by section
  const sections = ["main", "academic", "people", "analytics", "messaging"];
  const grouped: Record<string, typeof navItems> = {};
  for (const s of sections) {
    grouped[s] = navItems.filter((i) => i.section === s);
  }

  function handleNav(id: Page) {
    setPage(id);
    onClose?.();
  }

  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col h-full"
      style={{ background: "oklch(var(--sidebar))" }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm p-1">
            <img
              src={LOGO}
              alt="Mahara"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p
              className="text-white text-sm leading-tight"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
              }}
            >
              Mahara Schools
            </p>
            <p
              className="text-white/60 text-[10px] uppercase tracking-wider"
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              CRM Portal
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5 border-b border-white/10">
        <p
          className="text-white/50 text-[9px] uppercase tracking-widest"
          style={{
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            fontWeight: 800,
          }}
        >
          {ROLE_LABELS[user.role] ?? user.role}
        </p>
        <p
          className="text-white text-xs font-medium truncate mt-0.5"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {user.name}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {sections.map((section) => {
          const items = grouped[section];
          if (!items || items.length === 0) return null;
          return (
            <div key={section} className="mb-3">
              <p
                className="text-white/40 text-[8px] uppercase tracking-widest px-3 mb-1"
                style={{
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  fontWeight: 800,
                }}
              >
                {SECTION_LABELS[section]}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      data-ocid={`nav.${item.id}.link`}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        active
                          ? "bg-white/25 text-white shadow-sm"
                          : "text-white/75 hover:bg-white/15 hover:text-white"
                      }`}
                      style={{
                        fontFamily:
                          "'Plus Jakarta Sans', system-ui, sans-serif",
                      }}
                    >
                      <Icon className="flex-shrink-0" size={17} />
                      <span className="flex-1 text-left text-xs font-medium">
                        {item.label}
                      </span>
                      {active && (
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Branches quick info */}
      <div className="px-4 pb-3 border-t border-white/10 pt-3">
        <p
          className="text-white/40 text-[9px] uppercase tracking-widest mb-1.5"
          style={{
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            fontWeight: 800,
          }}
        >
          Branches
        </p>
        <p
          className="text-white/70 text-[10px] leading-relaxed"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          📍 Kondapur, Hyderabad
        </p>
        <p
          className="text-white/70 text-[10px] leading-relaxed"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          📍 Bachupally, Hyderabad
        </p>
      </div>

      {/* Logout */}
      <div className="px-2.5 pb-4 border-t border-white/20 pt-2">
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:bg-white/15 hover:text-white transition-all"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
