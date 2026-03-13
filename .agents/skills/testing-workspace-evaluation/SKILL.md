# Testing: Workspace Evaluation & Visual Comparison

## Overview
The amypo-engine has a student workspace where code is submitted and evaluated against trainer reference code/images using Puppeteer screenshots and pixelmatch.

## Environment Setup

### Backend (Express + MongoDB)
1. `cd server && npm install`
2. `npm run dev` — starts on port 5000 with in-memory MongoDB (no external DB needed)
3. The server auto-seeds 8 problems and a demo student on startup

### Frontend (Vite + React)
1. `cd <repo-root> && npm install`
2. `npm run dev` — starts on port 8080
3. Frontend connects to backend at `http://localhost:5000/api` by default

## Triggering Visual Comparison

The visual comparison (heatmap, pixelmatch diff) only runs when the backend finds **reference code or a reference image** for the submitted lesson/problem.

### Option A: Seed LessonContent via API
For syllabus lessons (e.g. `l1-0`, `l2-3`), create a LessonContent entry:
```bash
curl -X POST http://localhost:5000/api/lesson-content \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "l1-0",
    "task": "Create a profile page...",
    "referenceHtml": "<h1>John Doe</h1>...",
    "referenceCss": "body { font-family: sans-serif; }",
    "referenceJs": ""
  }'
```
Then navigate to `http://localhost:8080/workspace/l1-0` and submit code.

### Option B: Use seeded Problems
The 8 seeded problems have MongoDB ObjectIds (not the localStorage `p1`-`p8` ids). To use them:
1. `curl http://localhost:5000/api/problems` to get the MongoDB `_id` values
2. Submit directly via API with the `problemId` field

**Note**: The frontend workspace uses localStorage problem IDs (`p1`, `p2`, ...) which don't map to MongoDB ObjectIds. For end-to-end UI testing, Option A (LessonContent) is the easier path.

## Key UI Navigation
- Dashboard: `http://localhost:8080/dashboard`
- Workspace: `http://localhost:8080/workspace/{lessonId}`
- Trainer login: `http://localhost:8080/trainer/login`
- Trainer dashboard: `http://localhost:8080/trainer/dashboard`

## What to Verify in Results Panel
- Score and pass/fail counts render
- Visual Match percentage appears
- Student screenshot and Trainer Reference screenshot both display
- Toggle buttons (Original / Heatmap / Raw Diff) appear and switch views correctly
- Color legend appears only in Heatmap mode

## Known Quirks
- The Problem panel on the frontend reads from localStorage, not from the backend API. So even after seeding LessonContent via API, the Problem panel may show "No reference image yet" — this is expected; the backend still uses the seeded reference for comparison.
- The in-memory MongoDB resets on server restart, so LessonContent entries need to be re-seeded each time.
- The "Raw Diff" toggle button may be truncated in narrow panel widths.

## Devin Secrets Needed
None — the app runs fully locally with in-memory MongoDB.
