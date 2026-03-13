// ─── Types ────────────────────────────────────────────────────────────────────

export type Topic = "HTML" | "CSS" | "JavaScript";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  difficulty: Difficulty;
  expectedOutput: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string; // initials-based
  joinedAt: string;
}

export interface Submission {
  id: string;
  studentId: string;
  problemId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  score: number; // 0–100
  isCorrect: boolean;
  submittedAt: string;
  timeSpent: number; // minutes
}

/**
 * Trainer-authored content for an individual syllabus lesson.
 * Stored by lessonId; overrides the default workspace content.
 */
export interface LessonContent {
  lessonId: string;
  task: string;           // task / question description shown to student
  referenceImageUrl: string; // base64 data URL of uploaded reference image
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  updatedAt: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const PROBLEMS_KEY = "amypo_problems";
const STUDENTS_KEY = "amypo_students";
const SUBMISSIONS_KEY = "amypo_submissions";
const LESSON_CONTENT_KEY = "amypo_lesson_content";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedProblems: Problem[] = [
  {
    id: "p1", title: "Personal Profile Page", topic: "HTML", difficulty: "Easy",
    description: "Create a personal profile page using semantic HTML. Include a heading with your name, a paragraph about yourself, an unordered list of hobbies, and a link to your favourite website.",
    expectedOutput: "A profile page with h1, p, ul, and an anchor tag.",
    starterHtml: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Profile</title></head>\n<body>\n  <!-- Add your content here -->\n</body>\n</html>`,
    starterCss: `body { font-family: sans-serif; }`,
    starterJs: "",
    createdAt: daysAgo(20),
  },
  {
    id: "p2", title: "Flexbox Navigation Bar", topic: "CSS", difficulty: "Easy",
    description: "Build a responsive navigation bar using CSS Flexbox. The nav should have a logo on the left and navigation links on the right. It should be horizontally aligned.",
    expectedOutput: "Logo left, nav links right, all in a horizontal flex row.",
    starterHtml: `<nav class="navbar">\n  <div class="logo">Brand</div>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>`,
    starterCss: `.navbar { display: flex; padding: 1rem; }\n/* Finish the layout */`,
    starterJs: "",
    createdAt: daysAgo(18),
  },
  {
    id: "p3", title: "Registration Form", topic: "HTML", difficulty: "Easy",
    description: "Create a registration form with fields: Full Name, Email, Password, Confirm Password, and a Submit button. Add basic HTML validation attributes.",
    expectedOutput: "Form with all 4 fields, labels, and a submit button with required attributes.",
    starterHtml: `<form>\n  <!-- Add form fields here -->\n</form>`,
    starterCss: `form { display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 2rem auto; }`,
    starterJs: "",
    createdAt: daysAgo(15),
  },
  {
    id: "p4", title: "Counter App", topic: "JavaScript", difficulty: "Easy",
    description: "Build a counter app with three buttons: Increment (+), Decrement (-), and Reset. Display the current count and update it when buttons are clicked.",
    expectedOutput: "Counter displaying current count, updated by three buttons.",
    starterHtml: `<div class="counter">\n  <h1 id="count">0</h1>\n  <button id="inc">+</button>\n  <button id="dec">-</button>\n  <button id="reset">Reset</button>\n</div>`,
    starterCss: `.counter { text-align: center; margin-top: 2rem; }`,
    starterJs: `const countEl = document.getElementById('count');\n// Add event listeners`,
    createdAt: daysAgo(12),
  },
  {
    id: "p5", title: "Responsive Card Grid", topic: "CSS", difficulty: "Medium",
    description: "Create a responsive card grid using CSS Grid. The grid should show 3 columns on desktop, 2 on tablet, and 1 on mobile. Each card should have an image placeholder, title, and description.",
    expectedOutput: "Responsive grid layout that adapts to screen size.",
    starterHtml: `<div class="grid">\n  <div class="card"><h3>Card 1</h3><p>Description</p></div>\n  <div class="card"><h3>Card 2</h3><p>Description</p></div>\n  <div class="card"><h3>Card 3</h3><p>Description</p></div>\n  <div class="card"><h3>Card 4</h3><p>Description</p></div>\n</div>`,
    starterCss: `.grid { display: grid; gap: 1rem; }\n/* Add responsive columns */`,
    starterJs: "",
    createdAt: daysAgo(10),
  },
  {
    id: "p6", title: "To-Do List App", topic: "JavaScript", difficulty: "Medium",
    description: "Build a To-Do List app where users can add tasks, mark them as complete (cross out text), and delete them. Use the DOM and event listeners.",
    expectedOutput: "Functional to-do list with add, complete toggle, and delete features.",
    starterHtml: `<div class="todo-app">\n  <input id="input" type="text" placeholder="Add a task...">\n  <button id="add">Add</button>\n  <ul id="list"></ul>\n</div>`,
    starterCss: `.todo-app { max-width: 400px; margin: 2rem auto; }\n.done { text-decoration: line-through; color: #999; }`,
    starterJs: `const input = document.getElementById('input');\nconst addBtn = document.getElementById('add');\nconst list = document.getElementById('list');\n// Add your code here`,
    createdAt: daysAgo(8),
  },
  {
    id: "p7", title: "Fetch & Display Users", topic: "JavaScript", difficulty: "Hard",
    description: "Use the Fetch API to get user data from https://jsonplaceholder.typicode.com/users and display each user's name and email in a card layout. Handle loading and error states.",
    expectedOutput: "Cards showing 10 user names and emails fetched from the API.",
    starterHtml: `<div id="users" class="grid"></div>\n<p id="status">Loading...</p>`,
    starterCss: `.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; padding: 1rem; }`,
    starterJs: `async function fetchUsers() {\n  // Fetch from https://jsonplaceholder.typicode.com/users\n}\nfetchUsers();`,
    createdAt: daysAgo(5),
  },
  {
    id: "p8", title: "CSS Animations", topic: "CSS", difficulty: "Hard",
    description: "Create a loading spinner animation using only CSS @keyframes and a bouncing ball animation. Both should loop continuously.",
    expectedOutput: "A spinner and a bouncing ball, both animated with pure CSS.",
    starterHtml: `<div class="spinner"></div>\n<div class="ball"></div>`,
    starterCss: `.spinner { width: 50px; height: 50px; border: 4px solid #ccc; border-top-color: #7c3aed; border-radius: 50%; }\n.ball { width: 30px; height: 30px; background: #0ea5e9; border-radius: 50%; margin-top: 2rem; }\n/* Add animations */`,
    starterJs: "",
    createdAt: daysAgo(3),
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
export function seedIfNeeded() {
  // Only seed example problems (trainer templates) — never fake students/submissions.
  if (!localStorage.getItem(PROBLEMS_KEY)) {
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(seedProblems));
  }

  // Actively clear any previously seeded fake students & submissions.
  const hadFakeStudents = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]") as Student[];
      return s.some((x) => x.id.startsWith("s") && Number(x.id.slice(1)) <= 10);
    } catch { return false; }
  })();
  if (hadFakeStudents) {
    localStorage.removeItem(STUDENTS_KEY);
    localStorage.removeItem(SUBMISSIONS_KEY);
  }

  // Initialise collections to empty arrays if not yet present.
  if (!localStorage.getItem(STUDENTS_KEY))   localStorage.setItem(STUDENTS_KEY,   "[]");
  if (!localStorage.getItem(SUBMISSIONS_KEY)) localStorage.setItem(SUBMISSIONS_KEY, "[]");
}


