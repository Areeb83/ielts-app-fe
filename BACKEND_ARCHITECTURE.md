# Backend Architecture Guide

## Overview

- Question data (JSON files) will be migrated to the BE database
- The FE fetches question content via API when a test is opened
- **Correct answers are NEVER sent to the FE** — not on test open, not ever
- Answers are only used server-side when the user submits a test
- The BE computes the score and returns results after submission

---

## Database Tables

### 1. `tests`
Stores top-level test metadata.

```sql
CREATE TABLE tests (
  id              SERIAL PRIMARY KEY,
  test_id         VARCHAR(50) UNIQUE NOT NULL,  -- e.g. "book-19-test-1"
  book_id         VARCHAR(20) NOT NULL,          -- e.g. "book-19"
  title           VARCHAR(255) NOT NULL,         -- e.g. "Cambridge IELTS 19 – Listening Test 1"
  audio_src       VARCHAR(500),                  -- URL to audio file (empty until uploaded)
  total_questions INT NOT NULL DEFAULT 40,
  type            VARCHAR(20) NOT NULL,          -- "listening" or "reading"
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

### 2. `question_groups`
Stores question content per section. The `data` column is JSONB — exact same structure as the current JSON files, **with no answer fields**.

```sql
CREATE TABLE question_groups (
  id              SERIAL PRIMARY KEY,
  test_id         VARCHAR(50) REFERENCES tests(test_id),
  section_number  INT NOT NULL,
  section_title   VARCHAR(50),                  -- e.g. "Part 1", "Part 2"
  type            VARCHAR(50) NOT NULL,          -- SENTENCE_COMPLETION, MULTIPLE_CHOICE, etc.
  instruction     TEXT,
  start_question  INT NOT NULL,
  end_question    INT NOT NULL,
  hide_range      BOOLEAN DEFAULT FALSE,
  data            JSONB NOT NULL,               -- question content (sentences, options, etc.)
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Supported `type` values:**
- `SENTENCE_COMPLETION`
- `MULTIPLE_CHOICE`
- `MATCHING_FEATURE`
- `MAP_DIAGRAM_LABELLING`
- `TABLE_COMPLETION`
- `FLOW_CHART_DRAG_DROP`
- `SUMMARY_COMPLETION`

---

### 3. `correct_answers` ⚠️ NEVER expose via public API
Stores the correct answer for each question. Completely separate from question content.

```sql
CREATE TABLE correct_answers (
  id              SERIAL PRIMARY KEY,
  test_id         VARCHAR(50) REFERENCES tests(test_id),
  question_number INT NOT NULL,
  correct_answer  TEXT NOT NULL,               -- single: "rivers" | multiple: "B,D" (comma separated)
  answer_type     VARCHAR(20) NOT NULL,        -- "SINGLE" or "MULTIPLE"
  UNIQUE(test_id, question_number)
);
```

**Answer format examples:**
| Question Type | answer_type | correct_answer |
|---|---|---|
| SENTENCE_COMPLETION | SINGLE | `"rivers"` |
| MULTIPLE_CHOICE single | SINGLE | `"B"` |
| MULTIPLE_CHOICE choose TWO | MULTIPLE | `"B,D"` |
| MATCHING_FEATURE | SINGLE | `"C"` |
| MAP_DIAGRAM_LABELLING | SINGLE | `"F"` |
| TABLE_COMPLETION | SINGLE | `"Tuesday"` |
| FLOW_CHART_DRAG_DROP | SINGLE | `"size"` |

---

### 4. `user_attempts`
One row per test attempt per user.

```sql
CREATE TABLE user_attempts (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL,                 -- FK to users table
  test_id         VARCHAR(50) REFERENCES tests(test_id),
  started_at      TIMESTAMP DEFAULT NOW(),
  submitted_at    TIMESTAMP,
  score           INT,                          -- number of correct answers
  total_questions INT NOT NULL DEFAULT 40,
  status          VARCHAR(20) DEFAULT 'in_progress',  -- "in_progress" or "submitted"
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

### 5. `user_answers`
Stores user's answer for each question in an attempt.

```sql
CREATE TABLE user_answers (
  id              SERIAL PRIMARY KEY,
  attempt_id      INT REFERENCES user_attempts(id),
  question_number INT NOT NULL,
  user_answer     TEXT,                         -- what the user typed/selected
  is_correct      BOOLEAN,                      -- computed by BE at submit time, never sent from FE
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(attempt_id, question_number)
);
```

---

## API Routes

### Test Data (safe, no answers)

```
GET  /api/tests                          → list all tests
GET  /api/tests/:testId                  → get test metadata
GET  /api/tests/:testId/questions        → get all question_groups for a test (NO answers)
```

### Attempts

```
POST /api/attempts                       → start a new attempt
     body: { testId, userId }
     returns: { attemptId }

POST /api/attempts/:attemptId/submit     → submit answers
     body: { answers: [{ questionNumber: 1, answer: "rivers" }, ...] }
     returns: { score, total, results: [{ questionNumber, isCorrect }] }
```

### Results (after submission only)

```
GET  /api/attempts/:attemptId/results    → get detailed results for a submitted attempt
```

---

## Submit Flow (BE Logic)

```
1. FE sends POST /api/attempts/:attemptId/submit
   body: { answers: [{ questionNumber: 1, answer: "rivers" }, ...] }

2. BE validates attempt exists and belongs to user

3. BE fetches correct_answers WHERE test_id = attempt.test_id

4. BE loops through each user answer:
   - For SINGLE: compare user_answer === correct_answer (case-insensitive, trimmed)
   - For MULTIPLE: split correct_answer by comma, check user sent both (order doesn't matter)

5. BE inserts all rows into user_answers with is_correct computed

6. BE updates user_attempts:
   SET score = count of correct, status = "submitted", submitted_at = NOW()

7. BE returns:
   {
     score: 32,
     total: 40,
     results: [
       { questionNumber: 1, isCorrect: true },
       { questionNumber: 2, isCorrect: false },
       ...
     ]
   }

8. FE displays results — correct answers are still NOT sent back
```

---

## Security Rules

- `correct_answers` table must have **no GET API route**
- Only the submit handler can query `correct_answers` — internally, never via a public endpoint
- The FE should never receive correct answer values — only `isCorrect: true/false` per question
- All `/api/attempts` routes must be authenticated (user must be logged in)

---

## Migration Plan (JSON → Database)

When migrating the current JSON files:

1. Insert into `tests` using `testId`, `bookId`, `title`, `audioSrc`, `totalQuestions`
2. Insert each section's `questionGroups` into `question_groups` with `data` = the question content JSONB
3. Insert correct answers separately into `correct_answers` (these need to be added manually or from an answers key)

**Current JSON files location:** `src/data/academic/book-{N}/listening/test-{N}.json`

Books covered: 11, 12, 13, 14, 15, 16, 17, 18, 19 (4 tests each = 36 listening tests)

---

## Notes

- SENTENCE_COMPLETION answers should be compared case-insensitively and trimmed
- For MULTIPLE (choose TWO), store as comma-separated e.g. `"B,D"` and compare as a set
- Audio files are not yet uploaded — `audio_src` will be empty until that is handled
- Reading tests will follow the same structure with `type = "reading"`
