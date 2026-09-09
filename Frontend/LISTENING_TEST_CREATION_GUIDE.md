# Listening Test Creation Guide (Books 11–19)

## Project Context

This is an IELTS practice platform. Listening tests live in:
```
src/data/academic/book-{N}/listening/test-{N}.json
```

Each test must have **exactly 40 questions** (Q1–Q40), 4 parts, ~10 questions per part.

---

## Progress

| Book | Test 1 | Test 2 | Test 3 | Test 4 |
|------|--------|--------|--------|--------|
| 11   | ✓ sample (skip) | ✓ done | ✓ done | ✓ done |
| 12   | ✓ done | ✓ done | ✓ done | ✓ done |
| 13   | ✓ done | ✓ done | ✓ done | ✓ done |
| 14   | ✓ done | ✓ done | ✓ done | ✓ done |
| 15   | ✓ done | ✓ done | ✓ done | ✓ done |
| 16   | ✓ done | ✓ done | ✓ done | ✓ done |
| 17   | ✓ done | ✓ done | ✓ done | ✓ done |
| 18   | ✓ done | ✓ done | ✓ done | ✓ done |
| 19   | ✓ done | ✓ done | ✓ done | ✓ done |

**Remaining: 0 tests — ALL COMPLETE ✓**

---

## Workflow (How We Work Together)

1. User shares a **screenshot** of one section from the book
2. User states the **question type** (e.g. "SENTENCE_COMPLETION", "MULTIPLE_CHOICE")
3. Claude writes the JSON for that section
4. User reviews — says "ok" or points out corrections
5. Repeat for next section until all 4 parts are done
6. Claude assembles the full test JSON and saves it to the correct file

**Tip:** Share one full part at a time (e.g. all of Part 1) to go faster.

---

## File Structure

```json
{
  "testId": "book-14-test-1",
  "bookId": "book-14",
  "title": "Cambridge IELTS 14 – Listening Test 1",
  "audioSrc": "",
  "totalQuestions": 40,
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Part 1",
      "questionGroups": [ ...groups... ]
    },
    {
      "sectionNumber": 2,
      "title": "Part 2",
      "questionGroups": [ ...groups... ]
    },
    {
      "sectionNumber": 3,
      "title": "Part 3",
      "questionGroups": [ ...groups... ]
    },
    {
      "sectionNumber": 4,
      "title": "Part 4",
      "questionGroups": [ ...groups... ]
    }
  ]
}
```

---

## Question Type JSON Structures

### 1. SENTENCE_COMPLETION

Used for: notes, forms, sentences with blanks.

```json
{
  "type": "SENTENCE_COMPLETION",
  "instruction": "Complete the notes below. Write **ONE WORD AND/OR A NUMBER** for each answer.",
  "startQuestion": 1,
  "endQuestion": 10,
  "data": {
    "title": "Section title (e.g. form name)",
    "sentences": [
      {
        "content": ["Plain text line with no input"]
      },
      {
        "content": [{ "type": "bold", "text": "Bold label or example" }]
      },
      {
        "questionNumber": 1,
        "content": [
          "Text before the blank ",
          { "id": "1", "type": "input" },
          " text after the blank"
        ]
      }
    ]
  }
}
```

**Rules:**
- Every input `{ "id": "N", "type": "input" }` — `id` must match the question number as a string
- Lines with no input have no `questionNumber`
- Bold text uses `{ "type": "bold", "text": "..." }`
- Multiple inputs on one line are allowed (use two input objects in the content array)
- For sub-sections within the same group (e.g. "Location", "Building design"), add more groups with `"hideRange": true`
- The Example row (with no question number) uses bold for the answer: `[{ "type": "bold", "text": "AnswerWord" }]`

---

### 2. MULTIPLE_CHOICE

Used for: single answer (A/B/C) or TWO answers questions.

**Single answer:**
```json
{
  "type": "MULTIPLE_CHOICE",
  "instruction": "Choose the correct letter, A, B or C.",
  "startQuestion": 21,
  "endQuestion": 24,
  "data": {
    "questions": [
      {
        "id": "21",
        "questionNumber": 21,
        "text": "The question text goes here",
        "options": [
          { "letter": "A", "text": "Option A text" },
          { "letter": "B", "text": "Option B text" },
          { "letter": "C", "text": "Option C text" }
        ]
      }
    ]
  }
}
```

