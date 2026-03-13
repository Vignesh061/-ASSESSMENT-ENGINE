import "dotenv/config";
import mongoose from "mongoose";
import Problem from "./models/Problem.js";
import Student from "./models/Student.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/amypo-ai-learn";

const seedProblems = [
  {
    title: "Personal Profile Page",
    topic: "HTML",
    difficulty: "Easy",
    description:
      "Create a personal profile page using semantic HTML. Include a heading with your name, a paragraph about yourself, an unordered list of hobbies, and a link to your favourite website.",
    expectedOutput: "A profile page with h1, p, ul, and an anchor tag.",
    starterHtml: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Profile</title></head>\n<body>\n  <!-- Add your content here -->\n</body>\n</html>`,
    starterCss: `body { font-family: sans-serif; }`,
    starterJs: "",
    referenceHtml: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Profile</title></head>\n<body>\n  <h1>John Doe</h1>\n  <p>I am a web developer who loves coding and technology.</p>\n  <h2>My Hobbies</h2>\n  <ul>\n    <li>Coding</li>\n    <li>Reading</li>\n    <li>Gaming</li>\n  </ul>\n  <a href="https://example.com">My Favorite Website</a>\n</body>\n</html>`,
    referenceCss: `body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; } h1 { color: #333; } ul { padding-left: 1.5rem; } a { color: #7c3aed; }`,
    referenceJs: "",
  },
  {
    title: "Flexbox Navigation Bar",
    topic: "CSS",
    difficulty: "Easy",
    description:
      "Build a responsive navigation bar using CSS Flexbox. The nav should have a logo on the left and navigation links on the right. It should be horizontally aligned.",
    expectedOutput: "Logo left, nav links right, all in a horizontal flex row.",
    starterHtml: `<nav class="navbar">\n  <div class="logo">Brand</div>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>`,
    starterCss: `.navbar { display: flex; padding: 1rem; }\n/* Finish the layout */`,
    starterJs: "",
    referenceHtml: `<nav class="navbar">\n  <div class="logo">Brand</div>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>`,
    referenceCss: `.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #1e293b; } .logo { font-size: 1.5rem; font-weight: bold; color: #f1f5f9; } ul { display: flex; list-style: none; gap: 1.5rem; margin: 0; padding: 0; } a { color: #94a3b8; text-decoration: none; } a:hover { color: #f1f5f9; }`,
    referenceJs: "",
  },
  {
    title: "Registration Form",
    topic: "HTML",
    difficulty: "Easy",
    description:
      "Create a registration form with fields: Full Name, Email, Password, Confirm Password, and a Submit button. Add basic HTML validation attributes.",
    expectedOutput: "Form with all 4 fields, labels, and a submit button with required attributes.",
    starterHtml: `<form>\n  <!-- Add form fields here -->\n</form>`,
    starterCss: `form { display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 2rem auto; }`,
    starterJs: "",
    referenceHtml: `<form>\n  <label>Full Name <input type="text" name="name" required></label>\n  <label>Email <input type="email" name="email" required></label>\n  <label>Password <input type="password" name="password" required minlength="6"></label>\n  <label>Confirm Password <input type="password" name="confirm" required></label>\n  <button type="submit">Register</button>\n</form>`,
    referenceCss: `form { display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 2rem auto; } label { display: flex; flex-direction: column; font-size: 0.9rem; color: #334155; } input { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; } button { padding: 0.75rem; background: #7c3aed; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; } button:hover { background: #6d28d9; }`,
    referenceJs: "",
  },
  {
    title: "Counter App",
    topic: "JavaScript",
    difficulty: "Easy",
    description:
      "Build a counter app with three buttons: Increment (+), Decrement (-), and Reset. Display the current count and update it when buttons are clicked.",
    expectedOutput: "Counter displaying current count, updated by three buttons.",
    starterHtml: `<div class="counter">\n  <h1 id="count">0</h1>\n  <button id="inc">+</button>\n  <button id="dec">-</button>\n  <button id="reset">Reset</button>\n</div>`,
    starterCss: `.counter { text-align: center; margin-top: 2rem; }`,
    starterJs: `const countEl = document.getElementById('count');\n// Add event listeners`,
    referenceHtml: `<div class="counter">\n  <h1 id="count">0</h1>\n  <button id="inc">+</button>\n  <button id="dec">-</button>\n  <button id="reset">Reset</button>\n</div>`,
    referenceCss: `.counter { text-align: center; margin-top: 2rem; font-family: sans-serif; } h1 { font-size: 3rem; color: #1e293b; } button { padding: 0.75rem 1.5rem; margin: 0.5rem; font-size: 1.25rem; border: none; border-radius: 8px; cursor: pointer; background: #7c3aed; color: white; } button:hover { background: #6d28d9; }`,
    referenceJs: `const countEl = document.getElementById('count');\nlet count = 0;\ndocument.getElementById('inc').addEventListener('click', () => { count++; countEl.textContent = count; });\ndocument.getElementById('dec').addEventListener('click', () => { count--; countEl.textContent = count; });\ndocument.getElementById('reset').addEventListener('click', () => { count = 0; countEl.textContent = count; });`,
  },
  {
    title: "Responsive Card Grid",
    topic: "CSS",
    difficulty: "Medium",
    description:
      "Create a responsive card grid using CSS Grid. The grid should show 3 columns on desktop, 2 on tablet, and 1 on mobile. Each card should have a title and description.",
    expectedOutput: "Responsive grid layout that adapts to screen size.",
    starterHtml: `<div class="grid">\n  <div class="card"><h3>Card 1</h3><p>Description</p></div>\n  <div class="card"><h3>Card 2</h3><p>Description</p></div>\n  <div class="card"><h3>Card 3</h3><p>Description</p></div>\n  <div class="card"><h3>Card 4</h3><p>Description</p></div>\n</div>`,
    starterCss: `.grid { display: grid; gap: 1rem; }\n/* Add responsive columns */`,
    starterJs: "",
    referenceHtml: `<div class="grid">\n  <div class="card"><h3>Card 1</h3><p>Description</p></div>\n  <div class="card"><h3>Card 2</h3><p>Description</p></div>\n  <div class="card"><h3>Card 3</h3><p>Description</p></div>\n  <div class="card"><h3>Card 4</h3><p>Description</p></div>\n</div>`,
    referenceCss: `.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; padding: 2rem; } .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; } .card h3 { margin: 0 0 0.5rem; color: #1e293b; } .card p { margin: 0; color: #64748b; font-size: 0.9rem; }`,
    referenceJs: "",
  },
  {
    title: "To-Do List App",
    topic: "JavaScript",
    difficulty: "Medium",
    description:
      "Build a To-Do List app where users can add tasks, mark them as complete (cross out text), and delete them. Use the DOM and event listeners.",
    expectedOutput: "Functional to-do list with add, complete toggle, and delete features.",
    starterHtml: `<div class="todo-app">\n  <input id="input" type="text" placeholder="Add a task...">\n  <button id="add">Add</button>\n  <ul id="list"></ul>\n</div>`,
    starterCss: `.todo-app { max-width: 400px; margin: 2rem auto; }\n.done { text-decoration: line-through; color: #999; }`,
    starterJs: `const input = document.getElementById('input');\nconst addBtn = document.getElementById('add');\nconst list = document.getElementById('list');\n// Add your code here`,
    referenceHtml: `<div class="todo-app">\n  <input id="input" type="text" placeholder="Add a task...">\n  <button id="add">Add</button>\n  <ul id="list"></ul>\n</div>`,
    referenceCss: `.todo-app { max-width: 400px; margin: 2rem auto; font-family: sans-serif; } input { padding: 0.5rem; width: 70%; border: 1px solid #cbd5e1; border-radius: 4px; } button { padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 4px; cursor: pointer; } li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; } .done { text-decoration: line-through; color: #999; }`,
    referenceJs: `const input = document.getElementById('input');\nconst addBtn = document.getElementById('add');\nconst list = document.getElementById('list');\naddBtn.addEventListener('click', () => {\n  const text = input.value.trim();\n  if (!text) return;\n  const li = document.createElement('li');\n  li.innerHTML = '<span>' + text + '</span><button class="del">X</button>';\n  li.querySelector('span').addEventListener('click', () => li.querySelector('span').classList.toggle('done'));\n  li.querySelector('.del').addEventListener('click', () => li.remove());\n  list.appendChild(li);\n  input.value = '';\n});`,
  },
  {
    title: "Fetch & Display Users",
    topic: "JavaScript",
    difficulty: "Hard",
    description:
      "Use the Fetch API to get user data from https://jsonplaceholder.typicode.com/users and display each user's name and email in a card layout. Handle loading and error states.",
    expectedOutput: "Cards showing 10 user names and emails fetched from the API.",
    starterHtml: `<div id="users" class="grid"></div>\n<p id="status">Loading...</p>`,
    starterCss: `.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; padding: 1rem; }`,
    starterJs: `async function fetchUsers() {\n  // Fetch from https://jsonplaceholder.typicode.com/users\n}\nfetchUsers();`,
    referenceHtml: `<div id="users" class="grid"></div>\n<p id="status">Loading...</p>`,
    referenceCss: `.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; padding: 1rem; } .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; } .card h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #1e293b; } .card p { margin: 0; font-size: 0.85rem; color: #64748b; }`,
    referenceJs: `async function fetchUsers() {\n  const status = document.getElementById('status');\n  try {\n    const res = await fetch('https://jsonplaceholder.typicode.com/users');\n    const users = await res.json();\n    const container = document.getElementById('users');\n    container.innerHTML = users.map(u => '<div class="card"><h3>' + u.name + '</h3><p>' + u.email + '</p></div>').join('');\n    status.textContent = users.length + ' users loaded';\n  } catch(e) { status.textContent = 'Error: ' + e.message; }\n}\nfetchUsers();`,
  },
  {
    title: "CSS Animations",
    topic: "CSS",
    difficulty: "Hard",
    description:
      "Create a loading spinner animation using only CSS @keyframes and a bouncing ball animation. Both should loop continuously.",
    expectedOutput: "A spinner and a bouncing ball, both animated with pure CSS.",
    starterHtml: `<div class="spinner"></div>\n<div class="ball"></div>`,
    starterCss: `.spinner { width: 50px; height: 50px; border: 4px solid #ccc; border-top-color: #7c3aed; border-radius: 50%; }\n.ball { width: 30px; height: 30px; background: #0ea5e9; border-radius: 50%; margin-top: 2rem; }\n/* Add animations */`,
    starterJs: "",
    referenceHtml: `<div class="demo"><div class="spinner"></div>\n<div class="ball"></div></div>`,
    referenceCss: `.demo { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 2rem; } .spinner { width: 50px; height: 50px; border: 4px solid #ccc; border-top-color: #7c3aed; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } .ball { width: 30px; height: 30px; background: #0ea5e9; border-radius: 50%; animation: bounce 0.6s ease-in-out infinite alternate; } @keyframes bounce { to { transform: translateY(-60px); } }`,
    referenceJs: "",
  },
];

export async function seedDatabase() {
  // Seed problems
  const existingCount = await Problem.countDocuments();
  if (existingCount === 0) {
    await Problem.insertMany(seedProblems);
    console.log(`Seeded ${seedProblems.length} problems.`);
  } else {
    console.log(`${existingCount} problems already exist, skipping seed.`);
  }

  // Ensure at least one demo student exists
  const studentCount = await Student.countDocuments();
  if (studentCount === 0) {
    await Student.create({
      name: "Demo Student",
      email: "demo@amypo.com",
    });
    console.log("Created demo student.");
  }
}

