# Reading Test JSON Guide

## File Locations
```
src/data/academic/book-{N}/reading/test-{N}.json          # test data
src/data/academic/book-{N}/reading/test-{N}-answers.json  # answer key
```

## Top-Level Structure
```json
{
  "testId": "book-12-test-1",
  "bookId": "book-12",
  "title": "Cambridge IELTS 12 – Reading Test 1",
  "totalQuestions": 40,
  "sections": [ ...3 sections (Passage 1, 2, 3)... ]
}
```

## Section Structure
```json
{
  "sectionNumber": 1,
  "title": "READING PASSAGE 1",
  "sectionHeading": "The Birth of Suburbia",
  "passage": { ...PassageData... },
  "questionGroups": [ ...groups... ]
}
```

## Passage Structure
```json
{
  "title": "The Birth of Suburbia",
  "sections": [
    {
      "questionId": "1",       // present only for MATCHING_HEADING paragraphs
      "heading": "A",          // optional paragraph label
      "content": "Full paragraph text goes here..."
    },
    {
      "heading": "B",
      "content": "Another paragraph..."
    }
  ]
}
```

**Rules:**
- `questionId` on a passage section renders a drop zone above that paragraph (for MATCHING_HEADING)
- Without `questionId`, the paragraph is read-only
- `content` is a plain string (the full paragraph text)

---

## Question Types

### IDENTIFICATION (True/False/Not Given or Yes/No/Not Given)
```json
{
  "type": "IDENTIFICATION",
  "instruction": "Do the following statements agree with the information given in the reading passage? Write **TRUE**, **FALSE** or **NOT GIVEN**.",
  "startQuestion": 1,
  "endQuestion": 7,
  "data": {
    "optionsType": "TRUE_FALSE",
    "questions": [
      { "id": "1", "text": "Twins who live apart are more similar than those who live together." },
      { "id": "2", "text": "Research confirms that personality is determined before birth." }
    ]
  }
}
```

**`optionsType` values (CRITICAL — use exactly these strings):**
- `"TRUE_FALSE"` — for factual claims (True / False / Not Given)
- `"YES_NO"` — for opinions/views (Yes / No / Not Given)

**⚠️ COMMON MISTAKE:** Do NOT use `"questionType"` or `"TRUE_FALSE_NOT_GIVEN"` / `"YES_NO_NOT_GIVEN"` — the component checks for `"optionsType"` specifically. Wrong field name causes a crash.

**Answer stored:** `"TRUE"` / `"FALSE"` / `"NOT GIVEN"` or `"YES"` / `"NO"` / `"NOT GIVEN"`

---

### MULTIPLE_CHOICE
```json
{
  "type": "MULTIPLE_CHOICE",
  "instruction": "Choose the correct letter, **A**, **B**, **C** or **D**.",
  "startQuestion": 14,
  "endQuestion": 17,
  "data": {
    "questions": [
      {
        "id": "14",
        "questionNumber": 14,
        "text": "What point does the writer make about the films of Hitchcock?",
        "options": [
          { "letter": "A", "text": "They were ahead of their time." },
          { "letter": "B", "text": "They have been widely analysed." },
          { "letter": "C", "text": "They are more relevant today than when made." },
          { "letter": "D", "text": "They show a unique approach to filmmaking." }
        ]
      }
    ]
  }
}
```

**Answer stored:** just the letter (e.g., `"C"`)

---

### SENTENCE_COMPLETION (reading)
```json
{
  "type": "SENTENCE_COMPLETION",
  "instruction": "Complete the summary below. Choose **NO MORE THAN TWO WORDS** from the passage for each answer.",
  "startQuestion": 27,
  "endQuestion": 31,
  "data": {
    "title": "Optional title",
    "sentences": [
      { "content": [{ "type": "bold", "text": "Introduction" }] },
      { "questionNumber": 27, "content": ["The process is known as ", { "id": "27", "type": "input" }, "."] },
      { "content": ["This occurs in most mammals."] }
    ]
  }
}
```

**Answer stored:** whatever the user types (string)

---

