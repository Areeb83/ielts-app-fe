# Backend Overview — Simple Explanation

> This document explains the backend in plain English. No code, just concepts, tables, and how everything connects.

---

## What Does the Backend Do?

The backend is the **server** that sits between the app and the database. It handles 4 main jobs:

| Job | What it does |
|-----|-------------|
| **User Accounts** | Register, login, keep users logged in with tokens |
| **Serve Tests** | Send test questions to the app when a user opens a test |
| **Score Tests** | Receive user answers, compare with correct answers, return the score |
| **Track Progress** | Remember which tests a user has done, their scores, and band history |

The golden rule: **correct answers never leave the server**. The app only finds out "right or wrong" per question — never the actual answer.

---

## The Tables (Think of Them as Spreadsheets)

There are **11 tables** in the database. Each one stores a different type of information.

### Group 1 — Who is using the app?

| Table | What it stores | Example row |
|-------|---------------|-------------|
| **users** | One row per registered person — name, email, hashed password, subscription plan | `John Doe, john@email.com, free plan` |
| **refresh_tokens** | Login session — one active token per user (logging in on a new device logs out the old one) | `token for John, expires July 4` |

---

### Group 2 — What tests exist?

| Table | What it stores | Example row |
|-------|---------------|-------------|
| **books** | One row per Cambridge book | `C11, Academic` |
| **tests** | One row per test inside a book | `C11 Listening Test 1, 40 questions, 30 min` |
| **test_sections** | Parts/passages within a test | `Part 1 of C11 Listening Test 1, audio 0:00–7:00` |

Think of it like folders:

```
Book (C11)
  └── Test (Listening Test 1)
        ├── Section (Part 1)
        ├── Section (Part 2)
        ├── Section (Part 3)
        └── Section (Part 4)
```

---

### Group 3 — What do the tests contain?

| Table | What it stores | Example row |
|-------|---------------|-------------|
| **question_groups** | The actual questions — fill-in-the-blank, multiple choice, matching, etc. | `SENTENCE_COMPLETION, Q1–Q10, "Complete the notes below"` |
| **passages** | Reading passage text (paragraphs, headings, answer highlights) | `"The Falkirk Wheel" — 8 paragraphs` |
| **transcripts** | Listening transcript text (speaker lines with answer highlights) | `Part 1 transcript — Agent and Student dialogue` |
| **correct_answers** | The right answer for each question (LOCKED — never sent to the app) | `Q1 = "Charlton", Q2 = "115"` |

---

### Group 4 — What has the user done?

| Table | What it stores | Example row |
|-------|---------------|-------------|
| **test_attempts** | One row each time a user starts a test — tracks status, score, time | `John started C11 Listening Test 1, scored 30/40, band 7.0` |
| **user_answers** | What the user typed/selected for each question in an attempt | `Attempt #1, Q1 = "Charlton" (correct), Q2 = "150" (wrong)` |

---

## How the Tables Connect to Each Other

Each arrow below means "belongs to" or "is inside of":

```
USERS
  │
  ├── has one  → REFRESH_TOKEN (only one active session allowed)
  │
  └── has many → TEST_ATTEMPTS (every time they take a test)
                    │
                    └── has many → USER_ANSWERS (their answer for each question)


BOOKS
  │
  └── has many → TESTS (4 per skill per book)
                    │
                    ├── has many → CORRECT_ANSWERS (40 per test, secret)
                    │
                    └── has many → TEST_SECTIONS (3 for reading, 4 for listening)
                                    │
                                    ├── has many → QUESTION_GROUPS (the questions)
                                    ├── has one  → PASSAGE (reading only)
                                    └── has one  → TRANSCRIPT (listening only)
```

---

## Relationships in Table Form

| Parent Table | Child Table | Relationship | Meaning |
|-------------|-------------|-------------|---------|
| users | refresh_tokens | 1 user → 1 token | A user can only be logged in on one device at a time |
| users | test_attempts | 1 user → many attempts | A user can take many tests (and retake them) |
| test_attempts | user_answers | 1 attempt → many answers | Each attempt has up to 40 answers |
| books | tests | 1 book → many tests | C11 has Listening T1-T4 + Reading T1-T4 |
| tests | test_sections | 1 test → many sections | Listening has 4 parts, Reading has 3 passages |
| tests | correct_answers | 1 test → 40 answers | Every test has exactly 40 correct answers |
| test_sections | question_groups | 1 section → many groups | Part 1 might have a sentence completion + a table completion |
| test_sections | passages | 1 section → 1 passage | Only for reading — the passage text |
| test_sections | transcripts | 1 section → 1 transcript | Only for listening — the speaker dialogue |

---

## How the Connections Look (Real Example)

Here's how a single test flows through the tables:

