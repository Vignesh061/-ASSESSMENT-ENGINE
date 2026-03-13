import { Router, Request, Response } from "express";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import Student from "../models/Student.js";

const router = Router();

// GET /api/analytics
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [submissions, problems, students] = await Promise.all([
      Submission.find().lean(),
      Problem.find().lean(),
      Student.find().lean(),
    ]);

    // Avg score by topic
    const topicScores: Record<string, number[]> = { HTML: [], CSS: [], JavaScript: [] };
    for (const sub of submissions) {
      const problem = problems.find((p) => p._id.toString() === sub.problemId?.toString());
      if (problem) {
        topicScores[problem.topic].push(sub.score);
      }
    }

    const avgScoreByTopic: Record<string, number> = {};
    for (const [topic, scores] of Object.entries(topicScores)) {
      avgScoreByTopic[topic] = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    }

    // Submissions by difficulty
    const difficultyCount: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const sub of submissions) {
      const problem = problems.find((p) => p._id.toString() === sub.problemId?.toString());
      if (problem) {
        difficultyCount[problem.difficulty] = (difficultyCount[problem.difficulty] || 0) + 1;
      }
    }

    // Daily submissions (last 7 days)
    const dailySubmissions: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = submissions.filter((s) => {
        const sd = new Date(s.submittedAt);
        return sd.toDateString() === d.toDateString();
      }).length;
      dailySubmissions.push({ day: label, count });
    }

    // Hardest problems
    const hardestProblems = problems
      .map((p) => {
        const subs = submissions.filter((s) => s.problemId?.toString() === p._id.toString());
        const avg = subs.length
          ? Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length)
          : 0;
        return { id: p._id, title: p.title, avg, attempts: subs.length };
      })
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    // Student leaderboard
    const studentStats = students.map((s) => {
      const subs = submissions.filter((sub) => sub.studentId.toString() === s._id.toString());
      const avg = subs.length
        ? Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length)
        : 0;
      return { id: s._id, name: s.name, avatar: s.avatar, attempted: subs.length, avg };
    });

    res.json({
      totalStudents: students.length,
      totalSubmissions: submissions.length,
      totalProblems: problems.length,
      avgScoreByTopic,
      difficultyCount,
      dailySubmissions,
      hardestProblems,
      studentStats,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
