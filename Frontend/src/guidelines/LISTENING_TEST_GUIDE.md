# Listening Test JSON Guide

## File Location
```
src/data/academic/book-{N}/listening/test-{N}.json
```

## Top-Level Structure
```json
{
  "testId": "book-19-test-3",
  "bookId": "book-19",
  "title": "Cambridge IELTS 19 – Listening Test 3",
  "audioSrc": "",
  "totalQuestions": 40,
  "sections": [ ...4 sections... ]
}
```

## Section Structure
```json
{
  "sectionNumber": 1,
  "title": "Part 1",
  "questionGroups": [ ...groups... ]
}
```

## Question Group Common Fields
```json
{
  "type": "QUESTION_TYPE",
  "instruction": "Complete the notes below. Write **ONE WORD ONLY** for each answer.",
  "startQuestion": 1,
  "endQuestion": 10,
  "hideRange": true,       // optional — omit for first group, add on continuation groups
  "data": { ... }
}
```

---

## Question Types

### SENTENCE_COMPLETION
Used for notes completion, sentence completion, etc.

```json
{
  "type": "SENTENCE_COMPLETION",
  "instruction": "Complete the notes below. Write **ONE WORD AND/OR A NUMBER** for each answer.",
  "startQuestion": 1,
  "endQuestion": 5,
  "data": {
    "title": "Local food shops",
    "sentences": [
      { "content": [{ "type": "bold", "text": "Where to go" }] },
      { "questionNumber": 1, "content": ["• Kite Place – near the ", { "id": "1", "type": "input" }] },
      { "content": ["• below a restaurant in the large, grey building"] }
    ]
  }
}
```

**`content` array items can be:**
- `"plain string"` — rendered as-is
- `{ "type": "input", "id": "1" }` — renders an answer input box (question number matches id)
- `{ "type": "bold", "text": "Heading text" }` — renders bold text
- `{ "type": "br" }` — line break (used in TABLE_COMPLETION cells)

**Rules:**
- Sentences without `questionNumber` are non-interactive (headings, notes, examples)
- Multiple groups for the same section use `"hideRange": true` on all but the first
- The `id` in `{ "type": "input", "id": "3" }` must match the answer key question id `"3"`
- **Answer stored:** whatever the user types (string)

---

### TABLE_COMPLETION
```json
{
  "type": "TABLE_COMPLETION",
  "instruction": "Complete the table below. Write **ONE WORD ONLY** for each answer.",
  "startQuestion": 7,
  "endQuestion": 10,
  "data": {
    "title": "Shopping",
    "headers": ["", "To buy", "Other ideas"],
    "rows": [
      ["Fish market", "a dozen prawns", ["a handful of ", { "id": "7", "type": "input" }, " (type of seaweed)"]],
      ["Organic shop", ["beans and a ", { "id": "8", "type": "input" }], ["spices and ", { "id": "9", "type": "input" }, " for dessert"]],
      ["Bakery", "a brown loaf", ["a ", { "id": "10", "type": "input" }, " tart"]]
    ]
  }
}
```

**Rules:**
- Each row is an array of cells; each cell is either a plain string or a ContentPart array
- Use `{ "type": "br" }` inside a cell array for line breaks within a cell
- **Answer stored:** whatever the user types (string)

---

### MULTIPLE_CHOICE

**Single answer (A, B or C):**
```json
{
  "type": "MULTIPLE_CHOICE",
  "instruction": "Choose the correct letter, A, B or C.",
  "startQuestion": 21,
  "endQuestion": 25,
  "data": {
    "title": "Optional section title",
    "questions": [
      {
        "id": "21",
        "questionNumber": 21,
        "text": "How does Clare feel about the students?",
        "options": [
          { "letter": "A", "text": "worried that they are not making progress" },
          { "letter": "B", "text": "challenged by their poor behaviour" },
          { "letter": "C", "text": "frustrated at their lack of interest" }
        ]
      }
    ]
  }
}
```

