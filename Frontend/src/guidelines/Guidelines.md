# Orange IELTS – Developer Guidelines

## Reference Guides

- [LISTENING_TEST_GUIDE.md](./LISTENING_TEST_GUIDE.md) — How to create listening test JSON files (all question types, answer keys, common patterns)
- [READING_TEST_GUIDE.md](./READING_TEST_GUIDE.md) — How to create reading test JSON files (all question types, passage structure, answer keys, common pitfalls)

---

## Test Progress Tracker

### Academic Reading

| Book    | Test 1 | Test 2 | Test 3 | Test 4 |
|---------|--------|--------|--------|--------|
| Book 11 | ✅     | ✅     | ✅     | ✅     |
| Book 12 | ✅     | ✅     | ✅     | ✅     |
| Book 13 | ✅     | ✅     | ✅     | ✅     |
| Book 14 | ✅     | ✅     | ✅     | ✅     |
| Book 15 | ✅     | ✅     | ✅     | ✅     |
| Book 16 | ✅     | ✅     | ✅     | ✅     |
| Book 17 | ✅     | ✅     | ✅     | ✅     |
| Book 18 | ✅     | ✅     | ✅     | ✅     |
| Book 19 | ✅     | ✅     | ✅     | ✅     |

### Academic Listening

| Book    | Test 1 | Test 2 | Test 3 | Test 4 |
|---------|--------|--------|--------|--------|
| Book 11 | ✅     | ✅     | ✅     | ✅     |
| Book 12 | ✅     | ✅     | ✅     | ✅     |
| Book 13 | ✅     | ✅     | ✅     | ✅     |
| Book 14 | ✅     | ✅     | ✅     | ✅     |
| Book 15 | ✅     | ✅     | ✅     | ✅     |
| Book 16 | ✅     | ✅     | ✅     | ✅     |
| Book 17 | ✅     | ✅     | ✅     | ✅     |
| Book 18 | ✅     | ✅     | ✅     | ✅     |
| Book 19 | ✅     | ✅     | ✅     | ✅     |

**Reading:** 36 / 36 tests done (All books complete ✅)
**Listening:** 36 / 36 tests done (All books complete ✅)

### Listening Transcripts

| Book    | Test 1 | Test 2 | Test 3 | Test 4 |
|---------|--------|--------|--------|--------|
| C11     | ✅     | ✅     | ✅     | ✅     |
| C12     | ✅     | ✅     | ✅     | ✅     |
| C13     | ✅     | ✅     | ⏸️     | ✅     |
| C14     | ✅     | ✅     | ✅     | ✅     |
| C15     | ✅     | ✅     | ✅     | ✅     |
| C16     | ✅     | ✅     | ✅     | ✅     |
| C17     | ✅     | ✅     | ✅     | ✅     |
| C18     | ✅     | ✅     | ✅     | ✅     |
| C19     | ✅     | ✅     | ✅     | ✅     |

**Transcripts:** 35 / 36 done

> **Note:** Update this progress tracker every time a new transcript is added.
> ⏸️ = Deferred — do NOT attempt to create or assign content for these until explicitly instructed.

### Deferred Transcripts

These are intentionally skipped and must not be worked on until the user says so:

- **C13 Test 3** — deferred indefinitely

---

## TODO

- [ ] Decide result page route structure when BE is ready — currently `/academic/:module/:testId/result` where `testId` is `book-11-test-1`. When BE is implemented, `testId` will likely be a backend-generated ID (UUID or numeric). Need to decide how the result page gets test metadata (book name, test number, module) — either from the BE response or from route state.
