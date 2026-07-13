# Orange IELTS — Backend Specification

> Complete backend spec covering database schema, relationships, API endpoints, auth, and business logic. This document is the source of truth for backend implementation.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Database Schema](#database-schema)
3. [Entity Relationships](#entity-relationships)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic](#business-logic)
7. [Migration Plan](#migration-plan)
8. [Security Rules](#security-rules)
9. [Remaining — Not Yet Implemented](#remaining--not-yet-implemented)

---

## Tech Stack

| Layer         | Choice                      |
|---------------|-----------------------------|
| Runtime       | Node.js                     |
| Framework     | Express.js (or NestJS)      |
| Database      | MongoDB                     |
| ODM           | Mongoose                    |
| Auth          | JWT (access + refresh)      |
| Validation    | Zod (or Joi)                |
| File Storage  | S3 / Cloudflare R2 (audio)  |
| API Base URL  | `http://localhost:8000/api`  |

---

## Database Schema

### 1. `users`

Stores registered user accounts.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500),
  plan          VARCHAR(20) NOT NULL DEFAULT 'free',   -- 'free' | 'premium' | 'pro'
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

| Column        | Type         | Notes                                    |
|---------------|--------------|------------------------------------------|
| id            | UUID         | Primary key                              |
| name          | VARCHAR(100) | Display name                             |
| email         | VARCHAR(255) | Unique, used for login                   |
| password_hash | VARCHAR(255) | bcrypt hashed password                   |
| avatar_url    | VARCHAR(500) | Profile picture URL (nullable)           |
| plan          | VARCHAR(20)  | Subscription tier: free, premium, pro    |
| is_active     | BOOLEAN      | Soft-delete flag                         |

---

### 2. `refresh_tokens`

Stores the active refresh token for a user. **Only one token per user** — logging in on a new device invalidates the previous session (single-device policy).

```sql
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- UNIQUE = one token per user
  token      VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

---

### 3. `books`

Stores book-level metadata (e.g., C11, C12, ..., C19).

```sql
CREATE TABLE books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug   VARCHAR(20) UNIQUE NOT NULL,   -- e.g. "book-11"
  book_number INT NOT NULL,                   -- e.g. 11
  title       VARCHAR(255) NOT NULL,          -- e.g. "Cambridge IELTS 11"
  exam_type   VARCHAR(20) NOT NULL,           -- 'academic' | 'general'
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

### 4. `tests`

Stores individual test metadata. Each book has multiple tests across modules.

```sql
CREATE TABLE tests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_slug       VARCHAR(50) UNIQUE NOT NULL,  -- e.g. "book-11-test-1"
  book_id         UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  test_number     INT NOT NULL,                  -- 1, 2, 3, or 4
  skill           VARCHAR(20) NOT NULL,          -- 'listening' | 'reading' | 'writing' | 'speaking'
  title           VARCHAR(255) NOT NULL,         -- e.g. "C11 Listening Test 1"
  duration        INT NOT NULL,                  -- test duration in minutes (60 for reading, varies for listening)
  total_questions INT NOT NULL DEFAULT 40,
  total_sections  INT NOT NULL DEFAULT 4,        -- 4 for listening, 3 for reading
  audio_url       VARCHAR(500),                  -- S3/R2 URL for listening audio (NULL for reading)
  is_published    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(book_id, test_number, skill)
);

CREATE INDEX idx_tests_book ON tests(book_id);
CREATE INDEX idx_tests_skill ON tests(skill);
```

---

### 5. `test_sections`

Each test has sections (Parts 1-4 for listening, Passages 1-3 for reading).

```sql
CREATE TABLE test_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  section_number  INT NOT NULL,
  title           VARCHAR(100),                  -- e.g. "Part 1", "Section 1"
  section_heading VARCHAR(255),                  -- optional heading text
  audio_start     DECIMAL(10,2),                 -- listening: start timestamp in seconds
  audio_end       DECIMAL(10,2),                 -- listening: end timestamp in seconds
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(test_id, section_number)
);

CREATE INDEX idx_sections_test ON test_sections(test_id);
```

---

### 6. `passages`

Reading passages attached to test sections (reading tests only).

```sql
CREATE TABLE passages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES test_sections(id) ON DELETE CASCADE,
  title           VARCHAR(500) NOT NULL,
  subtitle        VARCHAR(500),
  passage_content JSONB NOT NULL,                -- array of section objects (see below)
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**`passage_content` JSONB structure:**

```json
[
  {
    "heading": "A",
    "questionId": "14",
    "content": "Paragraph text with <q id=\"14\">highlighted answer</q> markers..."
  },
  {
    "content": "Regular paragraph with no heading or question mapping..."
  }
]
```

- `heading` and `questionId` are present only for MATCHING_HEADING paragraphs
- `<q>` tags are embedded in content for review-page answer highlighting
- On test mode, the FE strips `<q>` tags before rendering

---

### 7. `question_groups`

Stores question groups per section. The `data` column holds question content as JSONB.

```sql
CREATE TABLE question_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES test_sections(id) ON DELETE CASCADE,
  group_order     INT NOT NULL,                   -- display order within the section
  type            VARCHAR(50) NOT NULL,            -- question type enum (see below)
  instruction     TEXT,                            -- instruction text shown to the user
  start_question  INT NOT NULL,
  end_question    INT NOT NULL,
  hide_range      BOOLEAN DEFAULT FALSE,
  data            JSONB NOT NULL,                  -- type-specific question content
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(section_id, group_order)
);

CREATE INDEX idx_qgroups_section ON question_groups(section_id);
```

**Supported `type` values:**

| Type                          | Data Shape (JSONB)                                                |
|-------------------------------|-------------------------------------------------------------------|
| `SENTENCE_COMPLETION`         | `{ sentences: [{ questionNumber, before, after }] }`              |
| `SENTENCE_COMPLETION_DRAG_DROP` | `{ options: [...], sentences: [{ questionNumber, before, after }] }` |
| `SUMMARY_COMPLETION`          | `{ passage: "text with __1__ blanks" }`                           |
| `SUMMARY_COMPLETION_DRAG_DROP`| `{ options: [...], passage: "text with __1__ blanks" }`           |
| `MULTIPLE_CHOICE`             | `{ questions: [{ questionNumber, question, options, count }] }`   |
| `TABLE_COMPLETION`            | `{ headers: [...], rows: [...] }`                                 |
| `FLOW_CHART_DRAG_DROP`        | `{ options: [...], steps: [...] }`                                |
| `MAP_DIAGRAM_LABELLING`       | `{ imageUrl, questions: [...] }`                                  |
| `DIAGRAM_LABELLING`           | `{ imageUrl, labels: [...] }`                                     |
| `IDENTIFICATION`              | `{ optionsType: "trueFalse" | "yesNo", statements: [...] }`      |
| `MATCHING_FEATURE`            | `{ features: [...], statements: [...] }`                          |
| `MATCHING_HEADING`            | `{ headings: [...] }`                                             |
| `PARAGRAPH_MATCHING`          | `{ paragraphs: [...], statements: [...] }`                        |
| `NOTE_COMPLETION`             | `{ notes: [...] }`                                                |

---

### 8. `correct_answers` (INTERNAL ONLY)

Stores the correct answer for each question. **Never exposed via any GET endpoint.**

```sql
CREATE TABLE correct_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  accepted_answers TEXT[] NOT NULL,               -- array of accepted forms, e.g. {"rivers", "river"}
  answer_type     VARCHAR(20) NOT NULL,           -- 'SINGLE' | 'MULTIPLE'
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(test_id, question_number)
);

CREATE INDEX idx_answers_test ON correct_answers(test_id);
```

**Answer format examples:**

| Scenario                     | answer_type | accepted_answers                        |
|------------------------------|-------------|------------------------------------------|
| Text input                   | SINGLE      | `{"rivers", "river"}`                    |
| Single select (A/B/C)        | SINGLE      | `{"B"}`                                  |
| Choose TWO (multi-select)    | MULTIPLE    | `{"B", "D"}`                             |
| Amount with variants         | SINGLE      | `{"115", "£115"}`                        |
| Matching / drag-drop         | SINGLE      | `{"F"}`                                  |

---

### 9. `transcripts`

Listening test transcripts, shown on the review page.

```sql
CREATE TABLE transcripts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES test_sections(id) ON DELETE CASCADE,
  content         JSONB NOT NULL,                 -- structured transcript with answer highlights
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(section_id)
);
```

**`content` JSONB structure:**

```json
[
  {
    "speaker": "AGENT",
    "text": "Good morning. How can I help you today?"
  },
  {
    "speaker": "STUDENT",
    "text": "I'd like to book a room at <q id=\"1\">Charlton</q> Hotel."
  }
]
```

---

### 10. `test_attempts`

One row per test session. Created when a user starts a test.

```sql
CREATE TABLE test_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',  -- 'in_progress' | 'submitted' | 'abandoned'
  score           INT,                            -- correct answer count (set on submit)
  band_score      DECIMAL(2,1),                   -- IELTS band score (set on submit)
  time_spent      INT,                            -- seconds spent on the test
  started_at      TIMESTAMP DEFAULT NOW(),
  submitted_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_attempts_status ON test_attempts(status);
```

---

### 11. `user_answers`

Stores each answer the user submitted for an attempt.

```sql
CREATE TABLE user_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id      UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  user_answer     TEXT,                           -- what the user typed/selected
  is_correct      BOOLEAN,                        -- computed server-side at submit time
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(attempt_id, question_number)
);

