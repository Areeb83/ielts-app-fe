# Reading Test Creation Guide (Books 11–19)

## Project Context

This is an IELTS practice platform. Reading tests live in:
```
src/data/academic/book-{N}/reading/test-{N}.json
```

Each test has **exactly 40 questions** (Q1–Q40), **3 sections** (passages), ~13 questions per section.

---

## Progress

| Book | Test 1 | Test 2 | Test 3 | Test 4 |
|------|--------|--------|--------|--------|
| 11   | ✓ sample (skip) | ⬜ | ⬜ | ⬜ |
| 12   | ⬜ | ⬜ | ⬜ | ⬜ |
| 13   | ⬜ | ⬜ | ⬜ | ⬜ |
| 14   | ⬜ | ⬜ | ⬜ | ⬜ |
| 15   | ⬜ | ⬜ | ⬜ | ⬜ |
| 16   | ⬜ | ⬜ | ⬜ | ⬜ |
| 17   | ⬜ | ⬜ | ⬜ | ⬜ |
| 18   | ⬜ | ⬜ | ⬜ | ⬜ |
| 19   | ⬜ | ⬜ | ⬜ | ⬜ |

**Remaining: 35 / 36 tests**

---

## Wiring a New Test (Two Steps)

### Step 1 — Create the JSON file
Save to: `src/data/academic/book-{N}/reading/test-{N}.json`

### Step 2 — Register in `ReadingTestActualPage.tsx`
File: `src/pages/ReadingTestPage/ReadingTestActualPage.tsx`

```tsx
// Add import at the top
import book12Test1Reading from '../../data/academic/book-12/reading/test-1.json';

// Add to testDataMap
const testDataMap: Record<string, TestData> = {
    "book-11-test-1": book11Test1Reading as unknown as TestData,
    "book-12-test-1": book12Test1Reading as unknown as TestData,  // ← add this
};
```

The `testId` format is always: `book-{N}-test-{N}` (e.g. `book-12-test-1`)

---

## File Structure

```json
{
  "testId": "book-12-test-1",
  "bookId": "book-12",
  "title": "Cambridge IELTS 12 – Reading Test 1",
  "audioSrc": "",
  "totalQuestions": 40,
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Part 1",
      "passage": { ...PassageData... },
      "questionGroups": [ ...groups... ]
    },
    {
      "sectionNumber": 2,
      "title": "Part 2",
      "passage": { ...PassageData... },
      "questionGroups": [ ...groups... ]
    },
    {
      "sectionNumber": 3,
      "title": "Part 3",
      "passage": { ...PassageData... },
      "questionGroups": [ ...groups... ]
    }
  ]
}
```

---

## Passage Structure

Each section has a `passage` with a title and array of sections (paragraphs).

**Plain passage (no matching heading):**
```json
"passage": {
  "title": "The Rise of Automation",
  "sections": [
    { "content": "First paragraph text..." },
    { "content": "Second paragraph text..." }
  ]
}
```

**Passage with labelled sections (for MATCHING_HEADING):**
Each paragraph needs a `label` and a `questionId` that matches the question number:
```json
"passage": {
  "title": "The Rise of Automation",
  "sections": [
    { "label": "Section A", "questionId": "1", "content": "Paragraph A text..." },
    { "label": "Section B", "questionId": "2", "content": "Paragraph B text..." },
    { "label": "Section C", "questionId": "3", "content": "Paragraph C text..." },
    { "label": "Section D", "questionId": "4", "content": "Paragraph D text..." }
  ]
}
```

---

## Question Types — Full Reference

### 1. MATCHING_HEADING

Used for: drag a heading from a pool and drop it onto the correct passage section.
Drop zones live inside the passage (left pane), headings are dragged from the right pane.
This is the only type that requires the passage sections to have `label` and `questionId`.

```json
{
  "type": "MATCHING_HEADING",
  "instruction": "The text has four sections. Choose the correct heading for each section and move it into the gap.",
  "startQuestion": 1,
  "endQuestion": 4,
  "data": {
    "headings": [
      "Heading option i",
      "Heading option ii",
      "Heading option iii",
      "Heading option iv",
      "Heading option v",
      "Heading option vi",
      "Heading option vii"
    ]
  }
}
```

**Rules:**
- Always include more headings than questions (2–3 extra distractors)
- Headings are stored as a plain string array — no letters/numbers needed (rendered automatically as i, ii, iii…)
- The passage `questionId` on each section must match the question number string (e.g. `"1"`, `"2"`)

---

### 2. IDENTIFICATION (TRUE / FALSE / NOT GIVEN or YES / NO / NOT GIVEN)

Used for: statements the student must classify.