### SUMMARY_COMPLETION (paragraph drag-drop from passage word bank — rarely used)

Not commonly used. See `SummaryCompletion` component if needed.

---

### SUMMARY_COMPLETION_DRAG_DROP
Used when students select from a lettered word bank.

```json
{
  "type": "SUMMARY_COMPLETION_DRAG_DROP",
  "instruction": "Complete the summary below. Choose the correct letter **A–F**.",
  "startQuestion": 14,
  "endQuestion": 19,
  "data": {
    "title": "Summary title",
    "options": [
      { "letter": "A", "text": "emotions" },
      { "letter": "B", "text": "personality" },
      { "letter": "C", "text": "intelligence" }
    ],
    "content": [
      "The study found that ", { "id": "14", "type": "dropzone" },
      " plays a major role in ", { "id": "15", "type": "dropzone" }, "."
    ]
  }
}
```

**CRITICAL RULES:**
- Options **must** use `{ "letter": "A", "text": "word" }` format — NOT `"A   emotions"`
- `letter` = stored answer value (matches answer key)
- `text` = displayed in word bank (no letter prefix shown in UI)
- **Answer stored:** letter only (e.g., `"A"`)

---

### SENTENCE_COMPLETION_DRAG_DROP
Used when sentence endings are selected from a lettered option list.

```json
{
  "type": "SENTENCE_COMPLETION_DRAG_DROP",
  "instruction": "Complete each sentence with the correct ending, **A–G**, below.",
  "startQuestion": 19,
  "endQuestion": 22,
  "data": {
    "options": [
      { "letter": "A", "text": "be discouraged from attending university." },
      { "letter": "B", "text": "show similar behaviour patterns." },
      { "letter": "C", "text": "have identical physical characteristics." }
    ],
    "sentences": [
      { "questionNumber": 19, "content": ["Research by Lykken showed that twins raised apart tend to ", { "id": "19", "type": "dropzone" }] },
      { "questionNumber": 20, "content": ["Galton believed that gifted children would ", { "id": "20", "type": "dropzone" }] }
    ]
  }
}
```

**CRITICAL RULES:**
- Options **must** use `{ "letter": "A", "text": "..." }` format — NOT plain strings
- `letter` = stored answer value
- `text` = displayed in word bank (no letter prefix shown in UI)
- **Answer stored:** letter only (e.g., `"B"`)

---

### TABLE_COMPLETION (reading)
Same structure as listening. Used when answers fill blanks inside a table.

```json
{
  "type": "TABLE_COMPLETION",
  "instruction": "Complete the table below. Choose **ONE WORD ONLY** from the passage for each answer.",
  "startQuestion": 4,
  "endQuestion": 7,
  "data": {
    "title": "Intensive farming versus aeroponic urban farming",
    "headers": ["", "Growth", "Selection"],
    "rows": [
      [
        "Intensive farming",
        ["wide range of ", { "id": "4", "type": "input" }, " used"],
        ["varieties chosen that survive long ", { "id": "5", "type": "input" }]
      ],
      [
        "Aeroponic farming",
        "no soil used",
        ["produce chosen because of its ", { "id": "6", "type": "input" }]
      ]
    ]
  }
}
```

**Rules:**
- `headers` is a plain string array (first column label is usually `""`)
- Each row is an array of cells — each cell is a plain string OR a ContentPart array
- Use `{ "type": "br" }` inside a cell array for line breaks within a cell
- **Answer stored:** whatever the user types (string)

---

### FLOW_CHART_DRAG_DROP (reading)
Same structure as listening. See LISTENING_TEST_GUIDE.md.

**CRITICAL RULES (same as listening):**
- Options **must** use `{ "letter": "A", "text": "word" }` format
- **Answer stored:** letter only

---

### PARAGRAPH_MATCHING
```json
{
  "type": "PARAGRAPH_MATCHING",
  "instruction": "Reading Passage 2 has seven sections, **A–G**. Which section contains the following information?",
  "startQuestion": 14,
  "endQuestion": 19,
  "data": {
    "paragraphs": ["A", "B", "C", "D", "E", "F", "G"],
    "questions": [
      { "id": "14", "questionNumber": 14, "text": "a reference to research showing the similarity of twins" },
      { "id": "15", "questionNumber": 15, "text": "an explanation of why separated twins were studied" }
    ]
  }
}
```

