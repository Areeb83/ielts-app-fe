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

> **Note:** Update this progress tracker every time a new test is added.

---

## TODO

- [ ] Decide result page route structure when BE is ready — currently `/academic/:module/:testId/result` where `testId` is `book-11-test-1`. When BE is implemented, `testId` will likely be a backend-generated ID (UUID or numeric). Need to decide how the result page gets test metadata (book name, test number, module) — either from the BE response or from route state.
