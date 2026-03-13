import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import {
  Code2,
  Play,
  Send,
  RotateCcw,
  ChevronLeft,
  FileCode,
  Folder,
  ChevronRight,
  GripVertical,
  GripHorizontal,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EditorTabs from "@/components/workspace/EditorTabs";
import ProblemPanel from "@/components/workspace/ProblemPanel";
import TestCasePanel from "@/components/workspace/TestCasePanel";
import ResultPanel from "@/components/workspace/ResultPanel";
import PreviewFrame from "@/components/workspace/PreviewFrame";
import { courses } from "@/data/courses";
import { getProblems, getLessonContent } from "@/lib/trainerStore";
import { apiSubmitCode } from "@/lib/api";
import type { EvaluationData } from "@/components/workspace/ResultPanel";

const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, AMYPO!</h1>
  <p>Start coding here.</p>
</body>
</html>`;

const defaultCSS = `body {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  background: #1e293b;
  color: #f1f5f9;
}

h1 {
  font-size: 2rem;
}`;

const defaultJS = `// JavaScript code here
document.querySelector('h1')?.addEventListener('click', () => {
  alert('Hello from AMYPO!');
});`;

const rightTabs = ["Problem", "Tests", "Results"] as const;
type RightTab = (typeof rightTabs)[number];

const fileTree = [
  { name: "index.html", tab: "html" },
  { name: "style.css", tab: "css" },
  { name: "script.js", tab: "js" },
];

// Drag handle for vertical splits (left-right)
const VerticalHandle = () => (
  <PanelResizeHandle className="group relative flex w-1.5 items-center justify-center bg-border hover:bg-primary/50 transition-colors duration-150 cursor-col-resize">
    <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm bg-border group-hover:bg-primary/70 transition-colors">
      <GripVertical className="h-3 w-3 text-muted-foreground group-hover:text-primary-foreground" />
    </div>
  </PanelResizeHandle>
);

// Drag handle for horizontal splits (top-bottom)
const HorizontalHandle = () => (
  <PanelResizeHandle className="group relative flex h-1.5 items-center justify-center bg-border hover:bg-primary/50 transition-colors duration-150 cursor-row-resize">
    <div className="z-10 flex h-4 w-8 items-center justify-center rounded-sm bg-border group-hover:bg-primary/70 transition-colors">
      <GripHorizontal className="h-3 w-3 text-muted-foreground group-hover:text-primary-foreground" />
    </div>
  </PanelResizeHandle>
);

const Workspace = () => {
  const { lessonId } = useParams();

  // Check if this lesson is a trainer-created problem
  const trainerProblem = useMemo(() => {
    if (!lessonId) return null;
    return getProblems().find((p) => p.id === lessonId) ?? null;
  }, [lessonId]);

  // Check if this syllabus lesson has trainer curriculum override
  const lessonContent = useMemo(() => {
    if (!lessonId || trainerProblem) return null;
    return getLessonContent(lessonId);
  }, [lessonId, trainerProblem]);

  // Always use defaults for the student workspace so they start from scratch
  const initHtml = defaultHTML;
  const initCss  = defaultCSS;
  const initJs   = defaultJS;

  const [activeTab, setActiveTab] = useState("html");
  const [rightTab, setRightTab] = useState<RightTab>("Problem");
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Close fullscreen on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const [htmlCode, setHtmlCode] = useState(initHtml);
  const [cssCode, setCssCode] = useState(initCss);
  const [jsCode, setJsCode] = useState(initJs);

  const [previewHtml, setPreviewHtml] = useState(initHtml);
  const [previewCss, setPreviewCss] = useState(initCss);
  const [previewJs, setPreviewJs] = useState(initJs);

  // Find lesson title — use trainer problem title if available
  let lessonTitle = "Lesson";
  if (trainerProblem) {
    lessonTitle = trainerProblem.title;
  } else {
    for (const course of courses) {
      for (const level of course.levels) {
        const found = level.lessons.find((l) => l.id === lessonId);
        if (found) { lessonTitle = found.title; break; }
      }
    }
  }

  const currentCode = activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
  const setCurrentCode = useCallback(
    (val: string | undefined) => {
      if (!val) return;
      if (activeTab === "html") setHtmlCode(val);
      else if (activeTab === "css") setCssCode(val);
      else setJsCode(val);
    },
    [activeTab]
  );

  const language = activeTab === "html" ? "html" : activeTab === "css" ? "css" : "javascript";

  const handleRun = () => {
    setPreviewHtml(htmlCode);
    setPreviewCss(cssCode);
    setPreviewJs(jsCode);
  };

  const handleSubmit = async () => {
    handleRun();
    setSubmitted(true);
    setEvaluating(true);
    setEvaluation(null);
    setRightTab("Results");

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 60000);

    try {
      // Get or create a demo student ID from sessionStorage
      let studentId = sessionStorage.getItem("amypo_student_id") || "";
      if (!studentId) {
        // Use a default demo student — backend will create if needed
        studentId = "000000000000000000000000";
      }

      const result = await apiSubmitCode({
        studentId,
        problemId: trainerProblem?.id,
        lessonId: lessonId,
        htmlCode,
        cssCode,
        jsCode,
        timeSpent,
      });

      setEvaluation(result.evaluation);
    } catch (err) {
      console.error("Evaluation error:", err);
      // Provide a fallback evaluation on error
      setEvaluation({
        score: 0,
        isCorrect: false,
        testResults: [],
        feedback: ["Backend evaluation unavailable. Please ensure the server is running on port 5000."],
        visualMatchPercent: 0,
        studentScreenshot: "",
        referenceScreenshot: "",
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = () => {
    setHtmlCode(initHtml);
    setCssCode(initCss);
    setJsCode(initJs);
    setSubmitted(false);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Code2 className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">AMYPO</span>
          </Link>
          <span className="text-xs text-muted-foreground">/ {lessonTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:block">
            Drag the dividers to resize panels
          </span>
          <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5 border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleRun} className="gap-1.5 bg-success text-success-foreground hover:bg-success/90">
            <Play className="h-3.5 w-3.5" />
            Run
          </Button>
          <Button size="sm" onClick={handleSubmit} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="h-3.5 w-3.5" />
            Submit
          </Button>
        </div>
      </header>

      {/* Main resizable layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer (collapsible, non-resizable sidebar) */}
        <div className={cn("shrink-0 border-r border-border bg-card/30 transition-all duration-200", explorerOpen ? "w-44" : "w-10")}>
          <button
            onClick={() => setExplorerOpen(!explorerOpen)}
            className="flex h-8 w-full items-center gap-1 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", explorerOpen && "rotate-90")} />
            {explorerOpen && <span className="uppercase tracking-wider font-semibold">Explorer</span>}
          </button>

          {explorerOpen && (
            <div className="px-2">
              <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
                <Folder className="h-3 w-3" />
                <span>src</span>
              </div>
              {fileTree.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveTab(file.tab)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-4 py-1.5 text-xs transition-colors",
                    activeTab === file.tab
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <FileCode className="h-3 w-3" />
                  {file.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Outer horizontal PanelGroup (editor+preview | right panel) */}
        <PanelGroup direction="horizontal" className="flex-1">

          {/* Left column: Editor (top) + Preview (bottom) — vertical split */}
          <Panel defaultSize={65} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Editor */}
              <Panel defaultSize={60} minSize={20}>
                <div className="flex h-full flex-col">
                  <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
                  <div className="flex-1">
                    <Editor
                      theme="vs-dark"
                      language={language}
                      value={currentCode}
                      onChange={setCurrentCode}
                      options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        renderWhitespace: "selection",
                        tabSize: 2,
                        automaticLayout: true,
                        padding: { top: 12 },
                      }}
                    />
                  </div>
                </div>
              </Panel>

              <HorizontalHandle />

              {/* Live Preview */}
              <Panel defaultSize={40} minSize={10}>
                <div className="flex h-full flex-col">
                  <div className="flex h-8 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4">
                    <span className="text-xs font-medium text-muted-foreground">🖥 Live Preview</span>
                    <button
                      onClick={() => setPreviewFullscreen(true)}
                      title="Maximise preview"
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <PreviewFrame html={previewHtml} css={previewCss} js={previewJs} />
                  </div>
                </div>
              </Panel>

              {/* Fullscreen Preview Overlay */}
              {previewFullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black">
                  <div className="flex h-10 shrink-0 items-center justify-between bg-card/90 px-4 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground">🖥 Live Preview — Fullscreen</span>
                    <button
                      onClick={() => setPreviewFullscreen(false)}
                      className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/20 hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      Close (Esc)
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <PreviewFrame html={previewHtml} css={previewCss} js={previewJs} />
                  </div>
                </div>
              )}
            </PanelGroup>
          </Panel>

          <VerticalHandle />

          {/* Right panel: Problem / Tests / Results */}
          <Panel defaultSize={35} minSize={20}>
            <div className="flex h-full flex-col border-l border-border bg-card/30">
              <div className="flex border-b border-border">
                {rightTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={cn(
                      "flex-1 px-3 py-2.5 text-xs font-medium transition-colors border-b-2",
                      rightTab === tab
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto">
                {rightTab === "Problem" && <ProblemPanel lessonTitle={lessonTitle} lessonId={lessonId} />}
                {rightTab === "Tests" && <TestCasePanel testResults={evaluation?.testResults} />}
                {rightTab === "Results" && <ResultPanel submitted={submitted} evaluating={evaluating} evaluation={evaluation} />}
              </div>
            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
};

export default Workspace;
