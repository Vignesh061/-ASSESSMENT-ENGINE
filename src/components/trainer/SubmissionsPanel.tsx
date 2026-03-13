import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Clock, Code2, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { useSubmissions, useStudents, useProblems, type NormalizedSubmission } from "@/hooks/useBackendData";

const TOPIC_COLOR: Record<string, string> = {
  HTML: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  CSS: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  JavaScript: "text-yellow-300 bg-yellow-300/10 border-yellow-300/30",
};

const CodeModal = ({
  submission,
  studentName,
  problemTitle,
  onClose,
}: {
  submission: NormalizedSubmission;
  studentName: string;
  problemTitle: string;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<"html" | "css" | "js">("html");
  const code = tab === "html" ? submission.htmlCode : tab === "css" ? submission.cssCode : submission.jsCode;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-3xl rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
          <div>
            <p className="font-semibold text-foreground">{problemTitle}</p>
            <p className="text-xs text-muted-foreground">Submitted by {studentName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-border/50 bg-secondary/20 px-3 pt-1.5">
          {(["html", "css", "js"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-t-md px-4 py-1.5 text-xs font-medium transition-colors",
                tab === t ? "bg-card text-foreground border-x border-t border-border/50" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="h-80">
          <Editor
            theme="vs-dark"
            language={tab === "js" ? "javascript" : tab}
            value={code}
            options={{ readOnly: true, fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 10 } }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border/50 px-5 py-3 bg-secondary/10">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className={cn("font-semibold text-base", submission.score >= 80 ? "text-emerald-400" : submission.score >= 60 ? "text-yellow-400" : "text-red-400")}>
              {submission.score}%
            </span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{submission.timeSpent} min</span>
          </div>
          <span className={cn("flex items-center gap-1 text-xs font-medium", submission.isCorrect ? "text-emerald-400" : "text-red-400")}>
            {submission.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {submission.isCorrect ? "Passed" : "Failed"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SubmissionsPanel = () => {
  const { submissions: rawSubmissions, loading: subsLoading } = useSubmissions();
  const { students } = useStudents();
  const { problems } = useProblems();
  const [viewing, setViewing] = useState<NormalizedSubmission | null>(null);
  const submissions = [...rawSubmissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  if (subsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const rows = submissions.map((s) => ({
    ...s,
    student: students.find((st) => st.id === s.studentId),
    problem: problems.find((p) => p.id === s.problemId),
  })).filter((r) => r.student && r.problem);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Submissions</h2>
        <p className="text-sm text-muted-foreground">{submissions.length} total submissions — click any row to review code</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Problem</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Topic</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                onClick={() => setViewing(s)}
                className="cursor-pointer border-b border-border/20 bg-card/20 hover:bg-secondary/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">
                      {s.student!.avatar}
                    </div>
                    <span className="text-foreground">{s.student!.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground max-w-[180px] truncate">{s.problem!.title}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", TOPIC_COLOR[s.problem!.topic])}>
                    {s.problem!.topic}
                  </span>
                </td>
                <td className={cn("px-4 py-3 text-center font-semibold", s.score >= 80 ? "text-emerald-400" : s.score >= 60 ? "text-yellow-400" : "text-red-400")}>
                  {s.score}%
                </td>
                <td className="px-4 py-3 text-center">
                  {s.isCorrect
                    ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                    : <XCircle className="mx-auto h-4 w-4 text-red-400" />}
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {new Date(s.submittedAt).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {viewing && (
          <CodeModal
            submission={viewing}
            studentName={students.find((s) => s.id === viewing.studentId)?.name ?? ""}
            problemTitle={problems.find((p) => p.id === viewing.problemId)?.title ?? ""}
            onClose={() => setViewing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubmissionsPanel;