**Rules:**
- `paragraphs` is the list of valid paragraph labels shown in dropdowns (⚠️ NOT `paragraphOptions` — that causes a crash)
- Dropdown shows `—` when unselected; `—` is hidden from the open dropdown list
- **Answer stored:** letter (e.g., `"C"`)

---

### MATCHING_HEADING
```json
{
  "type": "MATCHING_HEADING",
  "instruction": "Reading Passage 3 has six paragraphs, **A–F**. Choose the correct heading for each paragraph from the list of headings below.",
  "startQuestion": 27,
  "endQuestion": 32,
  "data": {
    "headings": [
      "i   A controversial discovery",
      "ii  An undisputed answer to the mystery",
      "iii The reaction of the scientific community",
      "iv  Early work in the field",
      "v   A lack of practical application",
      "vi  New techniques bring new findings",
      "vii Doubts about previous research",
      "viii A renewed focus on the subject"
    ]
  }
}
```

**CRITICAL RULES:**
- Each heading string **must** start with a Roman numeral prefix followed by spaces: `"ii  Text here"`
- The Roman numeral prefix is extracted as the stored answer id (lowercase, e.g., `"ii"`)
- The display text (in the word bank) strips the prefix
- The passage sections that correspond to each paragraph **must** have matching `questionId` values on their passage sections (e.g., `"27"`, `"28"`, etc.) to render the drop zones
- **Answer stored:** lowercase Roman numeral only (e.g., `"ii"`, `"vi"`)

**Passage sections for MATCHING_HEADING must have `questionId`:**
```json
"passage": {
  "title": "The Mystery of Memory",
  "sections": [
    { "questionId": "27", "heading": "A", "content": "First paragraph text..." },
    { "questionId": "28", "heading": "B", "content": "Second paragraph text..." }
  ]
}
```

---

### MATCHING_FEATURE (reading)
Same structure as listening MATCHING_FEATURE. Dropdown per question from a shared options pool.

```json
{
  "type": "MATCHING_FEATURE",
  "instruction": "Look at the following researchers (Questions 14–18) and the list of findings below. Match each researcher with the correct finding.",
  "startQuestion": 14,
  "endQuestion": 18,
  "data": {
    "title": "Findings",
    "options": [
      { "letter": "A", "text": "Twins share similar moral values." },
      { "letter": "B", "text": "Genetics affects fear responses." }
    ],
    "questions": [
      { "id": "14", "questionNumber": 14, "text": "Bouchard" },
      { "id": "15", "questionNumber": 15, "text": "Lykken" }
    ]
  }
}
```

**Answer stored:** letter only (e.g., `"A"`)

---

## Answer Key Format
```json
{
  "testId": "book-12-test-1",
  "answers": [
    { "questionNumber": 1,      "answerType": "SINGLE",   "acceptedAnswers": ["TRUE"] },
    { "questionNumber": 7,      "answerType": "SINGLE",   "acceptedAnswers": ["NOT GIVEN"] },
    { "questionNumber": 14,     "answerType": "SINGLE",   "acceptedAnswers": ["B"] },
    { "questionNumber": 19,     "answerType": "SINGLE",   "acceptedAnswers": ["D"] },
    { "questionNumber": 27,     "answerType": "SINGLE",   "acceptedAnswers": ["ii"] },
    { "questionNumber": "20-21","answerType": "MULTIPLE",  "acceptedAnswers": ["B", "D"], "count": 2 }
  ]
}
```

**⚠️ CRITICAL:** `answers` is an **array**, NOT an object. Each entry uses `acceptedAnswers` (array of strings), NOT `value`.

**Multiple acceptable answers** — list all variants in the array:
```json
{ "questionNumber": 4, "answerType": "SINGLE", "acceptedAnswers": ["labour", "labor"] }
{ "questionNumber": 6, "answerType": "SINGLE", "acceptedAnswers": ["railway", "railways"] }
```

