import { Router, Request, Response } from "express";
import LessonContent from "../models/LessonContent.js";

const router = Router();

// GET /api/lesson-content/:lessonId
router.get("/:lessonId", async (req: Request, res: Response) => {
  try {
    const content = await LessonContent.findOne({ lessonId: req.params.lessonId });
    if (!content) return res.status(404).json({ error: "No content found" });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lesson content" });
  }
});

// GET /api/lesson-content
router.get("/", async (_req: Request, res: Response) => {
  try {
    const contents = await LessonContent.find();
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lesson contents" });
  }
});

// POST /api/lesson-content
router.post("/", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    const content = await LessonContent.findOneAndUpdate(
      { lessonId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to save lesson content" });
  }
});

// DELETE /api/lesson-content/:lessonId
router.delete("/:lessonId", async (req: Request, res: Response) => {
  try {
    await LessonContent.findOneAndDelete({ lessonId: req.params.lessonId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete lesson content" });
  }
});

export default router;
