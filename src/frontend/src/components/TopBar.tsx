import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu } from "lucide-react";
import type { AuthUser } from "../types";

interface Props {
  title: string;
  user: AuthUser;
  onMenuClick?: () => void;
}

export default function TopBar({ title, user, onMenuClick }: Props) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
      {/* Hamburger - mobile only */}
      <button
        type="button"
        className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
        onClick={onMenuClick}
        data-ocid="topbar.menu.button"
      >
        <Menu size={20} className="text-muted-foreground" />
      </button>

      <h1 className="text-foreground font-semibold text-base flex-shrink-0">
        {title}
      </h1>

      <div className="flex-1 max-w-xs mx-auto hidden sm:block">
        <input
          type="text"
          placeholder="Search leads, campaigns..."
          className="w-full text-sm px-3 py-1.5 rounded-full border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          data-ocid="topbar.search_input"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          className="relative p-1.5 rounded-full hover:bg-muted transition-colors"
          data-ocid="topbar.bell.button"
        >
          <Bell size={18} className="text-muted-foreground" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild data-ocid="topbar.user.dropdown_menu">
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-lg transition-colors"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  className="text-[11px] font-semibold"
                  style={{ background: "#4F8F92", color: "white" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{user.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="text-destructive"
              data-ocid="topbar.logout.button"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
