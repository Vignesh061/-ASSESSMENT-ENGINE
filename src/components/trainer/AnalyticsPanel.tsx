import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart2, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { type Topic } from "@/lib/trainerStore";
import { useSubmissions, useProblems, type NormalizedSubmission } from "@/hooks/useBackendData";

const TOPIC_COLORS: Record<Topic, string> = {
  HTML: "#f97316",
  CSS: "#3b82f6",
  JavaScript: "#eab308",
};

const DIFF_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

function last7DaysData(submissions: NormalizedSubmission[]) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = submissions.filter((s) => {
      const sd = new Date(s.submittedAt);
      return sd.toDateString() === d.toDateString();
    }).length;
    result.push({ day: label, count });
  }
  return result;
}

const ChartCard = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
  >
    <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
    {children}
  </motion.div>
);

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  },
};

const AnalyticsPanel = () => {
  const { submissions, loading: subsLoading } = useSubmissions();
  const { problems, loading: probsLoading } = useProblems();

  // Compute topic averages
  const topicAvg = useMemo(() => {
    const grouped: Record<string, number[]> = { HTML: [], CSS: [], JavaScript: [] };
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

  const topicBarData = Object.entries(topicAvg).map(([topic, avg]) => ({ topic, avg }));

  const lineData = useMemo(() => last7DaysData(submissions), [submissions]);

  if (subsLoading || probsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const diffCount: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  submissions.forEach((s) => {
    const p = problems.find((pr) => pr.id === s.problemId);
    if (p) diffCount[p.difficulty] = (diffCount[p.difficulty] || 0) + 1;
  });
  const pieData = Object.entries(diffCount).map(([name, value]) => ({ name, value }));

  const hardestProblems = problems
    .map((p) => {
      const subs = submissions.filter((s) => s.problemId === p.id);
      const avg = subs.length ? Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length) : 0;
      return { ...p, avg, attempts: subs.length };
    })
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Class-wide insights and trends</p>
      </div>

      {submissions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-border/50 bg-card/30 py-20 text-center"
        >
          <BarChart2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No analytics data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Charts and insights will appear here once students start submitting code.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Topic Avg Bar */}
          <ChartCard title="Avg Score by Topic" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicBarData} barSize={44}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="topic" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "Avg Score"]} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {topicBarData.map((entry) => (
                    <Cell key={entry.topic} fill={TOPIC_COLORS[entry.topic as Topic]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Difficulty Pie */}
          <ChartCard title="Submissions by Difficulty" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={DIFF_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>{v}</span>} />
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Daily Submissions Line */}
          <ChartCard title="Daily Submissions (Last 7 Days)" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} formatter={(v) => [v, "Submissions"]} />
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5}
                  dot={{ fill: "#7c3aed", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Hardest Problems */}
          <ChartCard title="Most Difficult Problems" delay={0.3}>
            {hardestProblems.length === 0 ? (
              <p className="text-xs text-muted-foreground">No problem data yet.</p>
            ) : (
              <div className="space-y-3">
                {hardestProblems.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.avg}%`,
                            background: p.avg < 60 ? "#ef4444" : p.avg < 75 ? "#f59e0b" : "#10b981",
                          }}
                        />
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${p.avg < 60 ? "text-red-400" : p.avg < 75 ? "text-yellow-400" : "text-emerald-400"}`}>
                      {p.avg}%
                    </span>
                    <span className="text-xs text-muted-foreground">{p.attempts} tries</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