CREATE INDEX idx_user_answers_attempt ON user_answers(attempt_id);
```

---

## Entity Relationships

```
users
  │
  ├──< refresh_tokens        (1:N)  one user has many refresh tokens
  │
  └──< test_attempts          (1:N)  one user has many attempts
        │
        └──< user_answers      (1:N)  one attempt has many answers

books
  │
  └──< tests                   (1:N)  one book has many tests
        │
        ├──< correct_answers    (1:N)  one test has 40 correct answers
        │
        └──< test_sections      (1:N)  one test has 3-4 sections
              │
              ├──< question_groups (1:N)  one section has many question groups
              ├──○ passages         (1:1)  one section has one passage (reading only)
              └──○ transcripts      (1:1)  one section has one transcript (listening only)
```

**Key relationships:**
- A **book** has 4 tests per skill (listening + reading = 8 tests per book)
- A **test** has 3 sections (reading) or 4 sections (listening)
- A **section** has 1+ question groups, optionally a passage (reading) or transcript (listening)
- A **test attempt** belongs to one user and one test, and contains up to 40 user answers
- **correct_answers** is linked to tests, not sections, for simpler scoring queries

---

## API Endpoints

Base URL: `/api`

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "optional message",
  "timestamp": "2026-06-27T12:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": { "email": ["Email is required"] }
}
```

