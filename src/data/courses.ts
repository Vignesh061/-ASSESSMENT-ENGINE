export interface Lesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Level {
  name: string;
  lessons: Lesson[];
  progress: number;
  project?: string;
}

export interface Course {
  id: string;
  title: string;
  icon: string;
  levels: Level[];
}

const makeLessons = (prefix: string, titles: string[]): Lesson[] =>
  titles.map((title, i) => ({
    id: `${prefix}-${i}`,
    title,
    description: `Learn about ${title.toLowerCase()} in depth.`,
    completed: Math.random() > 0.6,
  }));

export const courses: Course[] = [
  {
    id: "frontend",
    title: "Frontend Web Development",
    icon: "🌐",
    levels: [
      {
        name: "Level 1 – Web Basics",
        progress: 75,
        project: "Personal Profile Webpage",
        lessons: makeLessons("l1", [
          "Introduction to Web & Browser",
          "HTML Document Structure",
          "Headings & Paragraphs",
          "Links & Images",
          "Lists (ul, ol, li)",
          "Basic Page Creation",
          "CSS Syntax & Selectors",
          "Colors",
          "Fonts & Text Styling",
          "Background Properties",
          "Introduction to JavaScript",
          "console.log()",
          "Variables (let, const)",
          "Data Types",
          "Basic Operators",
        ]),
      },
      {
        name: "Level 2 – Page Structure & Logic",
        progress: 55,
        project: "Registration Form",
        lessons: makeLessons("l2", [
          "Semantic Tags (header, nav, section, footer)",
          "Tables",
          "Forms Basics",
          "Input Elements",
          "Box Model",
          "Margin & Padding",
          "Borders",
          "Display Property",
          "Position Basics",
          "Conditions (if, else, switch)",
          "Loops (for, while)",
          "Functions",
          "Basic Problem Solving",
        ]),
      },
      {
        name: "Level 3 – Responsive Design",
        progress: 40,
        project: "Responsive Landing Page",
        lessons: makeLessons("l3", [
          "Accessibility Basics",
          "Form Validation Attributes",
          "Flexbox",
          "Responsive Units (%, rem, em, vh, vw)",
          "Media Queries",
          "Mobile-First Design",
          "Arrays",
          "Objects",
          "Introduction to DOM",
          "Selecting Elements",
        ]),
      },
      {
        name: "Level 4 – Interactivity (DOM Manipulation)",
        progress: 20,
        project: "To-Do List App, Calculator, Digital Clock",
        lessons: makeLessons("l4", [
          "Data Attributes",
          "SEO Basics",
          "Transitions",
          "Hover Effects",
          "Basic Animations",
          "DOM Manipulation",
          "Event Listeners",
          "Form Validation using JS",
          "Local Storage",
          "JSON Basics",
        ]),
      },
      {
        name: "Level 5 – Advanced JavaScript",
        progress: 10,
        project: "Weather App (API), Movie Search App, GitHub Profile Viewer",
        lessons: makeLessons("l5", [
          "Scope",
          "Closures",
          "Hoisting",
          "Execution Context",
          "Callbacks",
          "Promises",
          "Async & Await",
          "Fetch API",
          "Error Handling",
          "Arrow Functions (ES6)",
          "Destructuring",
          "Spread Operator",
          "Modules",
          "CSS Grid",
          "CSS Variables",
          "Advanced Animations",
        ]),
      },
      {
        name: "Level 6 – Professional Frontend Skills",
        progress: 5,
        project: "Portfolio Website, Blog Website, Admin Dashboard UI",
        lessons: makeLessons("l6", [
          "Call Stack",
          "Event Loop",
          "Rendering Process",
          "Git Basics",
          "GitHub Workflow",
          "NPM Basics",
          "Package.json",
          "DevTools Debugging",
          "Optimization Basics",
          "Lazy Loading",
          "Responsive Images",
        ]),
      },
      {
        name: "Level 7 – Next Step (React.js)",
        progress: 0,
        project: "Full React App",
        lessons: makeLessons("l7", [
          "Components",
          "Props",
          "State",
          "Hooks",
          "API Integration",
          "Project Structure",
        ]),
      },
    ],
  },
];
