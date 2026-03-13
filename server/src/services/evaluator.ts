import puppeteer, { Browser } from "puppeteer";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
}

export interface EvaluationResult {
  score: number;
  isCorrect: boolean;
  testResults: TestResult[];
  feedback: string[];
  studentScreenshot: string; // base64
  referenceScreenshot: string; // base64
  visualMatchPercent: number;
  visualDiffScreenshot?: string;
  visualDiffHeatmap?: string; // base64 – student image with heat-overlay baked in
}

interface CodeBundle {
  html: string;
  css: string;
  js: string;
}

// ─── Browser singleton ───────────────────────────────────────────────────────

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDocument(code: CodeBundle): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${code.css}</style>
</head>
<body>
${code.html}
<script>${code.js}</script>
</body>
</html>`;
}

async function renderAndCapture(
  code: CodeBundle,
  viewport = { width: 800, height: 600 }
): Promise<{
  screenshot: Buffer;
  domInfo: DOMInfo;
  consoleMessages: string[];
  errors: string[];
}> {
  let browser;
  let page;
  try {
    browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport(viewport);

    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on("console", (msg) => consoleMessages.push(msg.text()));
    page.on("pageerror", (err) => errors.push(err.message));

    const htmlContent = buildDocument(code);
    await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 10000 });

    // Wait a bit for any JS animations/effects
    await new Promise((r) => setTimeout(r, 500));

    const screenshotRaw = await page.screenshot({ type: "png" });
    const screenshot: Buffer = Buffer.isBuffer(screenshotRaw)
      ? screenshotRaw
      : Buffer.from(screenshotRaw as Uint8Array);

    // Extract DOM information
    const domInfo = await page.evaluate(() => {
      const allElements = document.body.querySelectorAll("*");
      const elements = Array.from(allElements).map((el: any) => {
        const computed = window.getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          classes: Array.from(el.classList),
          text: el.textContent?.trim().slice(0, 200) || "",
          childCount: el.children.length,
          attributes: (() => {
            const attrs: Record<string, string> = {};
            for (const attr of Array.from(el.attributes)) {
              attrs[(attr as any).name] = (attr as any).value;
            }
            return attrs;
          })(),
          computedStyles: {
            display: computed.display,
            position: computed.position,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            margin: computed.margin,
            padding: computed.padding,
            width: computed.width,
            height: computed.height,
            flexDirection: computed.flexDirection,
            justifyContent: computed.justifyContent,
            alignItems: computed.alignItems,
            gridTemplateColumns: computed.gridTemplateColumns,
            textDecoration: computed.textDecoration,
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow,
          },
        };
      });

    return {
      title: document.title,
      bodyText: document.body.textContent?.trim().slice(0, 1000) || "",
      elementCount: allElements.length,
      elements,
      hasDoctype: document.doctype !== null,
      headElements: {
        hasTitle: !!document.querySelector("title"),
        hasMeta: !!document.querySelector('meta[charset]'),
        hasViewport: !!document.querySelector('meta[name="viewport"]'),
      },
      forms: document.querySelectorAll("form").length,
      links: document.querySelectorAll("a").length,
      images: document.querySelectorAll("img").length,
      headings: {
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        h3: document.querySelectorAll("h3").length,
      },
      lists: {
        ul: document.querySelectorAll("ul").length,
        ol: document.querySelectorAll("ol").length,
      },
      semanticElements: {
        header: document.querySelectorAll("header").length,
        nav: document.querySelectorAll("nav").length,
        main: document.querySelectorAll("main").length,
        section: document.querySelectorAll("section").length,
        footer: document.querySelectorAll("footer").length,
      },
      inputs: document.querySelectorAll("input").length,
      buttons: document.querySelectorAll("button").length,
      tables: document.querySelectorAll("table").length,
    };
  }) as unknown as DOMInfo;

    return { screenshot, domInfo, consoleMessages, errors };
  } catch (err: any) {
    console.error("Error in renderAndCapture:", err);
    throw new Error(`Puppeteer error: ${err.message}`);
  } finally {
    if (page && !page.isClosed()) {
      await page.close();
    }
  }
}

interface DOMInfo {
  title: string;
  bodyText: string;
  elementCount: number;
  elements: Array<{
    tag: string;
    id?: string;
    classes: string[];
    text: string;
    childCount: number;
    attributes: Record<string, string>;
    computedStyles: Record<string, string>;
  }>;
  hasDoctype: boolean;
  headElements: { hasTitle: boolean; hasMeta: boolean; hasViewport: boolean };
  forms: number;
  links: number;
  images: number;
  headings: { h1: number; h2: number; h3: number };
  lists: { ul: number; ol: number };
  semanticElements: { header: number; nav: number; main: number; section: number; footer: number };
  inputs: number;
  buttons: number;
  tables: number;
}

// ─── Visual Comparison ───────────────────────────────────────────────────────

function compareScreenshots(studentBuf: Buffer, refBuf: Buffer): {
  matchPercent: number;
  diffBuffer: Buffer | null;
  heatmapBuffer: Buffer | null;
} {
  try {
    const studentPng = PNG.sync.read(studentBuf);
    const refPng = PNG.sync.read(refBuf);

    // Resize to match if needed
    const width = Math.min(studentPng.width, refPng.width);
    const height = Math.min(studentPng.height, refPng.height);

    // Create cropped versions
    const cropPng = (png: PNG, w: number, h: number): Buffer => {
      const cropped = new PNG({ width: w, height: h });
      PNG.bitblt(png, cropped, 0, 0, w, h, 0, 0);
      return cropped.data as unknown as Buffer;
    };

    const studentData = cropPng(studentPng, width, height);
    const refData = cropPng(refPng, width, height);
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      new Uint8Array(studentData),
      new Uint8Array(refData),
      new Uint8Array(diff.data),
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const matchPercent = Math.round(((totalPixels - numDiffPixels) / totalPixels) * 100);

    // ── Generate heatmap: student image blended with heat-colored overlay ──
    const heatmap = new PNG({ width, height });
    const SQRT3x255 = Math.sqrt(3) * 255;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        const sR = studentData[idx];
        const sG = studentData[idx + 1];
        const sB = studentData[idx + 2];

        const rR = refData[idx];
        const rG = refData[idx + 1];
        const rB = refData[idx + 2];

        // Normalised colour distance 0-1
        const dist = Math.sqrt(
          (sR - rR) ** 2 + (sG - rG) ** 2 + (sB - rB) ** 2
        ) / SQRT3x255;

        // Map distance → heatmap colour + blend alpha
        let hR: number, hG: number, hB: number, alpha: number;

        if (dist < 0.05) {
          // Near-match → subtle green tint
          hR = 0;   hG = 200; hB = 0;   alpha = 0.12;
        } else if (dist < 0.20) {
          // Small diff → yellow
          const t = (dist - 0.05) / 0.15;
          hR = 255; hG = 255; hB = 0;   alpha = 0.18 + t * 0.25;
        } else if (dist < 0.50) {
          // Moderate diff → orange
          const t = (dist - 0.20) / 0.30;
          hR = 255; hG = Math.round(200 * (1 - t)); hB = 0; alpha = 0.40 + t * 0.25;
        } else {
          // Large diff → red
          hR = 255; hG = 0;   hB = 0;   alpha = 0.65 + Math.min(dist, 1) * 0.20;
        }

        // Blend student pixel with heat colour
        heatmap.data[idx]     = Math.round(sR * (1 - alpha) + hR * alpha);
        heatmap.data[idx + 1] = Math.round(sG * (1 - alpha) + hG * alpha);
        heatmap.data[idx + 2] = Math.round(sB * (1 - alpha) + hB * alpha);
        heatmap.data[idx + 3] = 255; // fully opaque
      }
    }

    return {
      matchPercent,
      diffBuffer: PNG.sync.write(diff),
      heatmapBuffer: PNG.sync.write(heatmap),
    };
  } catch {
    return { matchPercent: 0, diffBuffer: null, heatmapBuffer: null };
  }
}

// ─── DOM-based Test Generation ───────────────────────────────────────────────

function runDOMTests(
  studentDOM: DOMInfo,
  referenceDOM: DOMInfo | null,
  expectedOutput: string
): TestResult[] {
  const tests: TestResult[] = [];

  // Basic structure tests
  tests.push({
    name: "Document has content",
    category: "DOM Tests",
    passed: studentDOM.elementCount > 0 && studentDOM.bodyText.length > 0,
    message:
      studentDOM.elementCount > 0
        ? `Found ${studentDOM.elementCount} elements with content`
        : "Page appears empty - add HTML content",
  });

  tests.push({
    name: "Contains heading element(s)",
    category: "DOM Tests",
    passed: studentDOM.headings.h1 > 0 || studentDOM.headings.h2 > 0 || studentDOM.headings.h3 > 0,
    message:
      studentDOM.headings.h1 > 0
        ? `Found ${studentDOM.headings.h1} h1 heading(s)`
        : "No heading elements found - add h1, h2, or h3 tags",
  });

  // Reference-based tests
  if (referenceDOM) {
    // Element count comparison
    const elementRatio = studentDOM.elementCount / Math.max(referenceDOM.elementCount, 1);
    tests.push({
      name: "Element count matches reference",
      category: "DOM Tests",
      passed: elementRatio >= 0.6 && elementRatio <= 1.5,
      message:
        elementRatio >= 0.6
          ? `Element count is within expected range (${studentDOM.elementCount} vs ${referenceDOM.elementCount} reference)`
          : `Too few elements (${studentDOM.elementCount}) compared to reference (${referenceDOM.elementCount})`,
    });

    // Check for same tag types
    const refTags = new Set(referenceDOM.elements.map((e) => e.tag));
    const studentTags = new Set(studentDOM.elements.map((e) => e.tag));
    const matchingTags = [...refTags].filter((t) => studentTags.has(t));
    const tagMatchPercent = Math.round((matchingTags.length / Math.max(refTags.size, 1)) * 100);

    tests.push({
      name: "Uses expected HTML elements",
      category: "DOM Tests",
      passed: tagMatchPercent >= 70,
      message:
        tagMatchPercent >= 70
          ? `Using ${tagMatchPercent}% of expected element types`
          : `Only ${tagMatchPercent}% of expected element types found. Missing: ${[...refTags].filter((t) => !studentTags.has(t)).join(", ")}`,
    });

    // Form elements comparison
    if (referenceDOM.forms > 0) {
      tests.push({
        name: "Contains form element(s)",
        category: "DOM Tests",
        passed: studentDOM.forms > 0,
        message:
          studentDOM.forms > 0
            ? `Found ${studentDOM.forms} form(s)`
            : "Missing form element - the reference includes a form",
      });

      if (referenceDOM.inputs > 0) {
        tests.push({
          name: "Form has required input fields",
          category: "DOM Tests",
          passed: studentDOM.inputs >= referenceDOM.inputs * 0.7,
          message:
            studentDOM.inputs >= referenceDOM.inputs * 0.7
              ? `Found ${studentDOM.inputs}/${referenceDOM.inputs} expected input fields`
              : `Only ${studentDOM.inputs}/${referenceDOM.inputs} input fields found`,
        });
      }
    }

    // List comparison
    if (referenceDOM.lists.ul > 0 || referenceDOM.lists.ol > 0) {
      const refListCount = referenceDOM.lists.ul + referenceDOM.lists.ol;
      const studentListCount = studentDOM.lists.ul + studentDOM.lists.ol;
      tests.push({
        name: "Contains list element(s)",
        category: "DOM Tests",
        passed: studentListCount > 0,
        message:
          studentListCount > 0
            ? `Found ${studentListCount} list(s)`
            : `Missing list elements (reference has ${refListCount})`,
      });
    }

    // Link comparison
    if (referenceDOM.links > 0) {
      tests.push({
        name: "Contains anchor/link elements",
        category: "DOM Tests",
        passed: studentDOM.links > 0,
        message:
          studentDOM.links > 0
            ? `Found ${studentDOM.links} link(s)`
            : "Missing anchor tags - the reference includes links",
      });
    }

    // Button comparison
    if (referenceDOM.buttons > 0) {
      tests.push({
        name: "Contains button element(s)",
        category: "DOM Tests",
        passed: studentDOM.buttons >= referenceDOM.buttons,
        message:
          studentDOM.buttons >= referenceDOM.buttons
            ? `Found ${studentDOM.buttons} button(s)`
            : `Only ${studentDOM.buttons}/${referenceDOM.buttons} buttons found`,
      });
    }
  }

  // Expected output text matching
  if (expectedOutput) {
    const keywords = expectedOutput
      .toLowerCase()
      .split(/[,.\s]+/)
      .filter((w) => w.length > 3);
    const bodyLower = studentDOM.bodyText.toLowerCase();
    const elementsStr = studentDOM.elements.map((e) => `${e.tag} ${e.text}`).join(" ").toLowerCase();

    // Check for element type mentions in expected output
    const elementChecks: { keyword: string; check: boolean }[] = [];
    if (expectedOutput.toLowerCase().includes("h1"))
      elementChecks.push({ keyword: "h1", check: studentDOM.headings.h1 > 0 });
    if (expectedOutput.toLowerCase().includes("form"))
      elementChecks.push({ keyword: "form", check: studentDOM.forms > 0 });
    if (expectedOutput.toLowerCase().includes("ul") || expectedOutput.toLowerCase().includes("list"))
      elementChecks.push({ keyword: "list", check: studentDOM.lists.ul + studentDOM.lists.ol > 0 });
    if (expectedOutput.toLowerCase().includes("anchor") || expectedOutput.toLowerCase().includes("link"))
      elementChecks.push({ keyword: "link/anchor", check: studentDOM.links > 0 });
    if (expectedOutput.toLowerCase().includes("button"))
      elementChecks.push({ keyword: "button", check: studentDOM.buttons > 0 });
    if (expectedOutput.toLowerCase().includes("table"))
      elementChecks.push({ keyword: "table", check: studentDOM.tables > 0 });

    if (elementChecks.length > 0) {
      const passedChecks = elementChecks.filter((c) => c.check);
      tests.push({
        name: "Contains expected elements from description",
        category: "DOM Tests",
        passed: passedChecks.length >= elementChecks.length * 0.7,
        message:
          passedChecks.length >= elementChecks.length * 0.7
            ? `Found ${passedChecks.length}/${elementChecks.length} expected elements`
            : `Missing elements: ${elementChecks.filter((c) => !c.check).map((c) => c.keyword).join(", ")}`,
      });
    }

    // Content relevance check
    const relevantKeywords = keywords.filter(
      (k) => bodyLower.includes(k) || elementsStr.includes(k)
    );
    const relevancePercent = keywords.length
      ? Math.round((relevantKeywords.length / keywords.length) * 100)
      : 100;

    tests.push({
      name: "Content matches expected output description",
      category: "DOM Tests",
      passed: relevancePercent >= 30,
      message:
        relevancePercent >= 30
          ? `Content relevance: ${relevancePercent}%`
          : `Low content relevance (${relevancePercent}%). Review the expected output description.`,
    });
  }

  return tests;
}

function runCSSTests(
  studentDOM: DOMInfo,
  referenceDOM: DOMInfo | null
): TestResult[] {
  const tests: TestResult[] = [];

  // Check if any styling is applied
  const hasCustomStyles = studentDOM.elements.some((el) => {
    const bg = el.computedStyles.backgroundColor;
    return bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
  });

  tests.push({
    name: "Custom background styles applied",
    category: "CSS Style Tests",
    passed: hasCustomStyles,
    message: hasCustomStyles
      ? "Background styles detected"
      : "No custom background colors found - add CSS styling",
  });

  // Check for layout usage
  const usesFlexbox = studentDOM.elements.some(
    (el) => el.computedStyles.display === "flex" || el.computedStyles.display === "inline-flex"
  );
  const usesGrid = studentDOM.elements.some(
    (el) => el.computedStyles.display === "grid" || el.computedStyles.display === "inline-grid"
  );

  tests.push({
    name: "Uses modern layout (Flexbox or Grid)",
    category: "CSS Style Tests",
    passed: usesFlexbox || usesGrid,
    message: usesFlexbox
      ? "Flexbox layout detected"
      : usesGrid
        ? "CSS Grid layout detected"
        : "No Flexbox or Grid layout detected - consider using modern layout methods",
  });

  // Reference style comparison
  if (referenceDOM) {
    // Compare layout method
    const refUsesFlexbox = referenceDOM.elements.some(
      (el) => el.computedStyles.display === "flex" || el.computedStyles.display === "inline-flex"
    );
    const refUsesGrid = referenceDOM.elements.some(
      (el) => el.computedStyles.display === "grid" || el.computedStyles.display === "inline-grid"
    );

    if (refUsesFlexbox || refUsesGrid) {
      tests.push({
        name: "Layout method matches reference",
        category: "CSS Style Tests",
        passed:
          (refUsesFlexbox && usesFlexbox) || (refUsesGrid && usesGrid),
        message:
          (refUsesFlexbox && usesFlexbox) || (refUsesGrid && usesGrid)
            ? "Layout method matches the reference"
            : `Reference uses ${refUsesFlexbox ? "Flexbox" : "Grid"} but your code does not`,
      });
    }

    // Font size check
    const refFontSizes = referenceDOM.elements.map((e) => parseFloat(e.computedStyles.fontSize));
    const studentFontSizes = studentDOM.elements.map((e) => parseFloat(e.computedStyles.fontSize));
    const avgRefSize = refFontSizes.reduce((a, b) => a + b, 0) / Math.max(refFontSizes.length, 1);
    const avgStudentSize = studentFontSizes.reduce((a, b) => a + b, 0) / Math.max(studentFontSizes.length, 1);

    tests.push({
      name: "Font sizes are appropriate",
      category: "CSS Style Tests",
      passed: Math.abs(avgStudentSize - avgRefSize) < 6,
      message:
        Math.abs(avgStudentSize - avgRefSize) < 6
          ? `Average font size (${avgStudentSize.toFixed(0)}px) is within range`
          : `Average font size (${avgStudentSize.toFixed(0)}px) differs from reference (${avgRefSize.toFixed(0)}px)`,
    });
  }

  return tests;
}

function runJSTests(
  studentDOM: DOMInfo,
  referenceDOM: DOMInfo | null,
  consoleMessages: string[],
  errors: string[]
): TestResult[] {
  const tests: TestResult[] = [];

  // Check for JS errors
  tests.push({
    name: "No JavaScript runtime errors",
    category: "JavaScript Tests",
    passed: errors.length === 0,
    message:
      errors.length === 0
        ? "No runtime errors detected"
        : `${errors.length} error(s): ${errors[0]}`,
  });

  // Check for interactive elements
  const hasInteractiveElements = studentDOM.buttons > 0 || studentDOM.inputs > 0;
  if (hasInteractiveElements) {
    tests.push({
      name: "Interactive elements present",
      category: "JavaScript Tests",
      passed: true,
      message: `Found ${studentDOM.buttons} button(s) and ${studentDOM.inputs} input(s) for interaction`,
    });
  }

  // Check if JS produced any console output
  if (consoleMessages.length > 0) {
    tests.push({
      name: "JavaScript produces output",
      category: "JavaScript Tests",
      passed: true,
      message: `Script produced ${consoleMessages.length} console message(s)`,
    });
  }

  return tests;
}

function generateFeedback(
  testResults: TestResult[],
  visualMatch: number,
  referenceProvided: boolean
): string[] {
  const feedback: string[] = [];
  const passed = testResults.filter((t) => t.passed).length;
  const total = testResults.length;

  if (passed === total) {
    feedback.push("Excellent work! All tests passed.");
  } else if (passed >= total * 0.7) {
    feedback.push("Good progress! Most tests are passing.");
  } else {
    feedback.push("Keep working - several tests need attention.");
  }

  // Add specific feedback for failed tests
  const failedByCategory: Record<string, TestResult[]> = {};
  testResults
    .filter((t) => !t.passed)
    .forEach((t) => {
      if (!failedByCategory[t.category]) failedByCategory[t.category] = [];
      failedByCategory[t.category].push(t);
    });

  for (const [category, failures] of Object.entries(failedByCategory)) {
    if (category === "DOM Tests") {
      feedback.push(`HTML Structure: ${failures.map((f) => f.message).join(". ")}`);
    } else if (category === "CSS Style Tests") {
      feedback.push(`CSS Styling: ${failures.map((f) => f.message).join(". ")}`);
    } else if (category === "JavaScript Tests") {
      feedback.push(`JavaScript: ${failures.map((f) => f.message).join(". ")}`);
    } else if (category === "Visual Tests") {
      feedback.push(`Visual Match: ${failures.map((f) => f.message).join(". ")}`);
    }
  }

  if (referenceProvided && visualMatch > 0) {
    if (visualMatch >= 90) {
      feedback.push(`Visual match with reference: ${visualMatch}% - great visual accuracy!`);
    } else if (visualMatch >= 70) {
      feedback.push(`Visual match with reference: ${visualMatch}% - close but some differences exist.`);
    } else {
      feedback.push(`Visual match with reference: ${visualMatch}% - review the reference image for layout guidance.`);
    }
  }

  return feedback;
}

// ─── Main Evaluation Function ────────────────────────────────────────────────

export async function evaluateSubmission(
  studentCode: CodeBundle,
  referenceCode: CodeBundle | null,
  expectedOutput: string,
  referenceImageBuffer: Buffer | null = null
): Promise<EvaluationResult> {
  // Render student code
  const studentResult = await renderAndCapture(studentCode);

  // Determine reference screenshot buffer for visual comparison
  let referenceScreenshotBuf: Buffer | null = null;
  let referenceResult: Awaited<ReturnType<typeof renderAndCapture>> | null = null;
  let visualMatchPercent = 0;
  let visualDiffScreenshotBuf: Buffer | null = null;

  let visualDiffHeatmapBuf: Buffer | null = null;

  if (referenceImageBuffer) {
    // Use trainer's uploaded image directly — no need to render reference code
    referenceScreenshotBuf = referenceImageBuffer;
    const cmp = compareScreenshots(studentResult.screenshot, referenceScreenshotBuf);
    visualMatchPercent = cmp.matchPercent;
    visualDiffScreenshotBuf = cmp.diffBuffer;
    visualDiffHeatmapBuf = cmp.heatmapBuffer;
  } else if (referenceCode && (referenceCode.html || referenceCode.css || referenceCode.js)) {
    // Fall back: render reference HTML/CSS/JS and compare
    referenceResult = await renderAndCapture(referenceCode);
    referenceScreenshotBuf = referenceResult.screenshot;
    const cmp = compareScreenshots(studentResult.screenshot, referenceScreenshotBuf);
    visualMatchPercent = cmp.matchPercent;
    visualDiffScreenshotBuf = cmp.diffBuffer;
    visualDiffHeatmapBuf = cmp.heatmapBuffer;
  }

  const hasReference = referenceScreenshotBuf !== null;

  // Run all test suites
  const domTests = runDOMTests(
    studentResult.domInfo,
    referenceResult?.domInfo ?? null,
    expectedOutput
  );
  const cssTests = runCSSTests(
    studentResult.domInfo,
    referenceResult?.domInfo ?? null
  );
  const jsTests = runJSTests(
    studentResult.domInfo,
    referenceResult?.domInfo ?? null,
    studentResult.consoleMessages,
    studentResult.errors
  );

  // Visual comparison test
  const visualTests: TestResult[] = [];
  if (hasReference) {
    visualTests.push({
      name: "Visual output matches reference",
      category: "Visual Tests",
      passed: visualMatchPercent >= 70,
      message:
        visualMatchPercent >= 70
          ? `${visualMatchPercent}% visual match with reference`
          : `Only ${visualMatchPercent}% visual match - check layout and styling`,
    });
  }

  const allTests = [...domTests, ...cssTests, ...jsTests, ...visualTests];

  // Calculate score
  const passedCount = allTests.filter((t) => t.passed).length;
  const totalCount = allTests.length;
  let score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Boost score with visual match if reference exists
  if (hasReference && visualMatchPercent > 0) {
    score = Math.round(score * 0.7 + visualMatchPercent * 0.3);
  }

  score = Math.min(100, Math.max(0, score));

  const feedback = generateFeedback(allTests, visualMatchPercent, hasReference);

  return {
    score,
    isCorrect: score >= 70,
    testResults: allTests,
    feedback,
    studentScreenshot: studentResult.screenshot.toString("base64"),
    referenceScreenshot: referenceScreenshotBuf?.toString("base64") ?? "",
    visualMatchPercent,
    visualDiffScreenshot: visualDiffScreenshotBuf?.toString("base64") ?? "",
    visualDiffHeatmap: visualDiffHeatmapBuf?.toString("base64") ?? "",
  };
}
