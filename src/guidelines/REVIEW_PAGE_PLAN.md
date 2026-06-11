# Review & Explanations Page — Implementation Plan

## Overview
After submitting a test, the user can click "Enter Review & Explanations" to see a detailed breakdown of their answers vs correct answers, with the passage/transcript alongside.

---

## Data Available

- **Test JSON** (`test-{n}.json`): Questions, passages (reading only), question groups
- **Answer JSON** (`test-{n}-answers.json`): Correct answers per question with `acceptedAnswers[]`
- **User Answers**: Passed via route state from the result page

---

## Parts Breakdown

### Part 1: Scoring Utility
**File:** `src/utils/scoring.ts`

- Function: `scoreTest(userAnswers, answerKey)`
- Compare each user answer against `acceptedAnswers[]` (case-insensitive, trimmed)
- Returns: `{ correct: number, total: number, results: { questionNumber, userAnswer, correctAnswer, isCorrect }[] }`
- IELTS band score conversion table (correct answers → band)

**Status:** [ ] Not started

---

### Part 2: Update Result Page with Real Scoring
**File:** `src/pages/TestResultPage/TestResultPage.tsx`

- Import answer key JSON for the current test
- Use scoring utility to calculate actual correct count & band score
- Pass scoring results to review page via route state

**Status:** [ ] Not started

---

### Part 3: Review Page Route & Layout
**File:** `src/pages/ReviewPage/ReviewPage.tsx`
**Route:** `/:examType/:module/:testId/review`

- Navbar: Same as result page (test title, Home, Retake buttons)
- Hide homepage navbar/footer
- Split pane layout:
  - **Left pane**: Passage (reading) or transcript placeholder (listening)
  - **Right pane**: Questions with answer validation
- Section navigation (Part 1, Part 2, Part 3, Part 4 for listening / Section 1, 2, 3 for reading)

**Status:** [ ] Not started

---

### Part 4: Left Pane — Passage / Transcript Display
**File:** Part of `ReviewPage.tsx` or separate component

- **Reading**: Reuse existing `ReadingPassage` component (read-only mode, no drag-drop)
- **Listening**: Transcript text (future — transcripts not in JSON yet). Show placeholder for now: "Transcript not available"
- Correct answers highlighted/marked in the passage text

**Status:** [ ] Not started

---

### Part 5: Right Pane — Questions with Answer Validation
**File:** `src/components/ReviewComponents/ReviewQuestionRenderer.tsx`

- Render all question groups (reuse existing question type components where possible)
- All inputs/selections are **read-only** (disabled)
- Input border colors:
  - **Green** (`border-green-500`): User's answer matches accepted answers
  - **Red** (`border-red-500`): User's answer is wrong or empty
- Below each question group: show correct answers in a summary box
  - Format: `Q1: tomatoes | Q2: urban centres | Q3: energy ...`

**Status:** [ ] Not started

---

### Part 6: Answer Summary Component
**File:** `src/components/ReviewComponents/AnswerSummary.tsx`

- Takes question range and answer results
- Displays correct answers in a clean grid/list
- Shows user answer vs correct answer side by side
- Color coded: green check for correct, red cross for wrong

**Status:** [ ] Not started

---

## Assembly Order

1. **Part 1** first — scoring utility (independent, no UI)
2. **Part 2** — update result page to show real scores
3. **Part 3** — review page skeleton with route and layout
4. **Part 4** — left pane (passage display)
5. **Part 5** — right pane (questions with validation)
6. **Part 6** — answer summary below each group

---

## Open Questions

- [ ] Listening transcripts: Do we have or plan to add transcript text to listening test JSONs?
- [ ] Should the review page allow re-playing audio sections for listening?
- [ ] Should we show explanations text? (Not in current data — future BE feature?)

---

## Route Flow

```
Test Page → Submit → Result Page → "Enter Review & Explanations" → Review Page
                                  → "Back to Homepage" → Home
                                  → "Retake" → Test Page
```

## State Flow

```
TestDetailContainer (handleSubmit)
  → navigate to /result with state: { answers, testType, totalQuestions, ... }

ResultPage
  → loads answer key JSON
  → runs scoreTest() to get correctCount, bandScore, results[]
  → displays score circles
  → "Enter Review & Explanations"
    → navigate to /review with state: { testData, answers, answerKey, results[] }
```
