# Reading Answer Highlights Guide

On the review page, after a student completes a reading test, the passage is shown with the answer locations highlighted in yellow. Each highlighted span is labelled with its question number (Q1, Q2, ...) so the student can immediately see where in the passage the answer came from.

This guide covers the full process: how to mark up a passage, how to convert it to JSON, and which rules apply to each question type.

---

## How it works (architecture)

### The tag format

Answers are embedded directly inside the existing `content` strings in the reading test JSON using `<q>` tags:

```json
{ "content": "<q id=\"1\">Populations of around two thirds of butterfly species have declined in Britain</q>. If this trend continues..." }
```

- `id` = the question number as a string (`"1"`, `"2"`, etc.)
- The content inside the tag = the passage sentence or phrase that locates the answer
- Everything outside the tags = plain text, rendered normally

### What happens in each mode

| Mode | Behaviour |
|---|---|
| **Actual test** | `stripQTags()` strips all `<q>` tags — student sees clean plain text, no XML leaking |
| **Review page** | `renderPassageText()` parses the tags and renders each as a yellow highlighted span with a bold Q-number label |

### Component chain

```
test-N.json
  └── passage.sections[].content   ← <q id="N"> tags live here

ReadingPassage.tsx
  ├── isReview=false (test page)   → stripQTags(content) → <Highlightable>  (plain text, highlightable)
  └── isReview=true  (review page) → renderPassageText(content) → yellow spans with Q labels

ReviewPage.tsx
  └── <ReadingPassage isReview={true} ... />
```

### Where the files are

```
src/
  data/academic/book-{N}/reading/test-{N}.json     ← add <q> tags here
  components/TestDetailComponents/
    TestDetailContainer/
      ReadingPassage.tsx                            ← stripQTags + renderPassageText
      ReadingPassage.css                            ← .passage__answer* styles
  pages/ReviewPage/ReviewPage.tsx                   ← passes isReview={true}
```

---

## Source format → JSON format

The person providing the passage uses this format to mark answer locations:

```
[Q1] **the sentence or phrase that locates the answer**
```

Convert this to the JSON `<q>` tag format:

| Source | JSON |
|---|---|
| `[Q1] **populations of around two thirds of butterfly species have declined**` | `<q id="1">populations of around two thirds of butterfly species have declined</q>` |
| `[Q3] **Scientists refer to the timing of such lifecycle events as 'phenology'**` | `<q id="3">Scientists refer to the timing of such lifecycle events as 'phenology'</q>` |

**Rules for the conversion:**
- Remove `[QN]` and `**` markers entirely
- Wrap the marked text with `<q id="N">...</q>`
- Escape double quotes in JSON: `"` → `\"`
- Do NOT include trailing punctuation (`.`, `,`) inside the `<q>` tag unless it is part of the highlighted phrase
- Preserve the rest of the paragraph exactly as-is

---

## Rules by question type

Different question types require different scopes for what gets highlighted.

### TRUE / FALSE / NOT GIVEN (IDENTIFICATION)

Highlight the **full sentence(s)** from the passage that allow the student to determine the answer. This is typically one or two sentences.

- TRUE: highlight the sentence that directly confirms the statement
- FALSE: highlight the sentence that directly contradicts the statement
- NOT GIVEN: highlight the most relevant sentence(s) — the ones a student would read to conclude the information is absent

**Example:**

Question: *Caterpillars are eaten by a number of different predators.*
Passage: *Butterfly eggs develop into caterpillars and these insects ... consume vast quantities of plant material, and **in turn act as prey for birds as well as bats and other small mammals**.*

Mark the full relevant sentence:
```
[Q2] **Butterfly eggs develop into caterpillars and these insects, which are the second stage in a new butterfly's lifecycle, consume vast quantities of plant material, and in turn act as prey for birds as well as bats and other small mammals**
```

JSON:
```json
"<q id=\"2\">Butterfly eggs develop into caterpillars and these insects, which are the second stage in a new butterfly's lifecycle, consume vast quantities of plant material, and in turn act as prey for birds as well as bats and other small mammals</q>."
```

---

### SENTENCE COMPLETION / SUMMARY COMPLETION / NOTE COMPLETION

Highlight the **phrase in the passage that contains the answer word**. The highlight should give enough context for the student to see why that word was the answer — typically the clause or phrase immediately surrounding the answer word.

- Do NOT highlight just the answer word on its own — include enough context
- Do NOT highlight the entire paragraph

**Example:**

Question: *• lives in large ___* → answer: `colonies`
Passage: *...the dainty Small Blue, whose colonies are up to a hundred strong...*

Mark:
```
[Q7] **whose colonies are up to a hundred strong**
```