// ─── CRUD – Problems ──────────────────────────────────────────────────────────
export function getProblems(): Problem[] {
  return JSON.parse(localStorage.getItem(PROBLEMS_KEY) || "[]");
}
export function saveProblem(p: Problem) {
  const all = getProblems();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx >= 0) all[idx] = p;
  else all.push({ ...p, id: uid(), createdAt: new Date().toISOString() });
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(all));
}
export function deleteProblem(id: string) {
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(getProblems().filter((p) => p.id !== id)));
}

// ─── CRUD – Students ──────────────────────────────────────────────────────────
export function getStudents(): Student[] {
  return JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]");
}

// ─── CRUD – Submissions ───────────────────────────────────────────────────────
export function getSubmissions(): Submission[] {
  return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]");
}
export function getSubmissionsForStudent(studentId: string): Submission[] {
  return getSubmissions().filter((s) => s.studentId === studentId);
}
export function getSubmissionsForProblem(problemId: string): Submission[] {
  return getSubmissions().filter((s) => s.problemId === problemId);
}

// ─── Analytics helpers ────────────────────────────────────────────────────────
export function avgScoreByTopic(): Record<Topic, number> {
  const subs = getSubmissions();
  const probs = getProblems();
  const grouped: Record<Topic, number[]> = { HTML: [], CSS: [], JavaScript: [] };
  subs.forEach((s) => {
    const p = probs.find((pr) => pr.id === s.problemId);
    if (p) grouped[p.topic].push(s.score);
  });
  return {
    HTML: grouped.HTML.length ? Math.round(grouped.HTML.reduce((a, b) => a + b, 0) / grouped.HTML.length) : 0,
    CSS: grouped.CSS.length ? Math.round(grouped.CSS.reduce((a, b) => a + b, 0) / grouped.CSS.length) : 0,
    JavaScript: grouped.JavaScript.length ? Math.round(grouped.JavaScript.reduce((a, b) => a + b, 0) / grouped.JavaScript.length) : 0,
  };
}

