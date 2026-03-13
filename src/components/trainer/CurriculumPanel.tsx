import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Upload,
  ImageIcon,
  X,
  Save,
  CheckCircle2,
  Code2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLessonContent } from "@/lib/trainerStore";
import { hybridSaveLessonContent, hybridClearLessonContent } from "@/hooks/useBackendData";
import { courses } from "@/data/courses";

// ─── Lesson Edit Modal ────────────────────────────────────────────────────────
interface EditModalProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

const EditModal = ({ lessonId, lessonTitle, onClose }: EditModalProps) => {
  const existing = getLessonContent(lessonId);
  const [task, setTask] = useState(existing?.task ?? "");
  const [imageUrl, setImageUrl] = useState(existing?.referenceImageUrl ?? "");
  const [starterHtml, setStarterHtml] = useState(existing?.starterHtml ?? "");
  const [starterCss, setStarterCss] = useState(existing?.starterCss ?? "");
  const [starterJs, setStarterJs] = useState(existing?.starterJs ?? "");
  const [codeTab, setCodeTab] = useState<"html" | "css" | "js">("html");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Handle image upload → convert to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await hybridSaveLessonContent({
        lessonId,
        task,
        referenceImageUrl: imageUrl,
        starterHtml,
        starterCss,
        starterJs,
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Remove trainer content for this lesson?")) return;
    await hybridClearLessonContent(lessonId);
    setTask("");
    setImageUrl("");
    setStarterHtml("");
    setStarterCss("");
    setStarterJs("");
  };

  const currentCode =
    codeTab === "html" ? starterHtml : codeTab === "css" ? starterCss : starterJs;
  const setCode = (val: string | undefined) => {
    if (val === undefined) return;
    if (codeTab === "html") setStarterHtml(val);
    else if (codeTab === "css") setStarterCss(val);
    else setStarterJs(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border/50 bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Editing Lesson</p>
            <h2 className="font-bold text-foreground">{lessonTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleClear} className="text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10">
              Clear Content
            </Button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Task / Question */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Task / Question for Students
            </label>
            <textarea
              rows={5}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Describe what the student needs to build for this lesson. Be specific about requirements..."
              className="w-full resize-none rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Reference Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              Reference Image (optional)
            </label>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-secondary/20">
                <img
                  src={imageUrl}
                  alt="Reference"
                  className="max-h-64 w-full object-contain p-2"
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-destructive shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Click to upload reference image</span>
                <span className="text-xs">PNG, JPG, GIF, WebP accepted</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imageUrl && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Upload className="h-3 w-3" />
                Replace image
              </button>
            )}
          </div>

          {/* Starter Code */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              Starter Code for Students
            </label>
            <div className="flex gap-1 rounded-t-lg border-x border-t border-border/50 bg-secondary/30 px-2 pt-2">
              {(["html", "css", "js"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCodeTab(t)}
                  className={cn(
                    "rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors",
                    codeTab === t
                      ? "bg-card text-foreground border-x border-t border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="h-48 overflow-hidden rounded-b-lg border border-border/50">
              <Editor
                theme="vs-dark"
                language={codeTab === "js" ? "javascript" : codeTab}
                value={currentCode}
                onChange={setCode}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 8 },
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Changes are reflected immediately for all students.
          </p>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Curriculum Panel ────────────────────────────────────────────────────
const CurriculumPanel = () => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>("Level 1 – Web Basics");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);

  const course = courses[0]; // Frontend Web Development (single course)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Curriculum Manager</h2>
        <p className="text-sm text-muted-foreground">
          {course.icon} {course.title} — click any lesson to set its task, reference image, and starter code
        </p>
      </div>

      {/* Level accordions */}
      <div className="space-y-3">
        {course.levels.map((level) => {
          const isOpen = expandedLevel === level.name;
          // Count how many lessons in this level have trainer content
          const overriddenCount = level.lessons.filter(
            (l) => getLessonContent(l.id) !== null
          ).length;

          return (
            <div key={level.name} className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
              {/* Level header */}
              <button
                onClick={() => setExpandedLevel(isOpen ? null : level.name)}
                className="flex w-full items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-foreground text-sm">{level.name}</span>
                  {overriddenCount > 0 && (
                    <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-xs text-primary font-medium">
                      {overriddenCount} customized
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{level.lessons.length} lessons</span>
              </button>

              {/* Lessons list */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-border/30 px-4 pb-4 pt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {level.lessons.map((lesson) => {
                        const hasContent = getLessonContent(lesson.id) !== null;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setEditing({ id: lesson.id, title: lesson.title })}
                            className={cn(
                              "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all group hover:border-primary/40 hover:bg-primary/5",
                              hasContent
                                ? "border-primary/30 bg-primary/5"
                                : "border-border/40 bg-background/30"
                            )}
                          >
                            <div className={cn(
                              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                              hasContent ? "bg-primary/20" : "bg-secondary"
                            )}>
                              {hasContent
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                : <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className={cn(
                                "text-xs font-medium leading-snug",
                                hasContent ? "text-primary" : "text-foreground group-hover:text-primary"
                              )}>
                                {lesson.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {hasContent ? "✓ Content added — click to edit" : "Click to add task & code"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <EditModal
            lessonId={editing.id}
            lessonTitle={editing.title}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurriculumPanel;
