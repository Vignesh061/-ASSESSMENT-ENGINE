import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { APITestResult } from "@/lib/api";

interface TestCasePanelProps {
  testResults?: APITestResult[];
}

const statusIcon = {
  passed: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  failed: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  pending: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
};

const defaultTests: { name: string; category: string }[] = [
  { name: "Document has content", category: "DOM Tests" },
  { name: "Contains heading element(s)", category: "DOM Tests" },
  { name: "Custom background styles applied", category: "CSS Style Tests" },
  { name: "Uses modern layout (Flexbox or Grid)", category: "CSS Style Tests" },
  { name: "No JavaScript runtime errors", category: "JavaScript Tests" },
  { name: "Visual output matches reference", category: "Visual Tests" },
];

const TestCasePanel = ({ testResults }: TestCasePanelProps) => {
  const tests = testResults && testResults.length > 0 ? testResults : null;

  if (!tests) {
    const categories = [...new Set(defaultTests.map((t) => t.category))];
    return (
      <div className="p-4 space-y-4">
        <p className="text-xs text-muted-foreground mb-2">
          Submit your code to run these tests via Puppeteer evaluation.
        </p>
        {categories.map((cat) => (
          <div key={cat}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat}
            </h4>
            <div className="space-y-1">
              {defaultTests
                .filter((t) => t.category === cat)
                .map((test, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs bg-secondary/30"
                  >
                    {statusIcon.pending}
                    <span className="text-foreground">{test.name}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const categories = [...new Set(tests.map((t) => t.category))];

  return (
    <div className="p-4 space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {cat}
          </h4>
          <div className="space-y-1">
            {tests
              .filter((t) => t.category === cat)
              .map((test, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 rounded-md px-3 py-2 text-xs",
                    test.passed ? "bg-success/5" : "bg-destructive/5"
                  )}
                >
                  {test.passed ? statusIcon.passed : statusIcon.failed}
                  <div>
                    <span className="text-foreground">{test.name}</span>
                    {test.message && (
                      <p className="mt-0.5 text-muted-foreground text-[10px]">{test.message}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCasePanel;
