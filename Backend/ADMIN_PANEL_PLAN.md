# Admin Panel — Writing & Speaking Grading

## Overview

A simple admin page where you can view pending writing/speaking submissions, grade them (manually or using Claude), and publish scores. Users see "Your answer is being reviewed by our tutor" until graded.

---

## Database Models

### WritingSubmission
```
- user (ref User)
- testId (string, e.g. "book-11-writing-test-1")
- taskNumber (1 or 2)
- prompt (string — the question/task shown to user)
- response (string — user's written answer)
- wordCount (number)
- timeSpent (number, seconds)
- status: 'pending' | 'graded'
- bandScore (number, null until graded)
- feedback (object, null until graded)
  - taskAchievement: number
  - coherence: number
  - lexicalResource: number
  - grammar: number
  - comments: string
- gradedAt (date)
- submittedAt (date)
```

### SpeakingSubmission
```
- user (ref User)
- testId (string)
- partNumber (1, 2, or 3)
- prompt (string — the question asked)
- audioUrl (string — recorded audio, stored as base64 or uploaded to storage)
- transcript (string — user can optionally type what they said, or AI transcribes later)
- status: 'pending' | 'graded'
- bandScore (number, null until graded)
- feedback (object, null until graded)
  - fluency: number
  - lexicalResource: number
  - grammar: number
  - pronunciation: number
  - comments: string
- gradedAt (date)
- submittedAt (date)
```

---

## API Endpoints

### User-facing (require auth)
```
POST /api/writing/submit          — submit a writing response
GET  /api/writing/submissions     — list user's own submissions with status
GET  /api/writing/submissions/:id — get a specific submission (with feedback if graded)

POST /api/speaking/submit         — submit a speaking response
GET  /api/speaking/submissions    — list user's own submissions
GET  /api/speaking/submissions/:id
```

### Admin-facing (require auth + admin role)
```
GET   /api/admin/submissions?status=pending&skill=writing  — list all pending submissions
GET   /api/admin/submissions/:id                           — get full submission detail
PATCH /api/admin/submissions/:id/grade                     — submit grade + feedback
```

---

## Admin Panel (Simple Frontend Page)

### Route: `/admin` (protected, admin only)

### Layout:
```
┌─────────────────────────────────────────────┐
│  Admin — Pending Submissions                │
├──────────┬──────────────────────────────────┤
│ Filters  │  Submissions List               │
│          │                                  │
│ Writing  │  #1 — Areeb Abbas               │
│ Speaking │  C11 Writing Task 1             │
│          │  Submitted: Jul 13, 2026         │
│ Pending  │  Word count: 267                │
│ Graded   │  [View & Grade]                 │
│          │                                  │
│          │  #2 — John Doe                  │
│          │  C12 Writing Task 2             │
│          │  Submitted: Jul 13, 2026         │
│          │  Word count: 312                │
│          │  [View & Grade]                 │
└──────────┴──────────────────────────────────┘
```

### Grade View:
```
┌─────────────────────────────────────────────┐
│  Grade Submission — C11 Writing Task 1      │
├─────────────────────────────────────────────┤
│  Student: Areeb Abbas                       │
│  Prompt: "Some people think that..."        │
│                                             │
│  Student's Response:                        │
│  ┌─────────────────────────────────────┐    │
│  │ The student's written text shows    │    │
│  │ here in a readable format...        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Copy to Clipboard] ← paste into Claude    │
│                                             │
│  Grade:                                     │
│  Task Achievement:  [___] / 9               │
│  Coherence:         [___] / 9               │
│  Lexical Resource:  [___] / 9               │
│  Grammar:           [___] / 9               │
│  Overall Band:      auto-calculated         │
│                                             │
│  Comments:                                  │
│  ┌─────────────────────────────────────┐    │
│  │ Paste Claude's feedback here...     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Submit Grade]                             │
└─────────────────────────────────────────────┘
```

---

## Admin Role

Add `role` field to User model:
```
role: { type: String, enum: ['user', 'admin'], default: 'user' }
```

Admin middleware:
```js
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};
```

Set yourself as admin directly in MongoDB Atlas:
```
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## User Experience

### Before submission:
- User sees writing/speaking test with prompt
- User writes response (writing) or records audio (speaking)
- Clicks submit

### After submission:
- User sees: "Your answer has been submitted and is being reviewed by our tutor. You'll receive feedback within 24-48 hours."
- On progress page: shows as "Pending Review" with a clock icon

### After grading:
- User sees band score + detailed feedback breakdown
- Notification (toast or badge) that feedback is ready

---

## Implementation Order

1. **WritingSubmission model** — 30 min
2. **Submit endpoint** — 30 min
3. **User submissions list endpoint** — 20 min
4. **Admin list + grade endpoints** — 45 min
5. **Admin page (frontend)** — 2-3 hours
6. **Writing test page (frontend)** — 2-3 hours
7. **Speaking** — same pattern, add after writing works

Total estimate: ~1-2 days for the full writing flow with admin panel.

---

## Grading Workflow (Manual with Claude)

1. Open admin panel → see pending submissions
2. Click a submission → see student's response
3. Click "Copy to Clipboard" → paste into Claude (free at claude.ai)
4. Use this prompt with Claude:

```
You are an IELTS examiner. Grade this IELTS Writing Task [1/2] response.

Give scores out of 9 for:
- Task Achievement
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

Then give an overall band score and detailed feedback explaining what the student did well and what they need to improve.

Student's response:
[paste here]
```

5. Copy Claude's scores and feedback back into the admin panel
6. Click "Submit Grade" → student sees their result
