# Listening Transcript Guide

## File Structure

Transcripts are stored as **separate JSON files** alongside the test data:

```
src/data/academic/book-{n}/listening/
  ├── test-1.json              (test data)
  ├── test-1-answers.json      (answer key)
  └── test-1-transcript.json   (transcript — NEW)
```

**Why separate files?**
- Transcripts are only needed on the review page, not the test detail page
- Avoids unnecessary payload during the actual test
- When BE is ready, the backend will include transcript in the test response — no separate endpoint needed

## File Format

```json
{
  "testId": "book-11-test-1",
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Section 1",
      "transcript": [
        { "speaker": "OFFICIAL", "text": "Hello?" },
        { "speaker": "WOMAN", "text": "Oh, hello. I wanted to enquire about hiring a room." },
        { "speaker": "OFFICIAL", "text": "The <q id=\"1\">Charlton</q> Room – C-H-A-R-L-T-O-N." }
      ]
    }
  ]
}
```

## Answer Highlighting

Answers in the transcript are wrapped in `<q>` tags with the question number as `id`:

### Rules

1. Wrap the **entire highlighted phrase/sentence** from the source — not just the answer word
2. The `id` must match the question number exactly
3. If the same question spans across two speaker turns, use the same `id` in both turns
4. If the answer spans across a speaker turn, wrap each part separately with the same `id`

### How to convert from source to JSON

The source transcript uses `[QN] **highlighted text**` format. Convert as follows:

| Source format | JSON format |
|---|---|
| `[Q1] **Charlton Room – C-H-A-R-L-T-O-N. That's**` | `<q id="1">The Charlton Room – C-H-A-R-L-T-O-N. That's</q>` |
| `[Q2] **that'd be £115 – that's**` | `<q id="2">that'd be £115 – that's</q>` |
| `[Q5] **you'll have to see about getting a licence if you're planning to have any music during the meal.**` | `<q id="5">you'll have to see about getting a licence if you're planning to have any music during the meal.</q>` |

### Same question across two speaker turns

When a question's answer context spans across speakers, wrap each part with the same `id`:

Source:
```
WOMAN:    [Q9] **Sweep the floors I suppose?**
OFFICIAL: [Q9] **Well, actually they have to be washed, not just swept.**
```

JSON:
```json
{ "speaker": "WOMAN", "text": "<q id=\"9\">Sweep the floors I suppose?</q>" },
{ "speaker": "OFFICIAL", "text": "<q id=\"9\">Well, actually they have to be washed, not just swept.</q>" }
```

### How it renders on the review page

The `<q id="1">` tag renders as:
- Regular weight text (not bold) with yellow highlight background (`#ffe066` — same as the text highlight feature)
- Only the question number label **Q1** is bold
- The highlighted text stays normal weight to keep readability

Example rendered output:
> OFFICIAL: **Q1** The Charlton Room – C-H-A-R-L-T-O-N. That's got seating for up to one hundred.

## Speaker Format

| Speaker label | Use for |
|---|---|
| `""` (empty string) | Monologues, lectures, tours — no named speaker. Text takes full width. |
| `MAN` / `WOMAN` | Unnamed speakers in a conversation |
| `STUDENT` / `TUTOR` | Academic contexts |
| `INTERVIEWER` | Interview sections |
| Named (e.g. `OFFICIAL`, `DR SMITH`) | When the speaker is identified |

### No-speaker rule

When a section is a monologue (one person talking — lectures, tours, presentations), set `speaker` to an **empty string** `""`. Do NOT use `"NARRATOR"`. The text will render full-width without a speaker label.

```json
{ "speaker": "", "text": "Welcome to the Fiddy Working Heritage Farm..." }
```

## Checklist for each section

- [ ] All speaker turns are captured
- [ ] Every answer is wrapped in `<q id="N">` tag
- [ ] Question numbers match the answer key
- [ ] No `**` markdown markers remain — use `<q>` tags instead
- [ ] Speaker labels are consistent within the section