```json
{
  "type": "IDENTIFICATION",
  "instruction": "Do the following statements agree with the information given in the Reading Passage? Write TRUE, FALSE, or NOT GIVEN.",
  "startQuestion": 5,
  "endQuestion": 9,
  "data": {
    "optionsType": "TRUE_FALSE",
    "questions": [
      { "id": "5", "text": "Statement to evaluate..." },
      { "id": "6", "text": "Statement to evaluate..." }
    ]
  }
}
```

**Rules:**
- `optionsType`: `"TRUE_FALSE"` → renders TRUE / FALSE / NOT GIVEN buttons
- `optionsType`: `"YES_NO"` → renders YES / NO / NOT GIVEN buttons
- `id` must match question number as a string

---

### 3. SENTENCE_COMPLETION

Used for: fill-in-the-blank sentences (typed text input).

```json
{
  "type": "SENTENCE_COMPLETION",
  "instruction": "Complete the sentences below. Write **NO MORE THAN TWO WORDS** from the passage for each answer.",
  "startQuestion": 10,
  "endQuestion": 13,
  "data": {
    "title": "Optional section title",
    "sentences": [
      {
        "questionNumber": 10,
        "content": [
          "Text before blank ",
          { "id": "10", "type": "input" },
          " text after blank."
        ]
      },
      {
        "questionNumber": 11,
        "content": [
          "Another sentence ",
          { "id": "11", "type": "input" },
          "."
        ]
      }
    ]
  }
}
```

**Rules:**
- Each `id` must match the question number as a string
- Bold text: `{ "type": "bold", "text": "..." }`
- Lines with no blank: omit `questionNumber`, just use a string in `content`
- Multiple blanks per sentence: add multiple input objects in `content`

---

### 4. SENTENCE_COMPLETION_DRAG_DROP

Used for: sentences with blanks **or** sentence stems where the student drags an option from a pool below.
Two patterns:

**Pattern A — blank in the middle of a sentence (single word from pool):**
```json
{
  "type": "SENTENCE_COMPLETION_DRAG_DROP",
  "instruction": "Complete the sentences below. Choose ONE word from the box for each answer.",
  "startQuestion": 14,
  "endQuestion": 17,
  "data": {
    "options": ["word1", "word2", "word3", "word4", "word5", "word6"],
    "sentences": [
      {
        "questionNumber": 14,
        "content": [
          "Text before blank ",
          { "type": "dropzone", "id": "14" },
          " text after blank."
        ]
      }
    ]
  }
}
```

**Pattern B — sentence stem + drag the full ending:**
```json
{
  "type": "SENTENCE_COMPLETION_DRAG_DROP",
  "instruction": "Complete each sentence with the correct ending. Choose the correct answer and move it into the gap.",
  "startQuestion": 27,
  "endQuestion": 29,
  "data": {
    "options": [
      "full sentence ending option A.",
      "full sentence ending option B.",
      "full sentence ending option C.",
      "full sentence ending option D (distractor).",
      "full sentence ending option E (distractor)."
    ],
    "sentences": [
      {
        "questionNumber": 27,
        "content": [
          "The sentence stem goes here ",
          { "type": "dropzone", "id": "27" }
        ]
      }
    ]
  }
}
```

**Rules:**
- Options pool renders **below** all sentences (horizontal wrap)
- Include 2–3 distractor options beyond the number of questions
- Dropzone `id` must match question number as a string
- For sentence endings: dropzone goes at the very end of `content` (no trailing string)

---

### 5. SUMMARY_COMPLETION

Used for: a boxed paragraph with multiple blanks (typed input).

```json
{
  "type": "SUMMARY_COMPLETION",
  "instruction": "Complete the summary below. Write **NO MORE THAN TWO WORDS** from the passage for each answer.",
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
- `content` is a flat array — plain strings and input objects alternate
- All inputs in reading order matching question numbers

---

### 6. MULTIPLE_CHOICE

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
        "text": "Question prompt text?",
        "options": [
          { "letter": "A", "text": "Option A" },
          { "letter": "B", "text": "Option B" },
          { "letter": "C", "text": "Option C" }
        ]
      }
    ]
  }
}
```

