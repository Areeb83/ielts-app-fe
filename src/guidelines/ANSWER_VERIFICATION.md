# Answer Key Verification Tracker

## Process

1. **User provides** the official correct answers from the physical book (e.g. "C11 Reading Test 1: 1. tomatoes, 2. urban centres, 3. energy ...")
2. **Agent reads** the project's answer key JSON at `src/data/academic/book-{n}/{module}/test-{n}-answers.json`
3. **Agent compares** each question number:
   - Does the correct answer from the book exist in `acceptedAnswers[]`?
   - Are there missing alternative spellings? (e.g. British vs American: "centres" / "centers")
   - Is the `questionNumber` count correct? (reading = 40, listening = 40)
   - Are multi-word answers properly handled? (e.g. "fossil fuel" not just "fossil")
4. **Agent reports** mismatches in this format:
   ```
   Q3: Book says "energy costs" | Project has ["energy"] — MISMATCH
   Q15: Book says "NOT GIVEN" | Project has ["NOT GIVEN"] — OK
   ```
5. **Agent fixes** the answer key JSON if mismatches are found
6. **Agent marks** the table below as verified

## Answer key file format

```
Location: src/data/academic/book-{n}/{reading|listening}/test-{n}-answers.json

{
  "testId": "book-11-test-1",
  "answers": [
    { "questionNumber": 1, "answerType": "SINGLE", "acceptedAnswers": ["tomatoes"] },
    { "questionNumber": 2, "answerType": "SINGLE", "acceptedAnswers": ["urban centres", "urban centers"] }
  ]
}
```

- `acceptedAnswers` is an array — multiple valid spellings/forms are allowed
- Comparison is case-insensitive, whitespace-normalized
- Some questions accept shortened forms (e.g. "stacked trays" and "trays" both valid)

## What to check

- [ ] Every question (1-40) is present
- [ ] Correct answer from the book is in `acceptedAnswers`
- [ ] Alternative spellings included where needed (British/American, singular/plural)
- [ ] Multi-select questions have correct answer count
- [ ] No typos in answer strings

---

## Academic Reading

| Book | Test 1 | Test 2 | Test 3 | Test 4 |
|------|--------|--------|--------|--------|
| C11  | [ ]    | [ ]    | [ ]    | [ ]    |
| C12  | [ ]    | [ ]    | [ ]    | [ ]    |
| C13  | [ ]    | [ ]    | [ ]    | [ ]    |
| C14  | [ ]    | [ ]    | [ ]    | [ ]    |
| C15  | [ ]    | [ ]    | [ ]    | [ ]    |
| C16  | [ ]    | [ ]    | [ ]    | [ ]    |
| C17  | [ ]    | [ ]    | [ ]    | [ ]    |
| C18  | [ ]    | [ ]    | [ ]    | [ ]    |
| C19  | [ ]    | [ ]    | [ ]    | [ ]    |

## Academic Listening

| Book | Test 1 | Test 2 | Test 3 | Test 4 |
|------|--------|--------|--------|--------|
| C11  | [ ]    | [ ]    | [ ]    | [ ]    |
| C12  | [ ]    | [ ]    | [ ]    | [ ]    |
| C13  | [ ]    | [ ]    | [ ]    | [ ]    |
| C14  | [ ]    | [ ]    | [ ]    | [ ]    |
| C15  | [ ]    | [ ]    | [ ]    | [ ]    |
| C16  | [ ]    | [ ]    | [ ]    | [ ]    |
| C17  | [ ]    | [ ]    | [ ]    | [ ]    |
| C18  | [ ]    | [ ]    | [ ]    | [ ]    |
| C19  | [ ]    | [ ]    | [ ]    | [ ]    |

## Mismatches Log

Record any fixes made here:

```
(none yet)
```