**Values by question type:**
| Question Type | Answer Value |
|---|---|
| IDENTIFICATION | `"TRUE"` / `"FALSE"` / `"NOT GIVEN"` or `"YES"` / `"NO"` / `"NOT GIVEN"` |
| MULTIPLE_CHOICE | Letter: `"A"`, `"B"`, `"C"`, `"D"` |
| SENTENCE_COMPLETION | The expected word/phrase (string) |
| SENTENCE_COMPLETION_DRAG_DROP | Letter: `"A"`, `"B"`, etc. |
| SUMMARY_COMPLETION_DRAG_DROP | Letter: `"A"`, `"B"`, etc. |
| FLOW_CHART_DRAG_DROP | Letter: `"A"`, `"B"`, etc. |
| PARAGRAPH_MATCHING | Paragraph label: `"A"`, `"B"`, etc. |
| MATCHING_HEADING | Lowercase Roman numeral: `"i"`, `"ii"`, `"iii"`, etc. |
| MATCHING_FEATURE | Letter: `"A"`, `"B"`, etc. |

---

## Page Registration
New reading tests must be registered in:
```
src/pages/ReadingTestPage/ReadingTestActualPage.tsx
```

Add to the `testDataMap` object:
```tsx
"book-12-test-1": book12Test1Reading,
```

And add the import at the top of the file.

---

## Common Pitfalls

### 1. Drag-drop options must use `{ letter, text }` format
**Wrong:**
```json
"options": ["A   be discouraged from attending", "B   show similar behaviour"]
```
**Correct:**
```json
"options": [
  { "letter": "A", "text": "be discouraged from attending" },
  { "letter": "B", "text": "show similar behaviour" }
]
```
This applies to: `SENTENCE_COMPLETION_DRAG_DROP`, `SUMMARY_COMPLETION_DRAG_DROP`, `FLOW_CHART_DRAG_DROP`.

### 2. MATCHING_HEADING headings need Roman numeral prefix
**Wrong:**
```json
"headings": ["A controversial discovery", "An undisputed answer"]
```
**Correct:**
```json
"headings": ["i   A controversial discovery", "ii  An undisputed answer"]
```

### 3. MATCHING_HEADING needs `questionId` on passage sections
Each droppable paragraph must have `"questionId"` set to the question number string. Without it, no drop zone is rendered.

### 4. Paragraph dropdown shows `—` when closed
Both `PARAGRAPH_MATCHING` and `MATCHING_FEATURE` dropdowns show `—` as placeholder when nothing is selected, but `—` is not visible in the open dropdown list (implemented via `disabled hidden` on the placeholder option).

### 5. Answer key letter case
- MATCHING_HEADING answers: **lowercase** Roman numerals (`"ii"`, not `"II"`)
- All other letter answers: **uppercase** (`"A"`, `"B"`, not `"a"`, `"b"`)

---

## ⚠️ Critical Field Names Reference

These are the exact field names the components read. Using the wrong name causes a **crash with no helpful error message**.

| Question Type | Field | Correct Name | Wrong Name (causes crash) |
|---|---|---|---|
| `IDENTIFICATION` | question type | `"optionsType"` | ~~`"questionType"`~~ |
| `IDENTIFICATION` | TRUE/FALSE/NG value | `"TRUE_FALSE"` | ~~`"TRUE_FALSE_NOT_GIVEN"`~~ |
| `IDENTIFICATION` | YES/NO/NG value | `"YES_NO"` | ~~`"YES_NO_NOT_GIVEN"`~~ |
| `PARAGRAPH_MATCHING` | paragraph list | `"paragraphs"` | ~~`"paragraphOptions"`~~ |

### URL Structure
Test URLs follow this pattern:
```
/[examType]/[module]/[testId]

Examples:
/academic/reading/book-18-test-3
/academic/listening/book-11-test-1
/general-training/reading/book-19-test-2
```
The `testId` encodes everything (book + test number). Do not add a separate `bookId` segment.
