import {
  Building2,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import type { Page } from "../App";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  onLogout: () => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Lead Management", icon: Users },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "management", label: "Management", icon: Building2 },
];

export default function Sidebar({ page, setPage, onLogout }: Props) {
  return (
    <aside
      className="w-[250px] flex-shrink-0 flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg, #4F8F92 0%, #6EA9AA 100%)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              MAHARA SCHOOLS
            </p>
            <p className="text-white/70 text-[10px] uppercase tracking-wider">
              CRM
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-black/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/20 pt-3">
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
