import { useState, useEffect, useCallback } from "react";
import {
  apiGetStudents,
  apiGetProblems,
  apiGetSubmissions,
  apiGetAnalytics,
  apiGetLessonContent,
  apiSaveLessonContent,
  apiDeleteLessonContent,
  apiCreateProblem,
  apiUpdateProblem,
  apiDeleteProblem,
  apiDeleteStudent,
  apiHealthCheck,
  type APIStudent,
  type APIProblem,
  type APISubmission,
  type APIAnalytics,
  type APILessonContent,
} from "@/lib/api";
import {
  getProblems as getLocalProblems,
  getStudents as getLocalStudents,
  getSubmissions as getLocalSubmissions,
  getLessonContent as getLocalLessonContent,
  saveLessonContent as saveLocalLessonContent,
  clearLessonContent as clearLocalLessonContent,
  saveProblem as saveLocalProblem,
  deleteProblem as deleteLocalProblem,
  avgScoreByTopic as localAvgScoreByTopic,
  type Problem as LocalProblem,
  type Student as LocalStudent,
  type Submission as LocalSubmission,
  type LessonContent as LocalLessonContent,
  type Topic,
} from "@/lib/trainerStore";

// Check if backend is available (cached for session)
let backendAvailable: boolean | null = null;
let healthCheckPromise: Promise<boolean> | null = null;

export async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  if (healthCheckPromise) return healthCheckPromise;
  healthCheckPromise = apiHealthCheck().then((ok) => {
    backendAvailable = ok;
    return ok;
  });
  return healthCheckPromise;
}

export function resetBackendCheck() {
  backendAvailable = null;
  healthCheckPromise = null;
}

// ─── Normalized Types ──────────────────────────────────────────────────────
// These match the shape used across the frontend

export interface NormalizedStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
}

export interface NormalizedProblem {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  difficulty: "Easy" | "Medium" | "Hard";
  expectedOutput: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  createdAt: string;
}

export interface NormalizedSubmission {
  id: string;
  studentId: string;
  problemId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  score: number;
  isCorrect: boolean;
  submittedAt: string;
  timeSpent: number;
}

export interface NormalizedLessonContent {
  lessonId: string;
  task: string;
  referenceImageUrl: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  updatedAt: string;
}

// ─── Adapters ──────────────────────────────────────────────────────────────

function adaptAPIStudent(s: APIStudent): NormalizedStudent {
  return { id: s._id, name: s.name, email: s.email, avatar: s.avatar, joinedAt: s.joinedAt };
}

function adaptAPIProblem(p: APIProblem): NormalizedProblem {
  return {
    id: p._id,
    title: p.title,
    description: p.description,
    topic: p.topic,
    difficulty: p.difficulty,
    expectedOutput: p.expectedOutput,
    starterHtml: p.starterHtml,
    starterCss: p.starterCss,
    starterJs: p.starterJs,
    createdAt: p.createdAt,
  };
}

function adaptAPISubmission(s: APISubmission): NormalizedSubmission {
  return {
    id: s._id,
    studentId: typeof s.studentId === "string" ? s.studentId : s.studentId._id,
    problemId: typeof s.problemId === "string" ? s.problemId : s.problemId._id,
    htmlCode: s.htmlCode,
    cssCode: s.cssCode,
    jsCode: s.jsCode,
    score: s.score,
    isCorrect: s.isCorrect,
    submittedAt: s.submittedAt,
    timeSpent: s.timeSpent,
  };
}

function adaptAPILessonContent(lc: APILessonContent): NormalizedLessonContent {
  return {
    lessonId: lc.lessonId,
    task: lc.task,
    referenceImageUrl: lc.referenceImageUrl,
    starterHtml: lc.starterHtml,
    starterCss: lc.starterCss,
    starterJs: lc.starterJs,
    updatedAt: lc.updatedAt,
  };
}

function adaptLocalStudent(s: LocalStudent): NormalizedStudent {
  return { id: s.id, name: s.name, email: s.email, avatar: s.avatar, joinedAt: s.joinedAt };
}

function adaptLocalProblem(p: LocalProblem): NormalizedProblem {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    topic: p.topic,
    difficulty: p.difficulty,
    expectedOutput: p.expectedOutput,
    starterHtml: p.starterHtml,
    starterCss: p.starterCss,
    starterJs: p.starterJs,
    createdAt: p.createdAt,
  };
}

function adaptLocalSubmission(s: LocalSubmission): NormalizedSubmission {
  return {
    id: s.id,
    studentId: s.studentId,
    problemId: s.problemId,
    htmlCode: s.htmlCode,
    cssCode: s.cssCode,
    jsCode: s.jsCode,
    score: s.score,
    isCorrect: s.isCorrect,
    submittedAt: s.submittedAt,
    timeSpent: s.timeSpent,
  };
}

