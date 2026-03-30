import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { AuthUser } from "../types";

const LOGO =
  "/assets/mahara_common_logo_png-019d3e56-ac03-771c-a137-577f15f3bff3.png";

interface Props {
  title: string;
  user: AuthUser;
  onMenuClick: () => void;
}

export default function TopBar({ title, user, onMenuClick }: Props) {
  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-border bg-white/80 backdrop-blur-sm flex-shrink-0">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden w-8 h-8"
        onClick={onMenuClick}
        data-ocid="topbar.menu_button"
      >
        <Menu size={18} />
      </Button>

      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <img src={LOGO} alt="Mahara" className="w-7 h-7 object-contain" />
      </div>

      <h1 className="text-sm font-semibold text-foreground flex-1">{title}</h1>

      <div className="flex items-center gap-2">
        <div
          className="hidden sm:flex w-7 h-7 rounded-full items-center justify-center text-[10px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #78C8C8, #6BA3D6)" }}
        >
          {user.name.charAt(0)}
        </div>
        <span className="hidden sm:block text-xs text-muted-foreground max-w-[140px] truncate">
          {user.name}
        </span>
      </div>
    </header>
  );
}