**Two answers (choose TWO):**
```json
{
  "type": "MULTIPLE_CHOICE",
  "instruction": "Choose **TWO** letters, A–E.",
  "startQuestion": 11,
  "endQuestion": 12,
  "data": {
    "questions": [
      {
        "id": "11-12",
        "text": "Which TWO things does the speaker mention?",
        "options": [
          { "letter": "A", "text": "Option A" },
          { "letter": "B", "text": "Option B" },
          { "letter": "C", "text": "Option C" },
          { "letter": "D", "text": "Option D" },
          { "letter": "E", "text": "Option E" }
        ],
        "multiple": true,
        "count": 2
      }
    ]
  }
}
```

**Rules:**
- For "choose TWO" spanning 2 question numbers: `id` = `"11-12"`, `multiple: true`, `count: 2`
- The `text` field must be the actual question prompt — not "Questions 11 and 12"
- For separate single questions in one group: add multiple objects to the `questions` array, each with its own `id` and `questionNumber`

---

### 3. SUMMARY_COMPLETION

Used for: a paragraph with multiple blanks.

```json
{
  "type": "SUMMARY_COMPLETION",
  "instruction": "Complete the summary below. Write **NO MORE THAN TWO WORDS** for each answer.",
  "startQuestion": 15,
  "endQuestion": 20,
  "data": {
    "title": "Summary title",
    "content": [
      "Text before first blank ",
      { "id": "15", "type": "input" },
      " more text ",
      { "id": "16", "type": "input" },
      " rest of paragraph."
    ]
  }
}
```

**Rules:**
- `content` is a flat array alternating plain strings and input objects
- All inputs must be in reading order matching question numbers

---

### 4. TABLE_COMPLETION

Used for: a table where some cells are blanks.

```json
{
  "type": "TABLE_COMPLETION",
  "instruction": "Complete the table below. Write **NO MORE THAN ONE WORD** for each answer.",
  "startQuestion": 31,
  "endQuestion": 35,
  "data": {
    "title": "Table title",
    "headers": ["Column 1", "Column 2", "Column 3", "Column 4"],
    "rows": [
      [
        "Normal cell text",
        { "id": "31", "questionNumber": 31 },
        "Another normal cell",
        "£120"
      ],
      [
        ["Text before blank ", { "id": "32", "type": "input" }, " text after"],
        "Normal cell",
        "Normal cell",
        "Normal cell"
      ]
    ]
  }
}
```

**Rules:**
- Each row is an array — elements are either plain strings, input objects, or mixed content arrays
- Standalone input cell: `{ "id": "N", "questionNumber": N }`
- Mixed content cell (text + blank): use a ContentPart array

---

### 5. FLOW_CHART_DRAG_DROP

Used for: a flowchart where answers are dragged from a word pool into gaps.

```json
{
  "type": "FLOW_CHART_DRAG_DROP",
  "instruction": "Complete the flow-chart. Choose the correct answer and move it into the gap.",
  "startQuestion": 1,
  "endQuestion": 5,
  "data": {
    "title": "Flow chart title",
    "options": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9"],
    "steps": [
      {
        "type": "text",
        "content": "A plain text step with no blank"
      },
      {
        "type": "interactive",
        "content": [
          "Text before blank ",
          { "id": "1", "type": "dropzone" },
          " text after blank."
        ]
      }
    ]
  }
}
```

**Rules:**
- `options` = the word bank (all the draggable words) — include ~4 more words than there are blanks (distractors)
- Steps alternate between `"type": "text"` (no blank) and `"type": "interactive"` (has dropzone)
- Dropzone: `{ "id": "N", "type": "dropzone" }` — `id` matches question number as string

---

### 6. MATCHING_FEATURE

Used for: matching a list of items (people, days, places, films, etc.) to a set of descriptions/features.
This is the **text-based matching** type — options box on the left, radio-grid on the right.

> **Use this** when the question shows a box of options (A, B, C…) and asks you to match each item to one option. Do **NOT** use MAP_DIAGRAM_LABELLING for these.

