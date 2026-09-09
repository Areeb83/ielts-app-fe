# Reading Passages

Raw passage text storage. Update the checklist below as passages are added.

---

## Architecture

### Where passage text is stored (data)

Passage text lives inside the existing reading test JSON files:

```
src/data/academic/book-{N}/reading/test-{N}.json
  → sections[]
      → passage
          → sections[]
              → content   ← the actual paragraph text goes here
```

This file (`READING_PASSAGES.md`) is the **staging area** — paste raw passage text here, then the content gets formatted and inserted into the correct `content` fields in the JSON.

### Where passages are shown (UI)

Rendered by `ReadingPassage.tsx` in two places:

1. **Test page** (`/academic/reading/book-11-test-1`) — left pane of the split layout (60% width), alongside questions on the right. Text is highlightable.
2. **Review page** (`/academic/reading/book-11-test-1/review`) — same left pane, read-only, while the right shows correct answers vs user answers.

No new component or route is needed — once the `content` fields are filled in the JSON, the passage text appears automatically in both views.

### Workflow

1. Paste a raw passage into this file under the correct heading.
2. The JSON file (`test-N.json`) is located, the correct section found, and the `content` fields filled in.
3. Mark the passage ✅ in the checklist below.

---

## Passage Checklist

| Book | Test   | Passage 1 | Passage 2 | Passage 3 |
|------|--------|-----------|-----------|-----------|
| C11  | Test 1 | ✅        | ✅        | ✅        |
| C11  | Test 2 | ✅        | ✅        | ✅        |
| C11  | Test 3 | ✅        | ✅        | ✅        |
| C11  | Test 4 | ✅        | ✅        | ✅        |
| C12  | Test 1 | ✅        | ✅        | ✅        |
| C12  | Test 2 | ✅        | ✅        | ✅        |
| C12  | Test 3 | ✅        | ✅        | ✅        |
| C12  | Test 4 | ✅        | ✅        | ✅        |
| C13  | Test 1 | ✅        | ✅        | ✅        |
| C13  | Test 2 | ✅        | ✅        | ✅        |
| C13  | Test 3 | ✅        | ✅        | ✅        |
| C13  | Test 4 | ✅        | ✅        | ✅        |
| C14  | Test 1 | ✅        | ✅        | ✅        |
| C14  | Test 2 | ✅        | ✅        | ✅        |
| C14  | Test 3 | ✅        | ✅        | ✅        |
| C14  | Test 4 | ✅        | ✅        | ✅        |
| C15  | Test 1 | ✅        | ✅        | ✅        |
| C15  | Test 2 | ✅        | ✅        | ✅        |
| C15  | Test 3 | ✅        | ✅        | ✅        |
| C15  | Test 4 | ✅        | ✅        | ✅        |
| C16  | Test 1 | ✅        | ✅        | ✅        |
| C16  | Test 2 | ✅        | ✅        | ✅        |
| C16  | Test 3 | ✅        | ✅        | ✅        |
| C16  | Test 4 | ✅        | ✅        | ✅        |
| C17  | Test 1 | ✅        | ✅        | ✅        |
| C17  | Test 2 | ✅        | ✅        | ✅        |
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

**Passages:** 108 / 108 done

---

## Passages

<!-- Paste passage text below, one section per passage -->