**Multiple answer (choose TWO):**
```json
{
  "type": "MULTIPLE_CHOICE",
  "instruction": "Choose **TWO** letters, A–E.",
  "startQuestion": 17,
  "endQuestion": 18,
  "data": {
    "questions": [
      {
        "id": "17-18",
        "text": "Which TWO reasons does the speaker give?",
        "options": [ ... ],
        "multiple": true,
        "count": 2
      }
    ]
  }
}
```

**Rules:**
- For "choose TWO" questions, use a combined id like `"17-18"` and set `"multiple": true, "count": 2`
- **Answer stored:** `"A"`, `"B"`, etc. — just the letter

---

### MATCHING_FEATURE
```json
{
  "type": "MATCHING_FEATURE",
  "instruction": "What information is given about each festival workshop? Choose SIX answers from the box and write the correct letter, **A–H**, next to Questions 11–16.",
  "startQuestion": 11,
  "endQuestion": 16,
  "data": {
    "title": "Information",
    "rightSideTitle": "Festival workshops",
    "options": [
      { "letter": "A", "text": "involves painting and drawing" },
      { "letter": "B", "text": "will be led by a prize-winning author" }
    ],
    "questions": [
      { "id": "11", "questionNumber": 11, "text": "Superheroes" },
      { "id": "12", "questionNumber": 12, "text": "Just do it" }
    ]
  }
}
```

**Rules:**
- `options` is shown on the left as a word bank (letters A–H)
- `questions` is shown on the right as dropdown rows
- **Answer stored:** just the letter (e.g., `"D"`)
- The dropdown shows `—` when nothing is selected; `—` is hidden from the open dropdown list

---

### FLOW_CHART_DRAG_DROP
```json
{
  "type": "FLOW_CHART_DRAG_DROP",
  "instruction": "Complete the flowchart below. Choose FIVE answers from the box and write the correct letter, A–H, next to Questions 26–30.",
  "startQuestion": 26,
  "endQuestion": 30,
  "data": {
    "title": "",
    "options": [
      { "letter": "A", "text": "size" },
      { "letter": "B", "text": "escape" },
      { "letter": "C", "text": "age" },
      { "letter": "D", "text": "water" },
      { "letter": "E", "text": "cereal" },
      { "letter": "F", "text": "calculations" },
      { "letter": "G", "text": "changes" },
      { "letter": "H", "text": "colour" }
    ],
    "steps": [
      { "type": "interactive", "content": ["Choose mice which are all the same ", { "id": "26", "type": "dropzone" }] },
      { "type": "interactive", "content": ["Divide the mice into two groups, each with a different ", { "id": "27", "type": "dropzone" }] },
      { "type": "text", "content": "Put each group in a separate cage." },
      { "type": "interactive", "content": ["Feed group B the same, but also sugar contained in ", { "id": "28", "type": "dropzone" }] }
    ]
  }
}
```

**CRITICAL RULES:**
- Options **must** use `{ "letter": "A", "text": "word" }` format — NOT plain strings like `"A   size"`
- The `letter` is the stored answer value (matches the answer key)
- The `text` is what appears in the word bank UI (no letter prefix shown)
- Steps with `"type": "text"` are non-interactive labels
- Steps with `"type": "interactive"` contain dropzones in the `content` array
- **Answer stored:** the letter only (e.g., `"A"`, `"C"`)

---

### MAP_DIAGRAM_LABELLING
```json
{
  "type": "MAP_DIAGRAM_LABELLING",
  "instruction": "Label the map below. Write the correct letter, A-I, next to Questions 14-20.",
  "startQuestion": 14,
  "endQuestion": 20,
  "data": {
    "title": "Proposed traffic changes in Granford",
    "imageSrc": "/images/book-13-test-1-part2-map.jpg",
    "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    "questions": [
      { "id": "14", "questionNumber": 14, "text": "New traffic lights" },
      { "id": "15", "questionNumber": 15, "text": "Pedestrian crossing" }
    ]
  }
}
```