**Choose TWO:**
```json
{
  "type": "MULTIPLE_CHOICE",
  "instruction": "Choose **TWO** letters, A–E.",
  "startQuestion": 25,
  "endQuestion": 26,
  "data": {
    "questions": [
      {
        "id": "25 – 26",
        "text": "Which TWO things are mentioned?",
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

---

### 7. TABLE_COMPLETION

Used for: a table where specific cells are blanks.

```json
{
  "type": "TABLE_COMPLETION",
  "instruction": "Complete the table below. Write **NO MORE THAN TWO WORDS** from the passage for each answer.",
  "startQuestion": 27,
  "endQuestion": 32,
  "data": {
    "title": "Table title",
    "headers": ["Column 1", "Column 2", "Column 3"],
    "rows": [
      [
        "Static cell text",
        { "id": "27", "questionNumber": 27 },
        "Static cell"
      ],
      [
        ["Text + ", { "id": "28", "type": "input" }, " inline blank"],
        "Static cell",
        "Static cell"
      ]
    ]
  }
}
```

**Rules:**
- Standalone blank cell: `{ "id": "N", "questionNumber": N }`
- Mixed content cell: array of ContentParts `["text ", { "id": "N", "type": "input" }, " text"]`
- Static text cell: plain string

---

### 8. MATCHING_FEATURE

Used for: matching items (people, places, years, inventions, etc.) to lettered options from a box.

```json
{
  "type": "MATCHING_FEATURE",
  "instruction": "Choose the correct group, A–E, for each item below.",
  "startQuestion": 33,
  "endQuestion": 37,
  "data": {
    "title": "First developed by",
    "options": [
      { "letter": "A", "text": "the Chinese" },
      { "letter": "B", "text": "the Indians" },
      { "letter": "C", "text": "the British" },
      { "letter": "D", "text": "the Arabs" },
      { "letter": "E", "text": "the Americans" }
    ],
    "questions": [
      { "id": "33", "questionNumber": 33, "text": "The item to be matched" },
      { "id": "34", "questionNumber": 34, "text": "The item to be matched" }
    ]
  }
}
```

**Rules:**
- `title` = heading above the options box
- `rightSideTitle` = optional heading above the questions column (omit if not needed)
- In reading mode, options box renders **below** the radio grid (handled automatically)

---

### 9. DIAGRAM_LABELLING

Used for: an image at the top with numbered text inputs below it.

```json
{
  "type": "DIAGRAM_LABELLING",
  "instruction": "Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
  "startQuestion": 31,
  "endQuestion": 35,
  "data": {
    "title": "The Water Cycle",
    "imageSrc": "/images/book-12-test-1-diagram.png",
    "questions": [
      { "id": "31", "questionNumber": 31 },
      { "id": "32", "questionNumber": 32, "label": "optional hint text" },
      { "id": "33", "questionNumber": 33 }
    ]
  }
}
```

**Rules:**
- `imageSrc` = path to image in `public/images/`
- `label` is optional — shows a hint next to the input (e.g. "type of soil")

---

### 10. MAP_DIAGRAM_LABELLING

Used for: a map/floor plan where the student matches place names to letters (A, B, C…) on the map.

```json
{
  "type": "MAP_DIAGRAM_LABELLING",
  "instruction": "Label the plan below. Write the correct letter, **A–H**, next to Questions 38–40.",
  "startQuestion": 38,
  "endQuestion": 40,
  "data": {
    "title": "Museum floor plan",
    "leftSideContent": {
      "type": "image",
      "value": "/images/book-12-test-1-map.png"
    },
    "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
    "questions": [
      { "id": "38", "questionNumber": 38, "text": "cafe" },
      { "id": "39", "questionNumber": 39, "text": "gift shop" },
      { "id": "40", "questionNumber": 40, "text": "information desk" }
    ]
  }
}
```

**Rules:**
- `leftSideContent.type` = `"image"` (map) or `"text"` (text description)
- `options` = all the letter labels visible on the map
- Images go in `public/images/` with a descriptive filename

---

## Multi-Group Pattern

When a section has multiple question type blocks, list them all in `questionGroups`:

```json
"questionGroups": [
  {
    "type": "MATCHING_HEADING",
    "startQuestion": 1,
    "endQuestion": 5,
    ...
  },
  {
    "type": "IDENTIFICATION",
    "startQuestion": 6,
    "endQuestion": 9,
    ...
  },
  {
    "type": "SENTENCE_COMPLETION",
    "startQuestion": 10,
    "endQuestion": 13,
    ...
  }
]
```

---

## Checklist Before Saving a Test

- [ ] All 3 sections present with a `passage` each
- [ ] Questions run Q1–Q40 with no gaps and no overlaps
- [ ] Every input/dropzone `id` matches its question number as a string
- [ ] `startQuestion` and `endQuestion` correct on every group
- [ ] Passage sections have `label` + `questionId` only when using `MATCHING_HEADING`
- [ ] `MATCHING_HEADING` headings pool has 2–3 extra distractors
- [ ] `SENTENCE_COMPLETION_DRAG_DROP` options pool has 2–3 extra distractors
- [ ] Images saved to `public/images/` and `imageSrc` path is correct
- [ ] File saved to: `src/data/academic/book-{N}/reading/test-{N}.json`
- [ ] Import added in `ReadingTestActualPage.tsx`
- [ ] Entry added to `testDataMap` in `ReadingTestActualPage.tsx`
