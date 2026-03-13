import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  BarChart2,
  LogOut,
  GraduationCap,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutTrainer, getTrainerSession } from "@/lib/trainerAuth";

const links = [
  { to: "/trainer", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/trainer/curriculum", label: "Curriculum", icon: Layers },
  { to: "/trainer/problems", label: "Problems", icon: BookOpen },
  { to: "/trainer/students", label: "Students", icon: Users },
  { to: "/trainer/submissions", label: "Submissions", icon: FileText },
  { to: "/trainer/analytics", label: "Analytics", icon: BarChart2 },
];

const TrainerSidebar = () => {
  const navigate = useNavigate();
  const session = getTrainerSession();

  const handleLogout = () => {
    logoutTrainer();
    navigate("/trainer/login");
  };

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card/50">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Trainer Hub</p>
          <p className="text-xs text-muted-foreground">AMYPO</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <div className="mb-2 rounded-lg bg-secondary/40 px-3 py-2">
          <p className="text-xs font-medium text-foreground truncate">{session?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default TrainerSidebar;