JSON:
```json
"...the dainty Small Blue, <q id=\"7\">whose colonies are up to a hundred strong</q>, ..."
```

---

### PARAGRAPH MATCHING (which paragraph contains X?)

Highlight the **phrase or sentence within the paragraph** that is the evidence for that paragraph being the correct answer. This is the specific piece of information the question is pointing to.

**Example:**

Question: *reference to the rapidly increasing need for one raw material in the transport industry* → Paragraph C
Passage paragraph C: *...demand for resources such as copper, aluminum, cobalt for electric car batteries...*

Mark within paragraph C's `content`:
```
[Q14] **demand for resources such as copper, aluminum, cobalt for electric car batteries**
```

JSON:
```json
"...point to the fact that <q id=\"14\">demand for resources such as copper, aluminum, cobalt for electric car batteries</q> and other metals to power technology..."
```

---

### MATCHING FEATURES (match statement to person/category)

Highlight the **quote or sentence attributed to that person or category** that the question statement is paraphrasing.

**Example:**

Question: *A move away from the exploration of heavily mined reserves on land is a good idea.* → Person D (Mike Johnston)
Passage: *...says Mike Johnston...: 'It makes sense to explore this untapped potential in an environmentally sustainable way, instead of continually looking at the fast depleting land resources of the planet...'*

Mark:
```
[Q18] **'It makes sense to explore this untapped potential in an environmentally sustainable way, instead of continually looking at the fast depleting land resources of the planet to meet society's rising needs.'**
```

---

### MATCHING HEADINGS

Do **not** add `<q>` tags for MATCHING_HEADING questions. The passage sections for these questions already have `questionId` and `heading` fields that drive the drop-zone UI. Adding highlight tags here would conflict with that mechanism.

---

### MULTIPLE CHOICE

Highlight the **sentence(s) in the passage that contain the evidence** for the correct answer option. If the question has a broad correct answer, highlight the most specific supporting sentence.

---

### DIAGRAM / MAP / FLOW CHART LABELLING

These are visual question types where the answer is a label placed on a diagram. There is typically **no passage text to highlight** — the diagram is self-contained. Skip `<q>` tags for these.

---

## Step-by-step: adding highlights to a passage

### Step 1 — Receive the marked passage

The user provides the passage with `[QN] **...**` markers. Each question gets its own marker.

```
[Q1] **full sentence or phrase for Q1**. Rest of the paragraph.
[Q2] **full sentence or phrase for Q2**.
```

### Step 1b — Compare the provided passage with the existing JSON

Before adding any `<q>` tags, compare every paragraph the user provides against the corresponding `content` string already in the test JSON. The user's text may contain OCR typos, missing punctuation, wrong dashes, or other discrepancies. **Always trust the existing JSON as the source of truth** — place `<q>` tags into the JSON text as-is, not into the user's version. If a significant mismatch is found (e.g., a whole sentence is missing or reordered), flag it before proceeding.

### Step 2 — Check the question types

Open the test JSON. For each question group:
- IDENTIFICATION (TRUE/FALSE) → full sentence scope
- SENTENCE_COMPLETION / SUMMARY_COMPLETION / NOTE_COMPLETION → narrow phrase scope
- PARAGRAPH_MATCHING → evidence phrase within the paragraph
- MATCHING_FEATURE → attributed quote/sentence
- MATCHING_HEADING → SKIP
- MULTIPLE_CHOICE → evidence sentence(s)
- Diagram types → SKIP

### Step 3 — Cross-check question count

Count the `[QN]` markers in the provided passage. They must cover every question that has a passage-based answer location (i.e., exclude MATCHING_HEADING and diagram types).

If a question is missing a marker, ask for clarification before proceeding.

### Step 4 — Convert markers to `<q>` tags

For each paragraph, locate the marked phrases and replace `[QN] **...**` with `<q id="N">...</q>`.

Multiple questions can appear in the same paragraph:
```json
{ "content": "<q id=\"4\">...sentence for Q4...</q> <q id=\"5\">...sentence for Q5...</q>." }
```

Questions in different paragraphs each go in their own `content` string.

### Step 5 — Handle edge cases

**Split across sentences:** If the evidence for one question spans the end of one sentence and the start of another, include both:
```json
"<q id=\"5\">Or are these populations under stress, being dragged along unwillingly by unnaturally fast changes? The answer is still unknown, but a new study is seeking to answer these questions</q>."
```

**Two questions in one sentence:** Split mid-sentence at the natural boundary:
```json
"...the dainty Small Blue, <q id=\"7\">whose colonies are up to a hundred strong</q>, <q id=\"8\">some develop into butterflies early in spring</q>, allowing..."
```

**Paragraphs with no questions:** Leave the `content` string untouched — no `<q>` tags, no modifications.