| Layer | Table | Data |
|-------|-------|------|
| Book | **books** | C11, Academic |
| Test | **tests** | C11 Listening Test 1, 40 questions |
| Section | **test_sections** | Part 1 (audio 0:00–7:00) |
| Questions | **question_groups** | Sentence Completion Q1–Q10: "Complete the notes" |
| Answers (secret) | **correct_answers** | Q1 = Charlton, Q2 = 115, Q3 = Tuesday... |
| Transcript | **transcripts** | Agent: "Good morning..." / Student: "I'd like to book..." |

When **John** takes this test:

| Layer | Table | Data |
|-------|-------|------|
| Attempt | **test_attempts** | John, C11 Listening Test 1, started 12:00, score 30/40, band 7.0 |
| His answers | **user_answers** | Q1 = "Charlton" (correct), Q2 = "150" (wrong), Q3 = "Tuesday" (correct)... |

---

## The Two Sides of the System

| Side | Tables | Who touches it |
|------|--------|---------------|
| **Content side** (what tests exist) | books, tests, test_sections, question_groups, passages, transcripts, correct_answers | Admin / seed scripts — rarely changes |
| **User side** (what users do) | users, refresh_tokens, test_attempts, user_answers | Changes every time someone signs up or takes a test |

---

## Quick Glossary

| Term | Meaning |
|------|---------|
| **Row** | One entry in a table (like one row in a spreadsheet) |
| **Foreign key** | A column that points to a row in another table (the "connection") |
| **1 → many** | One parent can have multiple children (1 book → many tests) |
| **1 → 1** | One parent has exactly one child (1 section → 1 passage) |
| **UUID** | A unique random ID like `a3b2c1d4-e5f6-...` used instead of counting 1, 2, 3 |
| **JSONB** | A flexible column that stores structured data (like a mini JSON file inside a database cell) |
| **JWT** | A login token — a signed string the app sends with every request to prove who the user is |
| **Band score** | IELTS score from 0–9 calculated from how many questions were answered correctly |

---

## Remaining — Not Yet Implemented

These 6 features are needed but not built yet. They add **5 new tables** and **~12 new API endpoints** on top of the core system.

---

### R1. Forgot / Reset Password

**The problem:** If a user forgets their password, there's currently no way to recover their account.

**How it works:**
1. User clicks "Forgot password?" on the login page
2. They enter their email → backend sends a reset link via email
3. User clicks the link → taken to a "Set new password" page
4. They enter a new password → backend updates it and forces a re-login

**New table:**

| Table | What it stores |
|-------|---------------|
| **password_reset_tokens** | A temporary token sent via email, valid for 1 hour, single-use |

**New endpoints:**

