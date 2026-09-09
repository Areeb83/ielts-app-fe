# Review & Explanations Page — Implementation Plan

## Overview
After submitting a test, the user can click "Enter Review & Explanations" to see a detailed breakdown of their answers vs correct answers, with the passage/transcript alongside.

---

## Data Available

- **Test JSON** (`test-{n}.json`): Questions, passages (reading only), question groups
- **Answer JSON** (`test-{n}-answers.json`): Correct answers per question with `acceptedAnswers[]`
- **User Answers**: Passed via route state from the result page
- **Shared Test Data Maps** (`src/data/testDataMaps.ts`): Centralized imports for all test JSONs
- **Shared Answer Keys** (`src/data/answerKeys.ts`): Centralized imports for all answer JSONs

---

## Completed

### Part 1: Scoring Utility ✅
**File:** `src/utils/scoring.ts`

- `scoreTest(userAnswers, answerKey)` — case-insensitive comparison with null safety
- `getBandScore(correct)` — IELTS band conversion table
- Returns `ScoreResult` with per-question breakdown

### Part 2: Result Page with Real Scoring ✅
**File:** `src/pages/TestResultPage/TestResultPage.tsx`

- Uses `getAnswerKey()` + `scoreTest()` for real correct count & band score
- Passes `userAnswers` + `scoreResult` to review page via route state
- "Enter Review & Explanations" button navigates to `/review`

### Part 3: Review Page Route & Layout ✅
**File:** `src/pages/ReviewPage/ReviewPage.tsx`
**Route:** `/:examType/:module/:testId/review`

- Navbar: Test title + "Review", report mistake button, close button (goes back)
- Uses same `.header` class and `.listening-test-container` as test detail page
- Split pane layout for both reading AND listening
- Footer with section navigation (no submit button)
- Reading: Passage on left, questions on right
- Listening: Placeholder "Transcript not available yet" on left, questions on right

### Part 4: Answer Summary ✅
- `AnswerSummary` component below each question group
- Green check for correct, red cross + strikethrough + correct answer for wrong

### Shared Components Extracted ✅
- `ReportMistakeButton` — used in both Header and ReviewPage
- `testDataMaps.ts` — shared test data loader for all pages
- `answerKeys.ts` — shared answer key loader

---

## Remaining Work

### Part 5: Answer Display Text Resolution
**Problem:** Some question types show full text on the UI but store answers as codes:

#### Listening (affected types):
| Type | Count | Answer Format | UI Shows |
|------|-------|---------------|----------|
| MULTIPLE_CHOICE | 119 groups | A/B/C | Full option text |
| MATCHING_FEATURE | 44 groups | A/B/C | Feature descriptions |
| MAP_DIAGRAM_LABELLING | 12 groups | A/B/C | Place names on map |

#### Reading (affected types):
| Type | Answer Format | UI Shows |
|------|---------------|----------|
| MULTIPLE_CHOICE | A/B/C | Full option text |
| MATCHING_FEATURE | A/B/C | Feature descriptions |
| MATCHING_HEADING | i/ii/iii | Heading text |
| PARAGRAPH_MATCHING | A/B/C/D | Paragraph labels |

#### Non-affected types (text input = actual answer):
- SENTENCE_COMPLETION
- TABLE_COMPLETION
- SUMMARY_COMPLETION
- FLOW_CHART_DRAG_DROP
- DIAGRAM_LABELLING

**Solution needed:** In the AnswerSummary, map answer codes back to display text using the question group data. Show both: `B — They do not contain any organic matter`

**Status:** [ ] Not started — **PRIORITY 1**

---

### Part 6: Read-Only Question Rendering — **PRIORITY 1**
**Current state:** Questions render via `QuestionRenderer` with user answers but inputs are not disabled.

**Needed:**
- Disable all inputs, selects, drag-drop in review mode
- Color input borders: green for correct, red for wrong
- May need a `reviewMode` prop passed through `QuestionRenderer` to each question type component

**Status:** [ ] Not started — **PRIORITY 1**

---

### Part 7: Listening Transcripts (Future)
- Add transcript text to listening test JSONs
- Render in left pane of review split pane
- Highlight answer locations in transcript

**Status:** [ ] Blocked — transcript data not available yet

---

## Route Flow

```
Test Page → Submit → Result Page → "Enter Review & Explanations" → Review Page
                                 → "Back to Homepage" → Home
                                 → "Retake" → Test Page

Review Page → Close (X) → Back to Result Page
```

## State Flow

```
TestDetailContainer (handleSubmit)
  → navigate to /result with state: { testTitle, testType, totalQuestions, timeSpent, userAnswers }

ResultPage
  → loads answer key via getAnswerKey(testId, testType)
  → runs scoreTest(userAnswers, answerKey) → real correctCount, bandScore
  → displays score circles
  → "Enter Review & Explanations"
    → navigate to /review with state: { testTitle, testType, userAnswers, scoreResult }

ReviewPage
  → loads test data via getTestData(testId, testType)
  → loads answer key via getAnswerKey(testId, testType) (fallback if scoreResult missing)
  → renders split pane with passage/transcript + questions + answer summaries
```

## File Structure

```
src/
├── utils/scoring.ts                    — scoreTest(), getBandScore()
├── data/
│   ├── testDataMaps.ts                 — shared test data imports
│   └── answerKeys.ts                   — shared answer key imports
├── components/TestDetailComponents/
│   ├── ReportMistakeButton.tsx          — shared report dialog
│   ├── Header.tsx                       — uses ReportMistakeButton
│   ├── Footer.tsx                       — conditional submit button
│   └── TestLoadingScreen.tsx            — loading spinner
├── pages/
│   ├── TestResultPage/TestResultPage.tsx — score circles + real scoring
│   └── ReviewPage/ReviewPage.tsx        — split pane review with answers
└── constants/routes.ts                  — LISTENING_REVIEW, READING_REVIEW
```
