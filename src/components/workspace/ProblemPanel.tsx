import { useMemo, useState } from "react";
import { FileText, Target, Tag, Zap, ImageIcon, Maximize2, X } from "lucide-react";
import { getProblems, getLessonContent } from "@/lib/trainerStore";
import { cn } from "@/lib/utils";

interface ProblemPanelProps {
  lessonTitle: string;
  lessonId?: string;
}

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

/** Full-screen overlay for viewing the reference image */
const ImageFullscreen = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex h-10 shrink-0 items-center justify-between bg-card/90 px-4 border-b border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          Reference Image — Fullscreen
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/20 hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Close (Esc)
        </button>
      </div>
      {/* Image */}
      <div
        className="flex flex-1 items-center justify-center p-6 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Reference (fullscreen)"
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  );
};

const ProblemPanel = ({ lessonTitle, lessonId }: ProblemPanelProps) => {
  const [imgFullscreen, setImgFullscreen] = useState(false);

  // Close on Escape
  useMemo(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImgFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 1. Check for trainer problem bank item (standalone problems)
  const trainerProblem = useMemo(() => {
    if (!lessonId) return null;
    return getProblems().find((p) => p.id === lessonId) ?? null;
  }, [lessonId]);

  // 2. Check for trainer syllabus lesson override (curriculum content)
  const lessonContent = useMemo(() => {
    if (!lessonId) return null;
    return getLessonContent(lessonId);
  }, [lessonId]);

  // ── Standalone trainer problem ─────────────────────────────────────────
  if (trainerProblem) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <h3 className="font-semibold text-sm text-foreground leading-snug">
            {trainerProblem.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", TOPIC_COLOR[trainerProblem.topic])}>
            <Tag className="h-2.5 w-2.5" />{trainerProblem.topic}
          </span>
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", DIFF_COLOR[trainerProblem.difficulty])}>
            <Zap className="h-2.5 w-2.5" />{trainerProblem.difficulty}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{trainerProblem.description}</p>

        {trainerProblem.expectedOutput && (
          <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Target className="h-3 w-3" />Expected Output
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{trainerProblem.expectedOutput}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Syllabus lesson with trainer override ──────────────────────────────
  if (lessonContent && (lessonContent.task || lessonContent.referenceImageUrl)) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">{lessonTitle}</h3>
        </div>

        {/* Trainer task description */}
        {lessonContent.task && (
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="whitespace-pre-wrap">{lessonContent.task}</p>
          </div>
        )}

        {/* Reference image with maximize button */}
        {lessonContent.referenceImageUrl && (
          <>
            {imgFullscreen && (
              <ImageFullscreen
                src={lessonContent.referenceImageUrl}
                onClose={() => setImgFullscreen(false)}
              />
            )}
            <div className="rounded-xl border border-border/50 bg-secondary/20 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ImageIcon className="h-3 w-3" />
                  Reference Image
                </span>
                <button
                  onClick={() => setImgFullscreen(true)}
                  title="View fullscreen"
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
              </div>
              <img
                src={lessonContent.referenceImageUrl}
                alt="Reference"
                className="max-h-56 w-full object-contain p-2 cursor-zoom-in"
                onClick={() => setImgFullscreen(true)}
                title="Click to view fullscreen"
              />
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground italic">
          Content provided by your trainer
        </p>
      </div>
    );
  }

  // ── Default fallback (no trainer content yet) ──────────────────────────
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">{lessonTitle}</h3>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Create a webpage that demonstrates the concept of{" "}
          <strong className="text-foreground">{lessonTitle}</strong>.
        </p>
        <p>Your page should include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proper HTML document structure</li>
          <li>Appropriate semantic elements</li>
          <li>Clean CSS styling</li>
          <li>Interactive behavior with JavaScript (if applicable)</li>
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex h-28 items-center justify-center rounded border border-dashed border-border text-xs text-muted-foreground flex-col gap-1">
          <ImageIcon className="h-5 w-5 opacity-40" />
          <span>No reference image yet</span>
          <span className="text-[10px] opacity-60">Trainer can upload one via Curriculum Manager</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemPanel;