---

### Auth Endpoints

All auth endpoints are **public** (no token required).

#### `POST /api/auth/register`

Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "free",
      "createdAt": "2026-06-27T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhb...",
      "refreshToken": "eyJhb...",
      "expiresIn": 900
    }
  }
}
```

**Validation:**
- `name`: required, 2-100 chars
- `email`: required, valid email, unique
- `password`: required, min 8 chars, at least 1 uppercase + 1 number

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "plan": "free" },
    "tokens": {
      "accessToken": "eyJhb...",
      "refreshToken": "eyJhb...",
      "expiresIn": 900
    }
  }
}
```

**Error:** `401 Unauthorized` — invalid credentials

---

#### `POST /api/auth/refresh`

Issue a new access token using a valid refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhb..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhb...",
    "refreshToken": "eyJhb...",
    "expiresIn": 900
  }
}
```

**Behaviour:**
- Old refresh token is invalidated (rotation)
- New refresh token is stored in the DB
- If the refresh token is expired or not found → `401`

---

#### `POST /api/auth/logout`

Invalidate the current refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhb..."
}
```

**Response:** `200 OK`

---

#### `GET /api/auth/me`

Get the current authenticated user's profile. **Requires auth.**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "plan": "free",
    "createdAt": "2026-06-27T12:00:00.000Z"
  }
}
```

---

### Test Browsing Endpoints

These endpoints serve test listings and metadata. **Require auth.**

#### `GET /api/:skill/:examType/books`

List all books for a skill + exam type combo with pagination and user progress stats.

**Path params:**
- `skill`: `listening` | `reading`
- `examType`: `academic` | `general`

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "uuid",
        "number": 11,
        "title": "Cambridge IELTS 11",
        "description": null,
        "totalTests": 4,
        "tests": [
          {
            "id": "uuid",
            "testNumber": 1,
            "bookNumber": 11,
            "examType": "academic",
            "skill": "listening",
            "duration": 30,
            "totalQuestions": 40,
            "sections": 4,
            "status": "completed",
            "result": {
              "testNumber": 1,
              "bandScore": 7.0,
              "correctAnswers": 30,
              "totalQuestions": 40,
              "completedAt": "2026-06-20T14:30:00.000Z"
            }
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 9,
      "itemsPerPage": 10
    },
    "stats": {
      "totalBooks": 9,
      "totalTests": 36,
      "completedTests": 12,
      "averageBandScore": 6.5
    }
  }
}
```

**Notes:**
- `status` is per-user: checks if user has a submitted attempt for this test
- `result` is the latest submitted attempt's result (null if not attempted)
- `stats.averageBandScore` is computed across all the user's completed tests for this skill

---

#### `GET /api/:skill/:examType/books/:bookSlug/tests/:testSlug`

