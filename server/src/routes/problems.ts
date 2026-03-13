import { Router, Request, Response } from "express";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";

const router = Router();

// GET /api/problems
router.get("/", async (_req: Request, res: Response) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// GET /api/problems/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// POST /api/problems
router.post("/", async (req: Request, res: Response) => {
  try {
    const problem = new Problem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: "Failed to create problem" });
  }
});

// PUT /api/problems/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Failed to update problem" });
  }
});

// DELETE /api/problems/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ problemId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete problem" });
  }
});

export default router;