function adaptLocalLessonContent(lc: LocalLessonContent): NormalizedLessonContent {
  return {
    lessonId: lc.lessonId,
    task: lc.task,
    referenceImageUrl: lc.referenceImageUrl,
    starterHtml: lc.starterHtml,
    starterCss: lc.starterCss,
    starterJs: lc.starterJs,
    updatedAt: lc.updatedAt,
  };
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useStudents() {
  const [students, setStudents] = useState<NormalizedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await checkBackend();
      if (ok) {
        const data = await apiGetStudents();
        setStudents(data.map(adaptAPIStudent));
      } else {
        setStudents(getLocalStudents().map(adaptLocalStudent));
      }
    } catch {
      setStudents(getLocalStudents().map(adaptLocalStudent));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { students, loading, refresh };
}

export function useProblems() {
  const [problems, setProblems] = useState<NormalizedProblem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await checkBackend();
      if (ok) {
        const data = await apiGetProblems();
        setProblems(data.map(adaptAPIProblem));
      } else {
        setProblems(getLocalProblems().map(adaptLocalProblem));
      }
    } catch {
      setProblems(getLocalProblems().map(adaptLocalProblem));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { problems, loading, refresh };
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<NormalizedSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await checkBackend();
      if (ok) {
        const data = await apiGetSubmissions();
        setSubmissions(data.map(adaptAPISubmission));
      } else {
        setSubmissions(getLocalSubmissions().map(adaptLocalSubmission));
      }
    } catch {
      setSubmissions(getLocalSubmissions().map(adaptLocalSubmission));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { submissions, loading, refresh };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<APIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await checkBackend();
      if (ok) {
        const data = await apiGetAnalytics();
        setAnalytics(data);
      } else {
        // Build analytics from localStorage
        const topicAvg = localAvgScoreByTopic();
        const submissions = getLocalSubmissions();
        const students = getLocalStudents();
        const problems = getLocalProblems();
        setAnalytics({
          totalStudents: students.length,
          totalSubmissions: submissions.length,
          totalProblems: problems.length,
          avgScoreByTopic: topicAvg,
          difficultyCount: { Easy: 0, Medium: 0, Hard: 0 },
          dailySubmissions: [],
          hardestProblems: [],
          studentStats: students.map((s) => ({
            id: s.id,
            name: s.name,
            avatar: s.avatar,
            attempted: submissions.filter((sub) => sub.studentId === s.id).length,
            avg: (() => {
              const subs = submissions.filter((sub) => sub.studentId === s.id);
              return subs.length ? Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length) : 0;
            })(),
          })),
        });
      }
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { analytics, loading, refresh };
}

export function useLessonContent(lessonId: string | undefined) {
  const [content, setContent] = useState<NormalizedLessonContent | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!lessonId) { setContent(null); setLoading(false); return; }
    setLoading(true);
    try {
      const ok = await checkBackend();
      if (ok) {
        const data = await apiGetLessonContent(lessonId);
        setContent(data ? adaptAPILessonContent(data) : null);
      } else {
        const local = getLocalLessonContent(lessonId);
        setContent(local ? adaptLocalLessonContent(local) : null);
      }
    } catch {
      const local = getLocalLessonContent(lessonId);
      setContent(local ? adaptLocalLessonContent(local) : null);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { content, loading, refresh };
}

// ─── Mutation Helpers ──────────────────────────────────────────────────────

export async function hybridSaveProblem(problem: NormalizedProblem, isNew: boolean): Promise<void> {
  const ok = await checkBackend();
  if (ok) {
    const payload = {
      title: problem.title,
      description: problem.description,
      topic: problem.topic,
      difficulty: problem.difficulty,
      expectedOutput: problem.expectedOutput,
      starterHtml: problem.starterHtml,
      starterCss: problem.starterCss,
      starterJs: problem.starterJs,
    };
    if (isNew) {
      await apiCreateProblem(payload);
    } else {
      await apiUpdateProblem(problem.id, payload);
    }
  } else {
    saveLocalProblem({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      topic: problem.topic,
      difficulty: problem.difficulty,
      expectedOutput: problem.expectedOutput,
      starterHtml: problem.starterHtml,
      starterCss: problem.starterCss,
      starterJs: problem.starterJs,
      createdAt: problem.createdAt,
    });
  }
}

export async function hybridDeleteProblem(id: string): Promise<void> {
  const ok = await checkBackend();
  if (ok) {
    await apiDeleteProblem(id);
  } else {
    deleteLocalProblem(id);
  }
}

export async function hybridDeleteStudent(id: string): Promise<void> {
  const ok = await checkBackend();
  if (ok) {
    await apiDeleteStudent(id);
  }
}

export async function hybridSaveLessonContent(data: NormalizedLessonContent): Promise<void> {
  const ok = await checkBackend();
  if (ok) {
    await apiSaveLessonContent({
      lessonId: data.lessonId,
      task: data.task,
      referenceImageUrl: data.referenceImageUrl,
      starterHtml: data.starterHtml,
      starterCss: data.starterCss,
      starterJs: data.starterJs,
    });
  }
  // Always save locally too for offline access
  saveLocalLessonContent({
    lessonId: data.lessonId,
    task: data.task,
    referenceImageUrl: data.referenceImageUrl,
    starterHtml: data.starterHtml,
    starterCss: data.starterCss,
    starterJs: data.starterJs,
    updatedAt: data.updatedAt,
  });
}

export async function hybridClearLessonContent(lessonId: string): Promise<void> {
  const ok = await checkBackend();
  if (ok) {
    await apiDeleteLessonContent(lessonId);
  }
  clearLocalLessonContent(lessonId);
}