| Endpoint | What it does |
|----------|-------------|
| `POST /api/auth/forgot-password` | Takes an email, sends a reset link (always says "sent" even if email doesn't exist — for security) |
| `POST /api/auth/reset-password` | Takes the token + new password, updates the account |

---

### R2. Report Mistake

**The problem:** The frontend has a "Report" button that lets users flag wrong answers, typos, or audio issues — but it has nowhere to send the report.

**How it works:**
1. User clicks the report button during a test or on the review page
2. They pick an issue type (wrong answer, typo, audio issue, missing content, other)
3. They optionally enter a question number and write a description
4. Report is saved in the database for an admin to review later

**New table:**

| Table | What it stores |
|-------|---------------|
| **reports** | User ID, test ID, issue type, question number, description, status (open/reviewed/resolved) |

**New endpoint:**

| Endpoint | What it does |
|----------|-------------|
| `POST /api/reports` | Submit a mistake report (max 10 per user per day) |

---

### R3. Pricing / Subscriptions

**The problem:** The Pricing page shows 3 plans (Free/$0, Pro/$29, Premium/$79) but there's no backend to handle payments, trial periods, or plan changes.

**How it works:**
1. User picks a plan on the Pricing page
2. They're redirected to Stripe/Razorpay checkout to pay
3. After payment, a webhook notifies the backend → subscription is activated
4. User's plan is upgraded, unlocking more features
5. If payment fails or they cancel, plan downgrades back to free

**New table:**

| Table | What it stores |
|-------|---------------|
| **subscriptions** | User's current plan, payment status, billing period start/end, trial end date, Stripe/Razorpay subscription ID |

**New endpoints:**

| Endpoint | What it does |
|----------|-------------|
| `GET /api/subscriptions/plans` | List available plans with prices and features (public) |
| `POST /api/subscriptions/checkout` | Create a Stripe/Razorpay payment session → returns a checkout URL |
| `POST /api/subscriptions/webhook` | Receives payment events from Stripe/Razorpay (not called by the app — called by the payment provider) |
| `POST /api/subscriptions/cancel` | Cancel the current subscription (keeps access until end of billing period) |
| `GET /api/subscriptions/current` | Get the user's current plan, status, and renewal date |

---

### R4. Free Plan Test Limit

**The problem:** The Pricing page says free users get "Access to 5 practice tests" — but nothing in the backend actually enforces this. A free user could take all 36 tests.

**How it works:**
1. When a free user tries to start a test, the backend counts how many different tests they've already attempted
2. If they've used all 5 slots AND this is a new test → block with "Upgrade to unlock more tests"
3. Retaking a test they've already attempted does NOT use a new slot
4. Pro and Premium users have no limit

**No new table needed** — just a check in the start-test and test-detail endpoints.

| Check | Where | What happens |
|-------|-------|-------------|
| Free user, test #6+ | `POST .../start` | Returns `403 Forbidden` with upgrade message |
| Free user, test #6+ | `GET .../tests/:testSlug` | Returns `403 Forbidden` (prevents loading questions) |
| Free user, retaking test #1-5 | Both endpoints | Allowed — retakes don't count as a new test |
| Pro / Premium user | Both endpoints | Always allowed |

---

### R5. Writing & Speaking Modules

**The problem:** The frontend has pages for Writing and Speaking, but the backend only covers Listening and Reading. Writing and Speaking are fundamentally different because there are no fixed correct answers — they need AI evaluation or human grading.

#### Writing

**How it works:**
1. Each writing test has 2 tasks (Task 1: describe a graph/chart, Task 2: write an essay)
2. User writes their response in a text box
3. After submitting, an AI evaluates it on 4 criteria: Task Achievement, Coherence, Lexical Resource, Grammar
4. User gets a band score + written feedback

**New tables:**

| Table | What it stores |
|-------|---------------|
| **writing_tests** | Test metadata (which book, test number) |
| **writing_tasks** | The 2 tasks per test — prompt text, image (for graphs), minimum word count, sample answer |
| **writing_submissions** | User's written response, word count, AI-generated band score and feedback |

#### Speaking

**How it works:**
1. Each speaking test has 3 parts (Introduction, Long Turn with cue card, Discussion)
2. User records their voice for each part
3. Audio is uploaded → AI transcribes it and evaluates on 4 criteria: Fluency, Lexical, Grammar, Pronunciation
4. User gets a band score + feedback

**New tables:**

| Table | What it stores |
|-------|---------------|
| **speaking_tests** | Test metadata |
| **speaking_parts** | The 3 parts per test — questions, cue card (Part 2), prep time, speaking time |
| **speaking_submissions** | User's audio recording URL, AI transcript, band score and feedback |

**New endpoints (both modules):**

| Endpoint | What it does |
|----------|-------------|
| `GET /api/writing/:examType/books` | List writing test books |
| `GET /api/writing/.../tests/:testSlug` | Get writing tasks + prompts |
| `POST /api/writing/.../submit` | Submit a written response for AI evaluation |
| `GET /api/writing/submissions/:id` | Get feedback and score |
| `GET /api/speaking/:examType/books` | List speaking test books |
| `GET /api/speaking/.../tests/:testSlug` | Get speaking parts + questions |
| `POST /api/speaking/.../submit` | Upload audio recording for AI evaluation |
| `GET /api/speaking/submissions/:id` | Get transcript, feedback, and score |

---

### R6. Server-Side Timer Enforcement

**The problem:** Currently only the frontend tracks the test timer. A user could pause the browser timer, use developer tools, or submit answers hours after starting. The backend has no way to know.

**How it works:**
1. When a test is started, `started_at` is saved in the database
2. When answers are submitted, the backend checks: `current time - started_at > allowed duration?`
3. Small delays (up to 5 minutes over) are accepted but flagged as late
4. Extreme delays (30+ minutes over) are rejected — the attempt is marked as abandoned

| Scenario | Time over limit | What happens |
|----------|----------------|-------------|
| Normal submit | Within time | Accepted normally |
| Slightly late | 1–5 min over | Accepted but `is_late = true` flag is set |
| Very late | 5–30 min over | Accepted but flagged |
| Expired session | 30+ min over | Rejected — attempt set to `abandoned`, user must start a new one |

**No new table needed** — just a new `is_late` column added to `test_attempts`.

---

### Summary — What's Remaining

| # | Feature | New Tables | New Endpoints | Priority |
|---|---------|-----------|---------------|----------|
| R1 | Forgot / Reset Password | 1 (password_reset_tokens) | 2 | High |
| R2 | Report Mistake | 1 (reports) | 1 | Medium |
| R3 | Pricing / Subscriptions | 1 (subscriptions) | 5 | High |
| R4 | Free Plan Test Limit | 0 (logic only) | 0 (checks in existing endpoints) | High |
| R5 | Writing & Speaking | 6 (3 per module) | 8 (4 per module) | Low (future) |
| R6 | Server-Side Timer | 0 (1 column added) | 0 (logic in existing submit) | Medium |
| **Total** | | **9 new tables** | **16 new endpoints** | |
