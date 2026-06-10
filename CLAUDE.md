# Project Instructions

## Git Commits
- Never add a `Co-Authored-By` line to commit messages.

## Progress Tracking
- After adding any new reading or listening test, always update the progress tracker table in `src/guidelines/Guidelines.md`.

## Adding Reading Tests — MATCHING_HEADING Rules

When a reading test contains a `MATCHING_HEADING` question group, the passage sections that correspond to those questions **must** have `questionId` and `heading` fields so the drag-and-drop dropzones render correctly on each paragraph.

### How to wire it up

1. Find the `MATCHING_HEADING` question group in the test data. Note its `startQuestion` and `endQuestion`.
2. In the same section's `passage.sections` array, each paragraph that maps to a heading question must have:
   - `"questionId"`: the question number as a string, assigned sequentially starting from `startQuestion`.
   - `"heading"`: the paragraph label letter (`"A"`, `"B"`, `"C"`, ...).
   - `"content"`: the paragraph text.
3. The mapping is always **sequential**: Paragraph A → `startQuestion`, Paragraph B → `startQuestion + 1`, and so on.

### Correct format example

If `startQuestion` is 14 and the passage has paragraphs A–G:

```json
"passage": {
  "title": "Example Passage Title",
  "sections": [
    { "questionId": "14", "heading": "A", "content": "Paragraph A text..." },
    { "questionId": "15", "heading": "B", "content": "Paragraph B text..." },
    { "questionId": "16", "heading": "C", "content": "Paragraph C text..." },
    { "questionId": "17", "heading": "D", "content": "Paragraph D text..." },
    { "questionId": "18", "heading": "E", "content": "Paragraph E text..." },
    { "questionId": "19", "heading": "F", "content": "Paragraph F text..." },
    { "questionId": "20", "heading": "G", "content": "Paragraph G text..." }
  ]
}
```

### Common mistakes to avoid

- Do NOT use `"label"` instead of `"heading"` — the component reads `heading`.
- Do NOT omit `questionId` — without it, no dropzone renders on the paragraph.
- Do NOT mismatch the count: if there are 7 questions (14–20), there must be exactly 7 passage sections with `questionId`.
- Sections in the same passage that do NOT belong to a MATCHING_HEADING question (e.g., an intro paragraph with no question) should have **no** `questionId` field.

### When the user provides a new reading test or passage text

1. Always check if any question group has `"type": "MATCHING_HEADING"`. If so, automatically add `questionId` and `heading` to the passage sections — do not wait to be told.
2. Cross-check the passage against the existing question JSON to ensure compatibility:
   - Paragraph count matches question count (for MATCHING_HEADING)
   - Summary completion blanks align with the passage text
   - Diagram/flow chart question IDs match any referenced zones
   - All question type data is consistent with the passage content
3. Flag any mismatches before finalizing.
