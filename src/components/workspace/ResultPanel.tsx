import { CheckCircle2, XCircle, MessageSquare, Loader2, ImageIcon, Camera, Eye, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import type { APITestResult } from "@/lib/api";

export interface EvaluationData {
  score: number;
  isCorrect: boolean;
  testResults: APITestResult[];
  feedback: string[];
  visualMatchPercent: number;
  studentScreenshot: string;
  referenceScreenshot: string;
  visualDiffScreenshot?: string;
  visualDiffHeatmap?: string;
}

interface ResultPanelProps {
  submitted: boolean;
  evaluating: boolean;
  evaluation: EvaluationData | null;
}

const ResultPanel = ({ submitted, evaluating, evaluation }: ResultPanelProps) => {
  type DiffView = "original" | "heatmap" | "diff";
  const [diffView, setDiffView] = useState<DiffView>("original");

  if (!submitted) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          Click <strong className="text-foreground">Submit</strong> to evaluate your code.
        </p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Evaluating your code with Puppeteer...</p>
        <p className="text-xs text-muted-foreground/70">Taking screenshot & comparing with trainer's reference image</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-destructive text-center">
          Evaluation failed. Please try again.
        </p>
      </div>
    );
  }

  const { score, testResults, feedback, visualMatchPercent, studentScreenshot, referenceScreenshot, visualDiffHeatmap } = evaluation;
  const passed = testResults.filter((t) => t.passed).length;
  const failed = testResults.filter((t) => !t.passed).length;

  return (
    <div className="p-4 space-y-6">
      {/* Score */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Score</span>
          <span className="font-mono text-primary font-bold">{score}/100</span>
        </div>
        <Progress value={score} className="h-2 bg-secondary [&>div]:bg-primary" />
      </div>

      {/* Pass/Fail counts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-success/5 p-3 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-success" />
          <p className="text-lg font-bold text-foreground">{passed}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div className="rounded-lg border border-border bg-destructive/5 p-3 text-center">
          <XCircle className="mx-auto mb-1 h-5 w-5 text-destructive" />
          <p className="text-lg font-bold text-foreground">{failed}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {/* Visual match */}
      {visualMatchPercent > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-foreground font-medium flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              Visual Match
            </span>
            <span className="font-mono text-primary font-bold">{visualMatchPercent}%</span>
          </div>
          <Progress value={visualMatchPercent} className="h-2 bg-secondary [&>div]:bg-accent" />
        </div>
      )}

      {/* Screenshots */}
      {(studentScreenshot || referenceScreenshot) && (
        <div className="grid grid-cols-2 gap-2">
          {studentScreenshot && (
            <div className="rounded-lg border border-border overflow-hidden relative">
              <div className="bg-secondary/30 px-2 py-1 text-[10px] font-medium text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Camera className="h-2.5 w-2.5" />
                  Your Output
                </div>
                {(visualDiffHeatmap || evaluation.visualDiffScreenshot) && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setDiffView("original")}
                      className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 transition-colors ${
                        diffView === "original" ? "bg-secondary text-foreground" : "hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Eye className="h-2.5 w-2.5" />
                      Original
                    </button>
                    {visualDiffHeatmap && (
                      <button
                        onClick={() => setDiffView("heatmap")}
                        className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 transition-colors ${
                          diffView === "heatmap" ? "bg-secondary text-foreground" : "hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <Flame className="h-2.5 w-2.5" />
                        Heatmap
                      </button>
                    )}
                    {evaluation.visualDiffScreenshot && (
                      <button
                        onClick={() => setDiffView("diff")}
                        className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 transition-colors ${
                          diffView === "diff" ? "bg-secondary text-foreground" : "hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <Eye className="h-2.5 w-2.5" />
                        Raw Diff
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                {diffView === "heatmap" && visualDiffHeatmap ? (
                  <img
                    src={`data:image/png;base64,${visualDiffHeatmap}`}
                    alt="Visual diff heatmap"
                    className="w-full object-contain"
                  />
                ) : diffView === "diff" && evaluation.visualDiffScreenshot ? (
                  <img
                    src={`data:image/png;base64,${evaluation.visualDiffScreenshot}`}
                    alt="Raw pixel diff"
                    className="w-full object-contain"
                  />
                ) : (
                  <img
                    src={`data:image/png;base64,${studentScreenshot}`}
                    alt="Student output"
                    className="w-full object-contain"
                  />
                )}
              </div>
              {/* Heatmap legend */}
              {diffView === "heatmap" && visualDiffHeatmap && (
                <div className="flex items-center justify-center gap-3 px-2 py-1.5 bg-secondary/20 border-t border-border">
                  <span className="text-[9px] text-muted-foreground font-medium">Diff Intensity:</span>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "#00c800" }} />
                    <span className="text-[9px] text-muted-foreground">Match</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "#ffff00" }} />
                    <span className="text-[9px] text-muted-foreground">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "#ffa500" }} />
                    <span className="text-[9px] text-muted-foreground">Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "#ff0000" }} />
                    <span className="text-[9px] text-muted-foreground">High</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {referenceScreenshot && (
            <div className="rounded-lg border border-primary/30 overflow-hidden">
              <div className="bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary flex items-center gap-1">
                <ImageIcon className="h-2.5 w-2.5" />
                Trainer Reference
              </div>
              <img
                src={`data:image/png;base64,${referenceScreenshot}`}
                alt="Trainer reference image"
                className="w-full object-contain"
              />
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          Evaluation Feedback
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          {feedback.map((msg, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed test results */}
      {testResults.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium text-foreground">Test Details</div>
          <div className="space-y-1">
            {testResults.map((test, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
                  test.passed ? "bg-success/5" : "bg-destructive/5"
                }`}
              >
                {test.passed ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                )}
                <div>
                  <span className="text-foreground font-medium">{test.name}</span>
                  {test.message && (
                    <p className="mt-0.5 text-muted-foreground">{test.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