Get full test content — sections, passages, question groups. Everything needed to render the test-taking page.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "testSlug": "book-11-test-1",
    "bookNumber": 11,
    "testNumber": 1,
    "skill": "listening",
    "examType": "academic",
    "title": "C11 Listening Test 1",
    "audioUrl": "https://cdn.example.com/audio/c11-listening-test-1.mp3",
    "duration": 30,
    "totalQuestions": 40,
    "sections": [
      {
        "sectionNumber": 1,
        "title": "Part 1",
        "sectionHeading": "Questions 1-10",
        "audioStart": 0,
        "audioEnd": 420.5,
        "passage": null,
        "questionGroups": [
          {
            "type": "SENTENCE_COMPLETION",
            "instruction": "Complete the notes below. Write ONE WORD AND/OR A NUMBER.",
            "startQuestion": 1,
            "endQuestion": 10,
            "hideRange": false,
            "data": {
              "sentences": [
                { "questionNumber": 1, "before": "Name: ", "after": "" },
                { "questionNumber": 2, "before": "Cost per night: £", "after": "" }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

**Important:** This endpoint NEVER includes correct answers. The `data` JSONB in question_groups contains only question content (prompts, options, blanks) — no answer values.

For **reading tests**, each section includes a `passage` object:
```json
{
  "passage": {
    "title": "The Falkirk Wheel",
    "subtitle": "A unique rotating boat lift",
    "sections": [
      { "content": "Paragraph text..." },
      { "questionId": "14", "heading": "A", "content": "Paragraph A text..." }
    ]
  }
}
```

---

### Test Attempt Endpoints

**All require auth.**

#### `POST /api/:skill/:examType/books/:bookSlug/tests/:testSlug/start`

Start a new test attempt. Creates a session for the user.

**Request:** _(empty body)_

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "testSlug": "book-11-test-1",
    "startedAt": "2026-06-27T12:00:00.000Z"
  }
}
```

**Behaviour:**
- If user already has an `in_progress` attempt for this test, return the existing one (don't create a duplicate)
- Sets `status = 'in_progress'`

---

#### `POST /api/:skill/:examType/books/:bookSlug/tests/:testSlug/submit`

Submit answers for a test attempt. Backend scores all answers and returns results.

**Request:**
```json
{
  "attemptId": "uuid",
  "answers": {
    "1": "Charlton",
    "2": "115",
    "3": "Tuesday",
    "25": ["B", "D"]
  },
  "timeSpent": 1845
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "bandScore": 7.0,
    "correctAnswers": 30,
    "totalQuestions": 40,
    "timeSpent": 1845,
    "sectionScores": [
      { "section": 1, "correct": 8, "total": 10 },
      { "section": 2, "correct": 7, "total": 10 },
      { "section": 3, "correct": 8, "total": 10 },
      { "section": 4, "correct": 7, "total": 10 }
    ],
    "results": [
      { "questionNumber": 1, "isCorrect": true },
      { "questionNumber": 2, "isCorrect": true },
      { "questionNumber": 3, "isCorrect": false }
    ]
  }
}
```

**Important:** The response contains `isCorrect` per question but **never reveals the correct answer string**. The user only sees right/wrong.

---

#### `GET /api/:skill/:examType/results`

Get all the user's completed test results for a skill + exam type.

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "attemptId": "uuid",
        "testSlug": "book-11-test-1",
        "bookNumber": 11,
        "testNumber": 1,
        "score": 30,
        "bandScore": 7.0,
        "totalQuestions": 40,
        "timeSpent": 1845,
        "submittedAt": "2026-06-27T12:35:00.000Z"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 2, "totalItems": 12, "itemsPerPage": 20 }
  }
}
```

---

#### `GET /api/attempts/:attemptId/results`

Get detailed results for a specific submitted attempt (used on the review page).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "testSlug": "book-11-test-1",
    "skill": "listening",
    "bandScore": 7.0,
    "score": 30,
    "totalQuestions": 40,
    "timeSpent": 1845,
    "submittedAt": "2026-06-27T12:35:00.000Z",
    "results": [
      { "questionNumber": 1, "userAnswer": "Charlton", "isCorrect": true },
      { "questionNumber": 2, "userAnswer": "150", "isCorrect": false },
      { "questionNumber": 3, "userAnswer": "Tuesday", "isCorrect": true }
    ],
    "sectionScores": [
      { "section": 1, "correct": 8, "total": 10 },
      { "section": 2, "correct": 7, "total": 10 },
      { "section": 3, "correct": 8, "total": 10 },
      { "section": 4, "correct": 7, "total": 10 }
    ]
  }
}
```

**Note:** Still no correct answer strings — only `userAnswer` and `isCorrect`.

---

#### `GET /api/attempts/:attemptId/review`

Get full test content + transcript/passage for the review page. Same structure as the test detail endpoint but also includes transcript data for listening.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "test": { "...same as test detail..." },
    "transcript": [
      {
        "sectionNumber": 1,
        "lines": [
          { "speaker": "AGENT", "text": "Good morning..." },
          { "speaker": "STUDENT", "text": "I'd like to book at <q id=\"1\">Charlton</q>..." }
        ]
      }
    ]
  }
}
```

For reading tests, the passage `content` fields retain their `<q>` tags so the FE can render answer highlights.

---

### User Profile Endpoints

**All require auth.**

#### `GET /api/user/profile`

Get the current user's profile.

**Response:** same as `GET /api/auth/me`

---

#### `PATCH /api/user/profile`

Update profile fields.

**Request:**
```json
{
  "name": "Jane Doe",
  "avatar": "https://cdn.example.com/avatars/jane.jpg"
}
```

**Response:** `200 OK` — updated user object

---

#### `GET /api/user/progress`

Get overall progress stats across all skills.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "listening": {
      "testsCompleted": 12,
      "testsTotal": 36,
      "averageBandScore": 6.5,
      "bestBandScore": 8.0,
      "recentScores": [7.0, 6.5, 7.5, 6.0, 7.0]
    },
    "reading": {
      "testsCompleted": 8,
      "testsTotal": 36,
      "averageBandScore": 6.0,
      "bestBandScore": 7.5,
      "recentScores": [6.0, 6.5, 5.5, 6.0]
    }
  }
}
```

---

## Authentication & Authorization

### JWT Token Strategy

| Token         | Lifetime | Storage (FE)                    |
|---------------|----------|---------------------------------|
| Access Token  | 15 min   | `localStorage` (`ielts_access_token`)  |
| Refresh Token | 7 days   | `localStorage` (`ielts_refresh_token`) |

### Auth Flow

```
1. User logs in  → POST /api/auth/login
                  ← { accessToken, refreshToken }

