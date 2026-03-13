import { motion } from "framer-motion";
import { Users, BookOpen, Send, TrendingUp, Trophy, AlertCircle, UserPlus, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStudents, useProblems, useSubmissions } from "@/hooks/useBackendData";

const StatCard = ({
  icon: Icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
  >
    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </motion.div>
);

const TOPIC_COLORS: Record<string, string> = {
  HTML: "#f97316",
  CSS: "#3b82f6",
  JavaScript: "#eab308",
};

const OverviewPanel = () => {
  const { problems } = useProblems();
  const { students, loading: studentsLoading } = useStudents();
  const { submissions, loading: subsLoading } = useSubmissions();

  // Compute topic averages from loaded data
  const topicAvg: Record<string, number> = { HTML: 0, CSS: 0, JavaScript: 0 };
  const grouped: Record<string, number[]> = { HTML: [], CSS: [], JavaScript: [] };
  submissions.forEach((s) => {
    const p = problems.find((pr) => pr.id === s.problemId);
    if (p && grouped[p.topic]) grouped[p.topic].push(s.score);
  });
  Object.keys(grouped).forEach((t) => {
    topicAvg[t] = grouped[t].length ? Math.round(grouped[t].reduce((a, b) => a + b, 0) / grouped[t].length) : 0;
  });

  const chartData = Object.entries(topicAvg).map(([topic, avg]) => ({
    topic,
    avg,
    fill: TOPIC_COLORS[topic],
  }));

  const correctCount = submissions.filter((s) => s.isCorrect).length;
  const classAvg =
    submissions.length
      ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
      : 0;

  // Compute student averages
  const topStudents = [...students]
    .map((s) => {
      const subs = submissions.filter((sub) => sub.studentId === s.id);
      const avg = subs.length ? Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length) : 0;
      return { ...s, avg };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);

  const weakTopics = Object.entries(topicAvg)
    .filter(([, avg]) => avg > 0 && avg < 70)
    .sort((a, b) => a[1] - b[1]);

  const loading = studentsLoading || subsLoading;
  const hasData = students.length > 0 || submissions.length > 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">Class performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users}       label="Students"       value={students.length}            gradient="from-blue-500 to-cyan-500"    delay={0}    />
        <StatCard icon={BookOpen}    label="Problems"       value={problems.length}            gradient="from-orange-500 to-red-500"   delay={0.08} />
        <StatCard icon={Send}        label="Submissions"    value={submissions.length}         gradient="from-purple-500 to-pink-500"  delay={0.16} />
        <StatCard icon={TrendingUp}  label="Class Avg Score" value={classAvg ? `${classAvg}%` : "—"} gradient="from-emerald-500 to-teal-500" delay={0.24} />
      </div>

      {/* Empty state when no real data yet */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-dashed border-border/50 bg-card/30 py-16 text-center"
        >
          <UserPlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold text-foreground">No student data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Student submissions and performance data will appear here once students start practising.
          </p>
        </motion.div>
      )}

      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Topic Avg Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
          >
            <h3 className="mb-1 font-semibold text-foreground">Avg Score by Topic</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {correctCount} of {submissions.length} submissions passed
            </p>
            <ResponsiveContainer width="100%" height={200}>
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
                    <rect key={entry.topic} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Students + Weak Topics */}
          <div className="space-y-4">
            {/* Top Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <h3 className="font-semibold text-foreground">Top Students</h3>
              </div>
              {topStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No students yet.</p>
              ) : (
                <div className="space-y-2">
                  {topStudents.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                        {s.avatar}
                      </div>
                      <span className="flex-1 text-sm text-foreground">{s.name}</span>
                      <span className="text-sm font-semibold text-emerald-400">{s.avg}%</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Weak Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <h3 className="font-semibold text-foreground">Topics Needing Focus</h3>
              </div>
              {weakTopics.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No weak topics identified yet — more submissions needed.
                </p>
              ) : (
                <div className="space-y-2">
                  {weakTopics.map(([topic, avg]) => (
                    <div key={topic} className="flex items-center justify-between rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-3 py-2">
                      <span className="text-sm font-medium text-yellow-400">{topic}</span>
                      <span className="text-xs text-yellow-300">{avg}% avg</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewPanel;