```json
{
  "type": "MATCHING_FEATURE",
  "instruction": "What does the speaker say about each of the following? Choose the correct letter, **A–G**, next to **Questions 16–20**.",
  "startQuestion": 16,
  "endQuestion": 20,
  "data": {
    "title": "Comments",
    "rightSideTitle": "Films",
    "options": [
      { "letter": "A", "text": "Description for option A" },
      { "letter": "B", "text": "Description for option B" },
      { "letter": "C", "text": "Description for option C" },
      { "letter": "D", "text": "Description for option D" },
      { "letter": "E", "text": "Description for option E" },
      { "letter": "F", "text": "Description for option F" },
      { "letter": "G", "text": "Description for option G" }
    ],
    "questions": [
      { "id": "16", "questionNumber": 16, "text": "Item name (e.g. Wednesday)" },
      { "id": "17", "questionNumber": 17, "text": "Item name" },
      { "id": "18", "questionNumber": 18, "text": "Item name" },
      { "id": "19", "questionNumber": 19, "text": "Item name" },
      { "id": "20", "questionNumber": 20, "text": "Item name" }
    ]
  }
}
```

**Rules:**
- `title` = the heading above the options box (left side), e.g. "Comments", "Plans", "Responsibilities"
- `rightSideTitle` = optional heading above the questions grid (right side), e.g. "Films", "Facilities", "Mountain trails" — omit if not needed
- `options` = the lettered list of descriptions (A, B, C…) — parse from the box in the book
- `questions` = the items being matched (people, days, places, films, etc.)
- Layout: options box LEFT (fixed 400px), questions radio grid RIGHT

---

### 7. MAP_DIAGRAM_LABELLING

Used **only** for: labelling an actual map or diagram image using letters (A, B, C…).

> **Only use this** when there is a real map/floor plan image. For text-only "match the box" questions, use **MATCHING_FEATURE** instead.

```json
{
  "type": "MAP_DIAGRAM_LABELLING",
  "instruction": "Label the plan below. Write the correct letter, **A–H**, next to **Questions 17–20**.",
  "startQuestion": 17,
  "endQuestion": 20,
  "data": {
    "title": "Basement of museum",
    "imageSrc": "/images/book-11-test-4-part2-map.jpg",
    "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
    "questions": [
      { "id": "17", "questionNumber": 17, "text": "restaurant" },
      { "id": "18", "questionNumber": 18, "text": "cafe" },
      { "id": "19", "questionNumber": 19, "text": "baby-changing facilities" },
      { "id": "20", "questionNumber": 20, "text": "cloakroom" }
    ]
  }
}
```

**Rules:**
- `imageSrc` = path to image in `public/images/` (e.g. `/images/book-12-test-4-part2-map.jpg`)
- Save the map image to `public/images/` with a descriptive filename
- `options` = the letters shown on the map (A through however many locations)
- `questions` = the place names the student must match to a letter on the map

---

## Multi-Group Pattern (Sub-sections within one Part)

When a part has multiple sub-sections (e.g. "Introduction", "Location", "Building design"), use separate groups with `hideRange: true` on all except the first:

```json
"questionGroups": [
  {
    "type": "SENTENCE_COMPLETION",
    "instruction": "Write **ONE WORD ONLY** for each answer.",
    "startQuestion": 31,
    "endQuestion": 31,
    "data": { "title": "Introduction", "sentences": [...Q31 only...] }
  },
  {
    "type": "SENTENCE_COMPLETION",
    "instruction": "",
    "startQuestion": 32,
    "endQuestion": 33,
    "hideRange": true,
    "data": { "title": "Location", "sentences": [...Q32-33...] }
  },
  {
    "type": "SENTENCE_COMPLETION",
    "instruction": "",
    "startQuestion": 34,
    "endQuestion": 40,
    "hideRange": true,
    "data": { "title": "Building design", "sentences": [...Q34-40...] }
  }
]
```

---

## Checklist Before Saving a Test

- [ ] All 4 parts present (Part 1–4)
- [ ] Questions run Q1–Q40 with no gaps and no overlaps
- [ ] Every input/dropzone `id` matches its question number (as a string)
- [ ] `startQuestion` and `endQuestion` are correct on every group
- [ ] Text-based matching uses `MATCHING_FEATURE` (not MAP_DIAGRAM_LABELLING)
- [ ] `MAP_DIAGRAM_LABELLING` only used when there is a real image — `imageSrc` set correctly
- [ ] FLOW_CHART_DRAG_DROP `options` pool has enough words (answers + distractors)
- [ ] File saved to correct path: `src/data/academic/book-{N}/listening/test-{N}.json`
- [ ] File imported in `ListeningTestActualPage.tsx` and added to `testDataMap`