2. FE stores both tokens in localStorage

3. Every API request → Authorization: Bearer <accessToken>

4. If 401 response:
   a. FE calls POST /api/auth/refresh with refreshToken
   b. BE validates refresh token, issues new pair (rotation)
   c. FE retries original request with new accessToken
   d. If refresh also fails → redirect to login

5. Logout → POST /api/auth/logout (invalidate refresh token)
```

### Protected vs Public Routes

| Route Pattern                 | Auth Required |
|-------------------------------|---------------|
| `POST /api/auth/*`            | No            |
| `GET  /api/auth/me`           | Yes           |
| `GET  /api/:skill/:examType/*`| Yes           |
| `POST /api/:skill/.../start`  | Yes           |
| `POST /api/:skill/.../submit` | Yes           |
| `GET  /api/attempts/*`        | Yes           |
| `GET  /api/user/*`            | Yes           |
| `PATCH /api/user/*`           | Yes           |

### Middleware

```
authMiddleware(req, res, next):
  1. Extract token from Authorization header
  2. Verify JWT signature + expiry
  3. Attach req.user = { id, email, plan }
  4. next()
```

---

## Business Logic

### Answer Scoring

When `POST .../submit` is called:

```
1. Validate attemptId exists and belongs to req.user
2. Validate attempt.status === 'in_progress'
3. Fetch all correct_answers for the test
4. For each question (1-40):
   a. Get user's answer (or empty string if skipped)
   b. Normalize: trim, lowercase, collapse whitespace
   c. SINGLE type: check if normalized answer matches ANY entry in accepted_answers[]
   d. MULTIPLE type: check if user's selected set matches the accepted set (order-independent)
   e. Store is_correct for each
5. Calculate score = count of correct
6. Calculate band_score using conversion table
7. Update attempt: score, band_score, time_spent, status='submitted', submitted_at=NOW()
8. Insert/upsert all user_answers rows
9. Return results (without correct answer strings)
```

### Band Score Conversion Table

| Correct Answers | Band Score |
|-----------------|------------|
| 39-40           | 9.0        |
| 37-38           | 8.5        |
| 35-36           | 8.0        |
| 33-34           | 7.5        |
| 30-32           | 7.0        |
| 27-29           | 6.5        |
| 23-26           | 6.0        |
| 20-22           | 5.5        |
| 16-19           | 5.0        |
| 13-15           | 4.5        |
| 10-12           | 4.0        |
| 7-9             | 3.5        |
| 4-6             | 3.0        |
| 2-3             | 2.5        |
| 1               | 2.0        |
| 0               | 0          |

### Answer Normalization Rules

```
normalize(answer):
  1. Trim leading/trailing whitespace
  2. Convert to lowercase
  3. Collapse multiple spaces to single space
  4. Return result

Examples:
  "  Rivers " → "rivers"
  "B" → "b"
  "£115" → "£115"
```

For MULTIPLE type answers (e.g., "Choose TWO"):
- User submits: `["B", "D"]`
- Correct: `{"B", "D"}`
- Compare as sets (order doesn't matter)

---

## Migration Plan

Steps to migrate the current frontend JSON data into the database:

### Step 1 — Seed Books

Insert 9 books (C11 through C19):

```sql
INSERT INTO books (book_slug, book_number, title, exam_type) VALUES
  ('book-11', 11, 'Cambridge IELTS 11', 'academic'),
  ('book-12', 12, 'Cambridge IELTS 12', 'academic'),
  ...
  ('book-19', 19, 'Cambridge IELTS 19', 'academic');
```

### Step 2 — Seed Tests

For each book, insert 4 listening tests + 4 reading tests:
- Source: `src/data/academic/book-{N}/listening/test-{N}.json` and `reading/test-{N}.json`
- Map `testId` → `test_slug`, extract `title`, `totalQuestions`, section count

### Step 3 — Seed Sections + Question Groups

Parse each test JSON:
- Create `test_sections` rows from the `sections` array
- Create `question_groups` rows from each section's `questionGroups`
- Store question data in the `data` JSONB column (strip any answer fields)

### Step 4 — Seed Passages (Reading)

For each reading test section:
- Create `passages` row with `passage_content` = the sections array from the passage object
- Preserve `<q>` tags, `heading`, and `questionId` fields

### Step 5 — Seed Correct Answers

Parse each answer key JSON (`test-{N}-answers.json`):
- Insert into `correct_answers` with `accepted_answers` array

### Step 6 — Seed Transcripts (Listening)

Parse each transcript JSON (`test-{N}-transcript.json`):
- Insert into `transcripts` with the structured content

### Data counts:
- 9 books
- 72 tests (9 books x 4 tests x 2 skills)
- ~252 sections (72 tests x ~3.5 avg)
- ~2,880 correct answers (72 tests x 40 questions)
- 36 transcripts (listening only)
- 108 passages (36 reading tests x 3 passages)

---

## Security Rules

1. **correct_answers must NEVER have a GET endpoint** — only the submit handler queries this table internally
2. **Correct answer strings are never returned in any API response** — only `isCorrect: boolean`
3. **All attempt endpoints verify ownership** — user can only access their own attempts
4. **Rate limiting** — apply to auth endpoints (5 req/min for login, 3 req/min for register)
5. **Input validation** — validate all request bodies with Zod/Joi before processing
6. **SQL injection protection** — use parameterized queries (ORM handles this)
7. **Password hashing** — bcrypt with salt rounds >= 10
8. **CORS** — restrict to frontend origin only
9. **Helmet.js** — set secure HTTP headers
10. **Refresh token rotation** — old tokens are invalidated on use to prevent replay attacks

---

## Remaining — Not Yet Implemented

These features are needed by the frontend but are not yet covered in the spec above. They should be built after the core system is working.

---

### R1. Forgot / Reset Password

Users need a way to recover their account when they forget their password.

#### New Table: `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE NOT NULL,       -- random secure token
  expires_at TIMESTAMP NOT NULL,                  -- valid for 1 hour
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
```

#### Endpoints

##### `POST /api/auth/forgot-password`

Send a password reset link to the user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK` (always — even if email doesn't exist, to prevent email enumeration)
```json
{
  "success": true,
  "message": "If an account with that email exists, a reset link has been sent."
}
```

**Server-side logic:**
1. Look up user by email
2. If user exists, generate a random token, store in `password_reset_tokens` with 1-hour expiry
3. Send email with link: `https://orangeielts.com/reset-password?token=abc123`
4. Invalidate any previous unused reset tokens for this user
5. If user doesn't exist, return 200 anyway (no email sent)

##### `POST /api/auth/reset-password`

Set a new password using the reset token.

**Request:**
```json
{
  "token": "abc123",
  "newPassword": "newSecurePassword456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

**Error cases:**
- Token not found → `400 Bad Request`
- Token expired → `400 Bad Request` ("Reset link has expired")
- Token already used → `400 Bad Request`

**Server-side logic:**
1. Find token in `password_reset_tokens`, check not expired and not used
2. Hash the new password with bcrypt
3. Update `users.password_hash`
4. Mark token as `used = true`
5. Delete the user's refresh token (force re-login on all devices)

---

### R2. Report Mistake

The frontend has a "Report" button on the test page that lets users report wrong answers, typos, audio issues, or missing content. This needs a backend to store and retrieve reports.

#### New Table: `reports`

```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  report_type     VARCHAR(30) NOT NULL,            -- 'wrong-answer' | 'typo' | 'audio-issue' | 'missing-content' | 'other'
  question_number INT,                              -- optional, which question the report is about
  description     TEXT NOT NULL,                    -- user's description of the issue
  status          VARCHAR(20) DEFAULT 'open',       -- 'open' | 'reviewed' | 'resolved' | 'dismissed'
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_test ON reports(test_id);
CREATE INDEX idx_reports_status ON reports(status);
```

#### Endpoints

##### `POST /api/reports`

Submit a mistake report. **Requires auth.**

**Request:**
```json
{
  "testSlug": "book-11-test-1",
  "reportType": "wrong-answer",
  "questionNumber": 14,
  "description": "The correct answer should be 'rivers' not 'river'. The passage clearly uses the plural form."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "open",
    "createdAt": "2026-06-27T12:00:00.000Z"
  }
}
```

**Validation:**
- `reportType`: required, must be one of `wrong-answer`, `typo`, `audio-issue`, `missing-content`, `other`
- `description`: required, min 10 chars, max 1000 chars
- `questionNumber`: optional, 1–40
- Rate limit: max 10 reports per user per day

##### `GET /api/reports` (Admin only — future)

List all reports with filters. This is for an admin dashboard to review reports. Not needed for the initial launch but the table is ready for it.

---

### R3. Pricing / Subscriptions

The frontend has a Pricing page with 3 plans: Free ($0), Pro ($29/mo), Premium ($79/mo). The backend needs to manage subscriptions, enforce plan limits, and integrate with a payment gateway.

#### New Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan              VARCHAR(20) NOT NULL DEFAULT 'free',   -- 'free' | 'pro' | 'premium'
  status            VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'trialing' | 'past_due' | 'cancelled'
  payment_provider  VARCHAR(20),                            -- 'stripe' | 'razorpay' | null for free
  provider_sub_id   VARCHAR(255),                           -- Stripe/Razorpay subscription ID
  current_period_start TIMESTAMP,
  current_period_end   TIMESTAMP,                           -- when the current billing cycle ends
  trial_ends_at     TIMESTAMP,                              -- 7-day free trial end date
  cancelled_at      TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### Endpoints

##### `GET /api/subscriptions/plans`

List available plans with pricing. **Public.**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "free",
        "name": "Free",
        "price": 0,
        "currency": "USD",
        "period": "forever",
        "features": ["Access to 5 practice tests", "Basic progress tracking", "Reading & Listening tests", "Community support"],
        "testLimit": 5
      },
      {
        "id": "pro",
        "name": "Pro",
        "price": 2900,
        "currency": "USD",
        "period": "month",
        "features": ["Unlimited access to all tests", "All 4 skills", "Detailed analytics", "..."],
        "testLimit": null,
        "trialDays": 7
      },
      {
        "id": "premium",
        "name": "Premium",
        "price": 7900,
        "currency": "USD",
        "period": "month",
        "features": ["Everything in Pro", "1-on-1 tutoring (4/month)", "..."],
        "testLimit": null,
        "trialDays": 7
      }
    ]
  }
}
```

##### `POST /api/subscriptions/checkout`

Create a payment session (Stripe Checkout / Razorpay order). **Requires auth.**

**Request:**
```json
{
  "plan": "pro"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_abc123",
    "sessionId": "cs_live_abc123"
  }
}
```

##### `POST /api/subscriptions/webhook`

Payment provider webhook (Stripe/Razorpay calls this). **Not authenticated by JWT — verified by provider signature.**

Handles events:
- `checkout.session.completed` → activate subscription, update `users.plan`
- `invoice.payment_failed` → set status to `past_due`
- `customer.subscription.deleted` → set status to `cancelled`, downgrade `users.plan` to `free`

##### `POST /api/subscriptions/cancel`

Cancel the current subscription. **Requires auth.**

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscription cancelled. You will retain access until the end of the current billing period."
}
```

##### `GET /api/subscriptions/current`

Get the user's current subscription details. **Requires auth.**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": "2026-07-27T12:00:00.000Z",
    "cancelledAt": null
  }
}
```

---

### R4. Free Plan Test Limit

Free users can only access 5 practice tests (as shown on the Pricing page). The backend must enforce this.

#### Logic

Add a check in the **start test** endpoint (`POST .../start`):

```
1. Get user's plan from req.user (or query users table)
2. If plan === 'free':
   a. Count how many DISTINCT test_id values the user has in test_attempts (any status)
   b. If count >= 5 AND the current test_id is NOT one of those 5:
      → Return 403 Forbidden: "Free plan limited to 5 tests. Upgrade to unlock all tests."
   c. If the current test_id is one they've already attempted → allow (retakes are free)
3. If plan === 'pro' or 'premium' → no limit, proceed
```

Also add a check in the **test detail** endpoint (`GET .../tests/:testSlug`):

```
1. If plan === 'free' and this test is NOT one of the user's 5 allowed tests:
   → Return 403 with upgrade prompt
   (This prevents the FE from even loading the questions)
```

**FE integration:** The frontend should show a lock icon or "Upgrade" badge on tests the user can't access, based on the `status` field or a new `locked: boolean` field in the test listing response.

---

### R5. Writing & Speaking Modules

The frontend has routes and placeholder pages for Writing (`/:examType/writing`) and Speaking (`/:examType/speaking`). These are fundamentally different from Listening/Reading because they don't have fixed correct answers — they require AI evaluation or human grading.

#### Writing Module

##### New Table: `writing_tests`

```sql
CREATE TABLE writing_tests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_slug     VARCHAR(50) UNIQUE NOT NULL,
  book_id       UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  test_number   INT NOT NULL,
  exam_type     VARCHAR(20) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  duration      INT NOT NULL DEFAULT 60,           -- 60 minutes
  created_at    TIMESTAMP DEFAULT NOW()
);
```

##### New Table: `writing_tasks`

Each writing test has 2 tasks (Task 1 and Task 2).

```sql
CREATE TABLE writing_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id         UUID NOT NULL REFERENCES writing_tests(id) ON DELETE CASCADE,
  task_number     INT NOT NULL,                     -- 1 or 2
  task_type       VARCHAR(30) NOT NULL,             -- 'graph' | 'map' | 'process' | 'table' (Task 1) | 'essay' (Task 2)
  instruction     TEXT NOT NULL,                    -- the prompt shown to the student
  image_url       VARCHAR(500),                     -- chart/graph/map image (Task 1 only)
  min_words       INT NOT NULL,                     -- 150 for Task 1, 250 for Task 2
  sample_answer   TEXT,                             -- model answer (shown on review, admin only)
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(test_id, task_number)
);
```

##### New Table: `writing_submissions`

```sql
CREATE TABLE writing_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES writing_tasks(id) ON DELETE CASCADE,
  response_text   TEXT NOT NULL,                    -- what the student wrote
  word_count      INT NOT NULL,
  time_spent      INT,                              -- seconds
  -- AI evaluation fields (filled after grading)
  band_score      DECIMAL(2,1),
  feedback        JSONB,                            -- { taskAchievement: 7, coherence: 6.5, lexical: 7, grammar: 6.5, comments: "..." }
  evaluated_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_writing_subs_user ON writing_submissions(user_id);
```

##### Endpoints

```
GET  /api/writing/:examType/books                          → list writing test books
GET  /api/writing/:examType/books/:bookSlug/tests/:testSlug → get writing tasks + prompts
POST /api/writing/:examType/books/:bookSlug/tests/:testSlug/submit → submit writing response
GET  /api/writing/submissions/:submissionId                 → get feedback/score for a submission
```

#### Speaking Module

##### New Table: `speaking_tests`

```sql
CREATE TABLE speaking_tests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_slug     VARCHAR(50) UNIQUE NOT NULL,
  book_id       UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  test_number   INT NOT NULL,
  exam_type     VARCHAR(20) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  duration      INT NOT NULL DEFAULT 14,           -- 11-14 minutes
  created_at    TIMESTAMP DEFAULT NOW()
);
```

##### New Table: `speaking_parts`

Each speaking test has 3 parts.

```sql
CREATE TABLE speaking_parts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id         UUID NOT NULL REFERENCES speaking_tests(id) ON DELETE CASCADE,
  part_number     INT NOT NULL,                     -- 1, 2, or 3
  title           VARCHAR(100),                     -- "Introduction & Interview", "Long Turn", "Discussion"
  instruction     TEXT NOT NULL,
  questions       JSONB NOT NULL,                   -- array of questions/prompts
  cue_card        TEXT,                             -- Part 2 cue card text (null for Parts 1 & 3)
  prep_time       INT DEFAULT 0,                   -- Part 2 = 60 seconds prep
  speaking_time   INT,                             -- Part 2 = 120 seconds
  created_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(test_id, part_number)
);
```

##### New Table: `speaking_submissions`

```sql
CREATE TABLE speaking_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_id         UUID NOT NULL REFERENCES speaking_parts(id) ON DELETE CASCADE,
  audio_url       VARCHAR(500) NOT NULL,            -- S3/R2 URL of user's recorded audio
  duration        INT,                              -- recording length in seconds
  transcript      TEXT,                             -- AI-generated transcript of user's speech
  -- AI evaluation fields
  band_score      DECIMAL(2,1),
  feedback        JSONB,                            -- { fluency: 7, lexical: 6.5, grammar: 7, pronunciation: 6, comments: "..." }
  evaluated_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_speaking_subs_user ON speaking_submissions(user_id);
```

##### Endpoints

```
GET  /api/speaking/:examType/books                          → list speaking test books
GET  /api/speaking/:examType/books/:bookSlug/tests/:testSlug → get speaking parts + questions
POST /api/speaking/:examType/books/:bookSlug/tests/:testSlug/submit → submit audio recording
GET  /api/speaking/submissions/:submissionId                 → get AI feedback/score
```

---

### R6. Server-Side Timer Enforcement

Currently only the frontend tracks time. The backend should independently enforce the time limit to prevent cheating (e.g., pausing the browser timer or submitting via API tools).

#### Logic

Add to the **submit** endpoint (`POST .../submit`):

```
1. Fetch the attempt's started_at timestamp
2. Fetch the test's duration (in minutes)
3. Add a 5-minute grace buffer (for network delays, slow connections)
4. Calculate deadline = started_at + duration + 5 minutes
5. If NOW() > deadline:
   → Still accept the submission but flag it:
     - Set a field: test_attempts.is_late = true
     - Optionally: auto-submit with whatever answers were provided
6. If NOW() > deadline + 30 minutes (extreme case):
   → Reject: 400 Bad Request "Test session has expired. Please start a new attempt."
   → Set attempt status to 'abandoned'
```

#### Schema change

Add to `test_attempts`:

```sql
ALTER TABLE test_attempts ADD COLUMN is_late BOOLEAN DEFAULT FALSE;
```

This way:
- Normal submissions go through as usual
- Slightly late submissions (network lag) are accepted but flagged
- Extremely late submissions are rejected and the attempt is abandoned
