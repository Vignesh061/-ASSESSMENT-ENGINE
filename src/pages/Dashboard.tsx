import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Sparkles, FolderCode, GraduationCap, Zap, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardSidebar from "@/components/DashboardSidebar";
import { courses } from "@/data/courses";
import { seedIfNeeded, type Topic } from "@/lib/trainerStore";
import { useProblems } from "@/hooks/useBackendData";
import { cn } from "@/lib/utils";

// Seed trainer data if not present
seedIfNeeded();

const TOPIC_COLOR: Record<Topic, string> = {
  HTML: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  CSS: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  JavaScript: "text-yellow-300 bg-yellow-300/10 border-yellow-300/30",
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Hard: "text-red-400 bg-red-400/10 border-red-400/30",
};

const TOPICS: Topic[] = ["HTML", "CSS", "JavaScript"];

const TrainerProblemsSection = ({ navigate }: { navigate: (path: string) => void }) => {
  const [activeTopic, setActiveTopic] = useState<Topic>("HTML");
  const { problems, loading } = useProblems();
  const filtered = problems.filter((p) => p.topic === activeTopic);

  if (problems.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
          <GraduationCap className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Trainer Problems</h2>
          <p className="text-xs text-muted-foreground">Problems added by your trainer — practice here</p>
        </div>
      </div>

      {/* Topic filter tabs */}
      <div className="mb-4 flex gap-2">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTopic(t)}
            className={cn(
              "rounded-lg border px-4 py-1.5 text-xs font-medium transition-all duration-200",
              activeTopic === t
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/30 bg-card/30 py-10 text-center text-sm text-muted-foreground">
          No {activeTopic} problems added by the trainer yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group cursor-pointer rounded-xl border border-border/50 bg-card/50 p-5 card-hover backdrop-blur-sm"
              onClick={() => navigate(`/workspace/${problem.id}`)}
            >
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", TOPIC_COLOR[problem.topic])}>
                  <Tag className="h-2.5 w-2.5" />
                  {problem.topic}
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", DIFF_COLOR[problem.difficulty])}>
                  <Zap className="h-2.5 w-2.5" />
                  {problem.difficulty}
                </span>
              </div>

              <div className="mb-1.5 flex items-start gap-1.5">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                  {problem.title}
                </span>
              </div>
              <p className="mb-4 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                {problem.description}
              </p>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
              >
                Start
                <ChevronRight className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseFilter = searchParams.get("course");

  const filteredCourses = courseFilter
    ? courses.filter((c) => c.id === courseFilter)
    : courses;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center border-b border-border/50 px-8 bg-card/30 backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-foreground">
            {courseFilter
              ? courses.find((c) => c.id === courseFilter)?.title + " Course"
              : "Dashboard"}
          </h1>
        </header>

        <div className="p-8">
          {/* Stats */}
          {!courseFilter && (
            <div className="mb-10 flex justify-center">
              {courses.map((course, idx) => {
                const avg = Math.round(
                  course.levels.reduce((s, l) => s + l.progress, 0) / course.levels.length
                );
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="w-full max-w-md rounded-2xl border border-border/50 bg-card/50 p-6 card-hover backdrop-blur-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-2xl">{course.icon}</span>
                      <span className="text-sm font-bold bg-gradient-to-r from-orange-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
                        {avg}%
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.levels.length} levels •{" "}
                      {course.levels.reduce((s, l) => s + l.lessons.length, 0)} lessons
                    </p>
                    <Progress
                      value={avg}
                      className="mt-3 h-2 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:via-yellow-400 [&>div]:to-blue-500"
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Trainer Problems (always shown on main dashboard) */}
          {!courseFilter && <TrainerProblemsSection navigate={navigate} />}

          {/* Syllabus Course sections */}
          {filteredCourses.map((course) => (
            <div key={course.id} className="mb-10">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground"
              >
                <span>{course.icon}</span> {course.title}
              </motion.h2>

              {course.levels.map((level) => (
                <div key={level.name} className="mb-8">
                  <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                      {level.name}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {level.project && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground border border-border/50 rounded-full px-3 py-1 bg-secondary/30">
                          <FolderCode className="h-3 w-3" />
                          Project: {level.project}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{level.progress}% complete</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {level.lessons.map((lesson, i) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
                        className="group cursor-pointer rounded-xl border border-border/50 bg-card/50 p-5 card-hover backdrop-blur-sm"
                        onClick={() => navigate(`/workspace/${lesson.id}`)}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1.5 px-3 text-xs text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
                        >
                          {lesson.completed ? (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Review
                            </>
                          ) : (
                            <>
                              Start
                              <ChevronRight className="h-3 w-3" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
