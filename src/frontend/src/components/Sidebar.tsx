import {
  BarChart2,
  BookOpen,
  Bot,
  Building2,
  CheckSquare,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users,
} from "lucide-react";
import type { Page } from "../App";
import type { AuthUser } from "../types";

const LOGO =
  "/assets/mahara_common_logo_png-019d3e56-ac03-771c-a137-577f15f3bff3.png";

interface Props {
  user: AuthUser;
  page: Page;
  setPage: (p: Page) => void;
  onLogout: () => void;
  onClose?: () => void;
}

const allNavItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
  roles: AuthUser["role"][];
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["Founder", "Admin", "CentreHead", "Agent"],
  },
  {
    id: "leads",
    label: "Lead Management",
    icon: Users,
    roles: ["Founder", "Admin", "Agent"],
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Megaphone,
    roles: ["Founder", "Admin", "Agent"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["Founder", "Admin", "CentreHead", "Agent"],
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    roles: ["Founder", "Admin", "CentreHead", "Agent"],
  },
  {
    id: "ai-reply",
    label: "AI Suggestions",
    icon: Bot,
    roles: ["Founder", "Admin", "Agent"],
  },
  {
    id: "academics",
    label: "Academics",
    icon: BookOpen,
    roles: ["Founder", "Admin", "CentreHead"],
  },
  {
    id: "management",
    label: "Management",
    icon: Building2,
    roles: ["Founder", "Admin", "CentreHead"],
  },
];

const ROLE_LABELS: Record<string, string> = {
  Founder: "Founder",
  Admin: "Admin",
  CentreHead: "Centre Head",
  Agent: "Admissions Agent",
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

  function handleNav(id: Page) {
    setPage(id);
    onClose?.();
  }

  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col h-full"
      style={{
        background:
          "linear-gradient(180deg, #3A8A8D 0%, #4FA3A6 50%, #5C8DB0 100%)",
      }}
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
            <p className="text-white font-bold text-sm leading-tight">
              Mahara Schools
            </p>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">
              CRM Portal
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5 border-b border-white/10">
        <p className="text-white/50 text-[9px] uppercase tracking-widest">
          {ROLE_LABELS[user.role] ?? user.role}
        </p>
        <p className="text-white text-xs font-medium truncate mt-0.5">
          {user.name}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="flex-shrink-0" size={17} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Branches quick info */}
      <div className="px-4 pb-3 border-t border-white/10 pt-3">
        <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1.5">
          Branches
        </p>
        <p className="text-white/70 text-[10px] leading-relaxed">
          📍 Kondapur, Hyderabad
        </p>
        <p className="text-white/70 text-[10px] leading-relaxed">
          📍 Bachupally, Hyderabad
        </p>
      </div>

      {/* Logout */}
      <div className="px-2.5 pb-4 border-t border-white/20 pt-2">
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
