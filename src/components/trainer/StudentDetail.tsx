import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Topic } from "@/lib/trainerStore";
import { useSubmissions, useProblems, type NormalizedStudent } from "@/hooks/useBackendData";

interface Props {
  student: NormalizedStudent;
  onBack: () => void;
}

const TOPIC_COLORS: Record<string, string> = {
  HTML: "#f97316",
  CSS: "#3b82f6",
  JavaScript: "#eab308",
};

const StudentDetail = ({ student, onBack }: Props) => {
  const { submissions: allSubmissions } = useSubmissions();
  const { problems } = useProblems();
  const submissions = useMemo(() => allSubmissions.filter((s) => s.studentId === student.id), [allSubmissions, student.id]);

  // Compute topic scores
  const topicScores = useMemo(() => {
    const grouped: Record<Topic, number[]> = { HTML: [], CSS: [], JavaScript: [] };
    submissions.forEach((s) => {
      const p = problems.find((pr) => pr.id === s.problemId);
      if (p && grouped[p.topic]) grouped[p.topic].push(s.score);
    });
    return {
      HTML: grouped.HTML.length ? Math.round(grouped.HTML.reduce((a, b) => a + b, 0) / grouped.HTML.length) : 0,
      CSS: grouped.CSS.length ? Math.round(grouped.CSS.reduce((a, b) => a + b, 0) / grouped.CSS.length) : 0,
      JavaScript: grouped.JavaScript.length ? Math.round(grouped.JavaScript.reduce((a, b) => a + b, 0) / grouped.JavaScript.length) : 0,
    };
  }, [submissions, problems]);

  const weakTopic = useMemo(() => {
    let weak: Topic | null = null;
    let weakScore = Infinity;
    (Object.keys(topicScores) as Topic[]).forEach((t) => {
      if (topicScores[t] > 0 && topicScores[t] < weakScore) {
        weakScore = topicScores[t];
        weak = t;
      }
    });
    return weak;
  }, [topicScores]);

  const chartData = Object.entries(topicScores).map(([topic, avg]) => ({ topic, avg }));

  const submissionsWithProblem = submissions
    .map((s) => ({
      ...s,
      problem: problems.find((p) => p.id === s.problemId),
    }))
    .filter((s) => s.problem)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Students
        </Button>
      </div>

      {/* Student Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-5 rounded-2xl border border-border/50 bg-card/50 p-5"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-lg">
          {student.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
        {weakTopic && (
          <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-xs text-yellow-300 font-medium">Weak Topic</p>
              <p className="text-sm font-bold text-yellow-400">{weakTopic}</p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topic Score Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-5"
        >
          <h3 className="mb-4 font-semibold text-foreground">Score by Topic</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="topic" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                formatter={(v) => [`${v}%`, "Avg Score"]}
              />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.topic} fill={TOPIC_COLORS[entry.topic] ?? "#7c3aed"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-4 content-start"
        >
          {[
            { label: "Submissions", value: submissions.length, color: "from-blue-500 to-cyan-500" },
            { label: "Solved", value: submissions.filter((s) => s.isCorrect).length, color: "from-emerald-500 to-teal-500" },
            { label: "Failed", value: submissions.filter((s) => !s.isCorrect).length, color: "from-red-500 to-pink-500" },
            { label: "Avg Time", value: `${Math.round(submissions.reduce((a, b) => a + b.timeSpent, 0) / (submissions.length || 1))} min`, color: "from-purple-500 to-pink-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card/50 p-4">
              <p className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Submission History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border/50"
      >
        <div className="border-b border-border/50 bg-secondary/30 px-4 py-3">
          <h3 className="font-semibold text-foreground">Submission History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 bg-secondary/10">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Problem</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Score</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissionsWithProblem.map((s) => (
              <tr key={s.id} className="border-b border-border/20 bg-card/20 hover:bg-secondary/10 transition-colors">
                <td className="px-4 py-3 text-foreground">{s.problem!.title}</td>
                <td className={cn("px-4 py-3 text-center font-semibold", s.score >= 80 ? "text-emerald-400" : s.score >= 60 ? "text-yellow-400" : "text-red-400")}>
                  {s.score}%
                </td>
                <td className="px-4 py-3 text-center">
                  {s.isCorrect
                    ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                    : <XCircle className="mx-auto h-4 w-4 text-red-400" />}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{s.timeSpent}m</span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {new Date(s.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissionsWithProblem.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">No submissions yet.</div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentDetail;
