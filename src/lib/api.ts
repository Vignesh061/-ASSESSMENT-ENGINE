// ─── API Service Layer ──────────────────────────────────────────────────────
// Communicates with the Express + MongoDB backend.
// Falls back to localStorage if the backend is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

// ─── Student API ─────────────────────────────────────────────────────────────

export interface APIStudent {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
}

export async function apiGetStudents(): Promise<APIStudent[]> {
  return request<APIStudent[]>("/students");
}

export async function apiGetStudent(id: string): Promise<{ student: APIStudent; submissions: APISubmission[] }> {
  return request(`/students/${id}`);
}

export async function apiCreateStudent(name: string, email: string): Promise<APIStudent> {
  return request<APIStudent>("/students", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
}

export async function apiDeleteStudent(id: string): Promise<void> {
  await request(`/students/${id}`, { method: "DELETE" });
}

// ─── Problem API ─────────────────────────────────────────────────────────────

export interface APIProblem {
  _id: string;
  title: string;
  description: string;
  topic: "HTML" | "CSS" | "JavaScript";
  difficulty: "Easy" | "Medium" | "Hard";
  expectedOutput: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  referenceHtml: string;
  referenceCss: string;
  referenceJs: string;
  referenceImageUrl: string;
  createdAt: string;
}

export async function apiGetProblems(): Promise<APIProblem[]> {
  return request<APIProblem[]>("/problems");
}

export async function apiGetProblem(id: string): Promise<APIProblem> {
  return request<APIProblem>(`/problems/${id}`);
}

export async function apiCreateProblem(data: Partial<APIProblem>): Promise<APIProblem> {
  return request<APIProblem>("/problems", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProblem(id: string, data: Partial<APIProblem>): Promise<APIProblem> {
  return request<APIProblem>(`/problems/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteProblem(id: string): Promise<void> {
  await request(`/problems/${id}`, { method: "DELETE" });
}

// ─── Submission API ──────────────────────────────────────────────────────────

export interface APITestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
}

export interface APISubmission {
  _id: string;
  studentId: string | APIStudent;
  problemId: string | APIProblem;
  lessonId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  score: number;
  isCorrect: boolean;
  testResults: APITestResult[];
  feedback: string[];
  submittedAt: string;
  timeSpent: number;
}

export interface APIEvaluationResponse {
  submission: APISubmission;
  evaluation: {
    score: number;
    isCorrect: boolean;
    testResults: APITestResult[];
    feedback: string[];
    visualMatchPercent: number;
    studentScreenshot: string;
    referenceScreenshot: string;
    visualDiffScreenshot?: string;
    visualDiffHeatmap?: string;
  };
}

export async function apiSubmitCode(data: {
  studentId: string;
  problemId?: string;
  lessonId?: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  timeSpent?: number;
}): Promise<APIEvaluationResponse> {
  return request<APIEvaluationResponse>("/submissions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetSubmissions(): Promise<APISubmission[]> {
  return request<APISubmission[]>("/submissions");
}

export async function apiGetStudentSubmissions(studentId: string): Promise<APISubmission[]> {
  return request<APISubmission[]>(`/submissions/student/${studentId}`);
}

export async function apiGetProblemSubmissions(problemId: string): Promise<APISubmission[]> {
  return request<APISubmission[]>(`/submissions/problem/${problemId}`);
}

// ─── Lesson Content API ─────────────────────────────────────────────────────

export interface APILessonContent {
  _id: string;
  lessonId: string;
  task: string;
  referenceImageUrl: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  referenceHtml: string;
  referenceCss: string;
  referenceJs: string;
  updatedAt: string;
}

export async function apiGetLessonContent(lessonId: string): Promise<APILessonContent | null> {
  try {
    return await request<APILessonContent>(`/lesson-content/${lessonId}`);
  } catch {
    return null;
  }
}

export async function apiSaveLessonContent(data: Partial<APILessonContent>): Promise<APILessonContent> {
  return request<APILessonContent>("/lesson-content", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteLessonContent(lessonId: string): Promise<void> {
  await request(`/lesson-content/${lessonId}`, { method: "DELETE" });
}

// ─── Analytics API ──────────────────────────────────────────────────────────

export interface APIAnalytics {
  totalStudents: number;
  totalSubmissions: number;
  totalProblems: number;
  avgScoreByTopic: Record<string, number>;
  difficultyCount: Record<string, number>;
  dailySubmissions: { day: string; count: number }[];
  hardestProblems: { id: string; title: string; avg: number; attempts: number }[];
  studentStats: { id: string; name: string; avatar: string; attempted: number; avg: number }[];
}

export async function apiGetAnalytics(): Promise<APIAnalytics> {
  return request<APIAnalytics>("/analytics");
}

// ─── Health Check ───────────────────────────────────────────────────────────

export async function apiHealthCheck(): Promise<boolean> {
  try {
    await request("/health");
    return true;
  } catch {
    return false;
  }
}