### Step 6 — Update the JSON file

Edit the `content` fields in the `passage.sections` array for the relevant section number. Do **not** touch passage 2 or passage 3 when working on passage 1.

### Step 7 — Verify

After saving:
1. Open the review page for that test
2. Confirm each highlighted span shows the correct Q-number
3. Open the actual test page and confirm the passage renders as clean plain text (no XML visible)
4. Count: number of highlights on screen must equal number of `<q>` tags in the JSON

---

## Progress tracker

Track which passages have had answer highlights added. A passage is ✅ only when **all** questions for that passage have `<q>` tags in the JSON.

| Book | Test   | Passage 1 | Passage 2 | Passage 3 |
|------|--------|-----------|-----------|-----------|
| C11  | Test 1 | ❌        | ❌        | ❌        |
| C11  | Test 2 | ❌        | ❌        | ❌        |
| C11  | Test 3 | ❌        | ❌        | ❌        |
| C11  | Test 4 | ❌        | ❌        | ❌        |
| C12  | Test 1 | ❌        | ❌        | ❌        |
| C12  | Test 2 | ❌        | ❌        | ❌        |
| C12  | Test 3 | ❌        | ❌        | ❌        |
| C12  | Test 4 | ❌        | ❌        | ❌        |
| C13  | Test 1 | ❌        | ❌        | ❌        |
| C13  | Test 2 | ❌        | ❌        | ❌        |
| C13  | Test 3 | ❌        | ❌        | ❌        |
| C13  | Test 4 | ❌        | ❌        | ❌        |
| C14  | Test 1 | ❌        | ❌        | ❌        |
| C14  | Test 2 | ❌        | ❌        | ❌        |
| C14  | Test 3 | ❌        | ❌        | ❌        |
| C14  | Test 4 | ❌        | ❌        | ❌        |
| C15  | Test 1 | ❌        | ❌        | ❌        |
| C15  | Test 2 | ❌        | ❌        | ❌        |
| C15  | Test 3 | ❌        | ❌        | ❌        |
| C15  | Test 4 | ❌        | ❌        | ❌        |
| C16  | Test 1 | ❌        | ❌        | ❌        |
| C16  | Test 2 | ❌        | ❌        | ❌        |
| C16  | Test 3 | ❌        | ❌        | ❌        |
| C16  | Test 4 | ❌        | ❌        | ❌        |
| C17  | Test 1 | ❌        | ❌        | ❌        |
| C17  | Test 2 | ❌        | ❌        | ❌        |
| C17  | Test 3 | ✅        | ✅        | ✅        |
| C17  | Test 4 | ✅        | ✅        | ✅        |
| C18  | Test 1 | ✅        | ✅        | ✅        |
| C18  | Test 2 | ✅        | ✅        | ✅        |
| C18  | Test 3 | ✅        | ✅        | ✅        |
| C18  | Test 4 | ✅        | ✅        | ✅        |
| C19  | Test 1 | ✅        | ✅        | ✅        |
| C19  | Test 2 | ✅        | ✅        | ✅        |
| C19  | Test 3 | ✅        | ✅        | ✅        |
| C19  | Test 4 | ✅        | ✅        | ✅        |

**Passages highlighted:** 30 / 108

---

## Common mistakes to avoid

| Mistake | Correct approach |
|---|---|
| Including `[QN]` text literally in the JSON | Remove all `[QN]` markers — they are source-format only |
| Including `**` markdown in the JSON | Remove all `**` markers — use `<q>` tags instead |
| Forgetting to escape `"` inside JSON strings | `<q id=\"1\">` not `<q id="1">` |
| Adding `<q>` tags for MATCHING_HEADING questions | Skip — those use `questionId` + `heading` fields on the section object |
| Putting the trailing `.` inside the `<q>` tag | Keep punctuation outside: `</q>.` not `.</q>` |
| Marking only the answer word instead of enough context | Include the full clause so the student understands why that word is correct |
| Modifying the wrong passage section | Always check `sectionNumber` in the JSON before editing |
| Adding `<q>` tags to passage 2 or 3 when working on passage 1 | Edit only the `sections[]` block for the target passage |
| Leaving raw `<q>` tags visible during the actual test | Confirm `stripQTags()` is applied on the test page — it is automatic; just don't break the import/props chain |

---

## CSS reference

The highlighted spans are styled with these classes in `ReadingPassage.css`:

```css
.passage__answer          /* yellow background wrapper */
.passage__answer-label    /* bold Q-number, 15px */
.passage__answer-text     /* answer text, normal weight */
```

These mirror the transcript highlight classes (`.transcript__answer*`) in `TranscriptPane.css`. Both use `background-color: #ffe066` — the same yellow as the manual text-highlight feature — for visual consistency.
