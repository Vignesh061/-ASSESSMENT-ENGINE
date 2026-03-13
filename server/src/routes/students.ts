import { Router, Request, Response } from "express";
import Student from "../models/Student.js";
import Submission from "../models/Submission.js";

const router = Router();

// GET /api/students
router.get("/", async (_req: Request, res: Response) => {
  try {
    const students = await Student.find().sort({ joinedAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET /api/students/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const submissions = await Submission.find({ studentId: student._id })
      .populate("problemId")
      .sort({ submittedAt: -1 });

    res.json({ student, submissions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// POST /api/students
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.json(student);
    }

    student = new Student({ name, email });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ studentId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

export default router;