**Rules:**
- `imageSrc` is a public path; place image in `public/images/`
- `options` is a plain string array of letters shown in dropdowns
- **Answer stored:** just the letter (e.g., `"C"`)

---

## Answer Key Format
```
src/data/academic/book-{N}/listening/test-{N}-answers.json
```

```json
{
  "testId": "book-19-test-3",
  "answers": [
    { "questionNumber": 1,      "answerType": "SINGLE",   "acceptedAnswers": ["park"] },
    { "questionNumber": "17-18","answerType": "MULTIPLE",  "acceptedAnswers": ["A", "D"], "count": 2 },
    { "questionNumber": 26,     "answerType": "SINGLE",   "acceptedAnswers": ["C"] }
  ]
}
```

**⚠️ CRITICAL:** `answers` is an **array**, NOT an object. Each entry uses `acceptedAnswers` (array of strings), NOT `value`.

**Rules:**
- `answers` is an **array** of objects — NOT a keyed object
- `questionNumber` is a number for regular questions, or a string like `"17-18"` for choose-TWO questions
- `"SINGLE"` for one-answer questions; `"MULTIPLE"` with `"count": 2` for choose-TWO questions
- For MULTIPLE_CHOICE single: `"acceptedAnswers": ["B"]` (letter in array)
- For MULTIPLE_CHOICE multiple: `"acceptedAnswers": ["A", "D"]` with `"count": 2`
- For SENTENCE_COMPLETION: `"acceptedAnswers": ["park"]` (expected word in array)
- For alternate acceptable answers: `"acceptedAnswers": ["colour", "color"]` (all variants in array)
- For FLOW_CHART_DRAG_DROP / MATCHING_FEATURE: `"acceptedAnswers": ["C"]` (letter only)

---

## Page Registration
New listening tests must be registered in:
```
src/pages/ListeningTestPage/ListeningTestActualPage.tsx
```

Add the import at the top:
```tsx
import book19Test1Listening from '../../data/academic/book-19/listening/test-1.json';
```

Add to the `testDataMap` object:
```tsx
"book-19-test-1": book19Test1Listening as unknown as TestData,
```

---

## URL Structure
Listening test URLs follow this pattern:
```
/[examType]/listening/[testId]

Examples:
/academic/listening/book-18-test-3
/academic/listening/book-11-test-1
```
The `testId` (`book-N-test-N`) is the only identifier needed — do NOT add a separate `bookId` segment to the URL.

---

## ⚠️ Critical Field Names Reference

These are the exact field names the components read. Using the wrong name causes a **crash**.

| Question Type | Field | Correct Name | Wrong Name (crashes) |
|---|---|---|---|
| `MULTIPLE_CHOICE` (choose TWO) | combined id | `"17-18"` | ~~`"17"` and `"18"` separately~~ |
| `FLOW_CHART_DRAG_DROP` options | option format | `{ "letter": "A", "text": "word" }` | ~~`"A   word"`~~ |
| `SENTENCE_COMPLETION_DRAG_DROP` options | option format | `{ "letter": "A", "text": "..." }` | ~~plain string~~ |
| Answer key (choose TWO) | answerType | `"MULTIPLE"` with `["A","D"]` | ~~two separate SINGLE entries~~ |

---

## Common Patterns

### Splitting one section into multiple groups with shared title blocks
When a section has multiple sub-groups (e.g., Part 1 of Book 19 Test 3):
- First group gets the instruction and `"startQuestion"` / `"endQuestion"`
- Continuation groups set `"hideRange": true` and `"instruction": ""`
- Each group has its own `"title"` in `data` for visual separation

### Bold instruction text
Use `**text**` markdown in the instruction string:
```
"Write **ONE WORD AND/OR A NUMBER** for each answer."
```

### Example rows
Add a non-interactive sentence at the start:
```json
{ "content": ["Example – Start date: ", { "type": "bold", "text": "16th" }, " May"] }
```
