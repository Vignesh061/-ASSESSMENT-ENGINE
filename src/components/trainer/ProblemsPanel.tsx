import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProblems, hybridDeleteProblem, type NormalizedProblem } from "@/hooks/useBackendData";
import ProblemForm from "./ProblemForm";

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Hard: "text-red-400 bg-red-400/10 border-red-400/30",
};

const TOPIC_COLOR: Record<string, string> = {
  HTML: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  CSS: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  JavaScript: "text-yellow-300 bg-yellow-300/10 border-yellow-300/30",
};

const ProblemsPanel = () => {
  const { problems, loading, refresh } = useProblems();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<NormalizedProblem | null | "new">(null);

  const filtered = useMemo(
    () =>
      problems.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.topic.toLowerCase().includes(search.toLowerCase())
      ),
    [problems, search]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this problem?")) return;
    await hybridDeleteProblem(id);
    refresh();
  };

  const handleSaved = () => {
    refresh();
    setEditing(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Problems</h2>
          <p className="text-sm text-muted-foreground">{problems.length} problems in the bank</p>
        </div>
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Problem
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-border/50 bg-secondary/30"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Topic</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/30 bg-card/30 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", TOPIC_COLOR[p.topic])}>
                      {p.topic}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", DIFF_COLOR[p.difficulty])}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)} className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No problems found.</div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {editing !== null && (
          <ProblemForm
            initial={editing === "new" ? undefined : editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProblemsPanel;
