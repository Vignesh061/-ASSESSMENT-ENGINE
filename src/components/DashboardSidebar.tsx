import { Link, useLocation } from "react-router-dom";
import {
  Code2,
  LayoutDashboard,
  FileCode,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileCode, label: "Frontend Course", path: "/dashboard?course=frontend" },
  { icon: BarChart3, label: "Progress", path: "/dashboard?view=progress" },
  { icon: Settings, label: "Settings", path: "/dashboard?view=settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const fullPath = location.pathname + location.search;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card/50">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">AMYPO</span>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = fullPath === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard" && !location.search);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
