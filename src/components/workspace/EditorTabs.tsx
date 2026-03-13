import { cn } from "@/lib/utils";

interface EditorTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "html", label: "index.html", color: "text-warning" },
  { id: "css", label: "style.css", color: "text-primary" },
  { id: "js", label: "script.js", color: "text-accent" },
];

const EditorTabs = ({ activeTab, onTabChange }: EditorTabsProps) => {
  return (
    <div className="flex border-b border-border bg-card/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-b-2",
            activeTab === tab.id
              ? "border-primary bg-background text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", tab.color === "text-warning" ? "bg-warning" : tab.color === "text-primary" ? "bg-primary" : "bg-accent")} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default EditorTabs;