export function studentAvgScore(studentId: string): number {
  const subs = getSubmissionsForStudent(studentId);
  if (!subs.length) return 0;
  return Math.round(subs.reduce((a, b) => a + b.score, 0) / subs.length);
}

export function studentWeakTopic(studentId: string): Topic | null {
  const subs = getSubmissionsForStudent(studentId);
  const probs = getProblems();
  const grouped: Record<Topic, number[]> = { HTML: [], CSS: [], JavaScript: [] };
  subs.forEach((s) => {
    const p = probs.find((pr) => pr.id === s.problemId);
    if (p) grouped[p.topic].push(s.score);
  });
  let weakTopic: Topic | null = null;
  let weakScore = Infinity;
  (Object.keys(grouped) as Topic[]).forEach((t) => {
    if (!grouped[t].length) return;
    const avg = grouped[t].reduce((a, b) => a + b, 0) / grouped[t].length;
    if (avg < weakScore) { weakScore = avg; weakTopic = t; }
  });
  return weakTopic;
}

export function studentTopicScores(studentId: string): Record<Topic, number> {
  const subs = getSubmissionsForStudent(studentId);
  const probs = getProblems();
  const grouped: Record<Topic, number[]> = { HTML: [], CSS: [], JavaScript: [] };
  subs.forEach((s) => {
    const p = probs.find((pr) => pr.id === s.problemId);
    if (p) grouped[p.topic].push(s.score);
  });
  return {
    HTML: grouped.HTML.length ? Math.round(grouped.HTML.reduce((a, b) => a + b, 0) / grouped.HTML.length) : 0,
    CSS: grouped.CSS.length ? Math.round(grouped.CSS.reduce((a, b) => a + b, 0) / grouped.CSS.length) : 0,
    JavaScript: grouped.JavaScript.length ? Math.round(grouped.JavaScript.reduce((a, b) => a + b, 0) / grouped.JavaScript.length) : 0,
  };
}

// ─── CRUD – Lesson Content Overrides ─────────────────────────────────────────
function getAllLessonContent(): Record<string, LessonContent> {
  return JSON.parse(localStorage.getItem(LESSON_CONTENT_KEY) || "{}");
}

export function getLessonContent(lessonId: string): LessonContent | null {
  return getAllLessonContent()[lessonId] ?? null;
}

export function saveLessonContent(content: LessonContent) {
  const all = getAllLessonContent();
  all[content.lessonId] = content;
  localStorage.setItem(LESSON_CONTENT_KEY, JSON.stringify(all));
}

export function clearLessonContent(lessonId: string) {
  const all = getAllLessonContent();
  delete all[lessonId];
  localStorage.setItem(LESSON_CONTENT_KEY, JSON.stringify(all));
}

