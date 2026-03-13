import { Router, Request, Response } from "express";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import LessonContent from "../models/LessonContent.js";
import { evaluateSubmission } from "../services/evaluator.js";

const router = Router();

// GET /api/submissions
router.get("/", async (_req: Request, res: Response) => {
  try {
    const submissions = await Submission.find()
      .populate("studentId")
      .populate("problemId")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// GET /api/submissions/student/:studentId
router.get("/student/:studentId", async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate("problemId")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// GET /api/submissions/problem/:problemId
router.get("/problem/:problemId", async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ problemId: req.params.problemId })
      .populate("studentId")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// POST /api/submissions - Submit code and trigger evaluation
router.post("/", async (req: Request, res: Response) => {
  try {
    const { studentId, problemId, lessonId, htmlCode, cssCode, jsCode, timeSpent } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }
    if (!htmlCode && !cssCode && !jsCode) {
      return res.status(400).json({ error: "At least one code file is required" });
    }

    // Get reference code from problem or lesson content
    let referenceCode: { html: string; css: string; js: string } | null = null;
    let referenceImageBuffer: Buffer | null = null;
    let expectedOutput = "";

    if (problemId) {
      const problem = await Problem.findById(problemId);
      if (problem) {
        expectedOutput = problem.expectedOutput;
        const refHtml = problem.referenceHtml || problem.starterHtml;
        const refCss = problem.referenceCss || problem.starterCss;
        const refJs = problem.referenceJs || problem.starterJs;
        if (refHtml || refCss || refJs) {
          referenceCode = {
            html: refHtml,
            css: refCss,
            js: refJs,
          };
        }
      }
    }

    if (lessonId) {
      const lesson = await LessonContent.findOne({ lessonId });
      if (lesson) {
        // Prefer trainer's uploaded reference image for visual comparison
        if (lesson.referenceImageUrl) {
          try {
            const imgResp = await fetch(lesson.referenceImageUrl);
            if (imgResp.ok) {
              const arrayBuf = await imgResp.arrayBuffer();
              referenceImageBuffer = Buffer.from(arrayBuf);
            }
          } catch (e) {
            console.warn("Could not fetch reference image:", e);
          }
        }

        // Fall back to reference code only if no image is available
        if (!referenceImageBuffer) {
          const refHtml = lesson.referenceHtml || lesson.starterHtml;
          const refCss = lesson.referenceCss || lesson.starterCss;
          const refJs = lesson.referenceJs || lesson.starterJs;
          if (refHtml || refCss || refJs) {
            referenceCode = {
              html: refHtml,
              css: refCss,
              js: refJs,
            };
          }
        }

        if (!expectedOutput && lesson.task) {
          expectedOutput = lesson.task;
        }
      }
    }

    // Run Puppeteer evaluation
    const studentCode = { html: htmlCode || "", css: cssCode || "", js: jsCode || "" };
    const evaluation = await evaluateSubmission(studentCode, referenceCode, expectedOutput, referenceImageBuffer);

    // Save submission with evaluation results
    const submission = new Submission({
      studentId,
      problemId: problemId || undefined,
      lessonId: lessonId || "",
      htmlCode,
      cssCode,
      jsCode,
      score: evaluation.score,
      isCorrect: evaluation.isCorrect,
      testResults: evaluation.testResults,
      feedback: evaluation.feedback,
      submittedAt: new Date(),
      timeSpent: timeSpent || 0,
    });

    await submission.save();

    res.status(201).json({
      submission,
      evaluation: {
        score: evaluation.score,
        isCorrect: evaluation.isCorrect,
        testResults: evaluation.testResults,
        feedback: evaluation.feedback,
        visualMatchPercent: evaluation.visualMatchPercent,
        studentScreenshot: evaluation.studentScreenshot,
        referenceScreenshot: evaluation.referenceScreenshot,
        visualDiffScreenshot: evaluation.visualDiffScreenshot,
        visualDiffHeatmap: evaluation.visualDiffHeatmap,
      },
    });
  } catch (err) {
    console.error("Submission evaluation error:", err);
    res.status(500).json({ error: "Failed to evaluate submission" });
  }
});

export default router;
