# Code Improvement Backlog

Ordered from lowest to highest effort. Items marked **[Deferred]** depend on backend implementation.

---

## Done

- [x] Remove unused `import React from "react"` across 15 files — replaced with named imports (`FC`, `useState`, `useRef`, `useEffect`, `ReactNode`, `Fragment`, `Children`, `DragEvent`)

---

## Quick Wins (< 1 hour each)

### ~~1. Add `.env.example`~~ ✅
No `.env.example` file exists. New developers have no idea what environment variables are needed.

**What to add:**
```
VITE_API_BASE_URL=http://localhost:8000/api
```
Also note: the current fallback URL `http://localhost:3000/api` conflicts with the Vite dev server port (also 3000).

---

### ~~2. Add `tsc` check to build script~~ ✅
`"build": "vite build"` does not run TypeScript type checking. Type errors are silently ignored at build time.

**Fix in `package.json`:**
```json
"build": "tsc --noEmit && vite build"
```

---

### ~~3. Clean up versioned aliases in `vite.config.ts`~~ ✅
The `resolve.alias` block has ~30 entries like `'vaul@1.1.2': 'vaul'`. These are auto-generated noise — if any package version is bumped, the alias silently breaks. Remove the entire versioned alias block. Only the `@` path alias is needed:

```ts
alias: {
  '@': path.resolve(__dirname, './src'),
},
```

---

### ~~4. Guard the unguarded `console.log` in `ReportMistakeButton.tsx`~~ ✅
`src/components/TestDetailComponents/ReportMistakeButton.tsx:15` fires a `console.log` unconditionally in production. Wrap it:

```ts
if (import.meta.env.DEV) {
  console.log("Report submitted:", { reportType, reportQuestion, reportDescription });
}
```

---

## Medium Effort (half a day each)

### 5. Enable `strict: true` in `tsconfig.json`
Currently `"strict": false` — this disables null checks, implicit any, strict function types, and more. This is the single biggest gap in TypeScript safety.

**Fix in `tsconfig.json`:**
```json
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
```

Enabling this will surface type errors to fix, but it catches real bugs.

---

### ~~6. Fix 15× `@ts-ignore` in `QuestionRenderer.tsx`~~ ✅
Every case in the switch statement uses `// @ts-ignore` because `QuestionGroup.data` is a flat union and TypeScript can't narrow it by `group.type`.

**Fix in `src/types/question.ts`** — convert `QuestionGroup` to a discriminated union:

```ts
export type QuestionGroup =
  | { type: "FLOW_CHART_DRAG_DROP";         data: FlowChartDragDropData;         instruction: string; startQuestion: number; endQuestion: number; hideRange?: boolean }
  | { type: "SENTENCE_COMPLETION";          data: SentenceCompletionData;         instruction: string; startQuestion: number; endQuestion: number; hideRange?: boolean }
  | { type: "SENTENCE_COMPLETION_DRAG_DROP"; data: SentenceCompletionDragDropData; instruction: string; startQuestion: number; endQuestion: number; hideRange?: boolean }
  // ... one line per question type
```

TypeScript will then narrow `group.data` automatically inside each `case`, eliminating all 15 `@ts-ignore` comments.

---

### ~~7. Add Error Boundaries~~ ✅
No `ErrorBoundary` exists. If a single question component throws (e.g. malformed JSON), the entire app goes blank.

**Add `src/components/ErrorBoundary.tsx`** and wrap the test pages and `QuestionRenderer`'s default case at minimum. React error boundaries must be class components.

---

### 8. Replace inline `style={{}}` with Tailwind
There are ~10 occurrences of `style={{ ... }}` in non-UI code — specifically in the "test not found" fallback screens (`ListeningTestActualPage`, `ReadingTestActualPage`) and the `QuestionRenderer` unknown-type fallback. These are simple to migrate:

```tsx
// Before
<div style={{ padding: 40, textAlign: "center" }}>

// After
<div className="p-10 text-center">
```

---

## High Effort (1–2 days each)

### 9. Add ESLint + Prettier **[Deferred until BE]**
No linter or formatter is configured. No `lint` script exists in `package.json`.

**Minimum setup:**
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier
```

Add to `package.json` scripts:
```json
"lint": "eslint src --ext .ts,.tsx",
"format": "prettier --write src"
```

This will catch: unused imports (prevents recurrence of the React issue), hook dependency warnings, and style drift.

---

### 10. Add Vitest + Unit Tests
No tests exist. The following modules are fully testable right now with zero backend dependency:

| File | What to test |
|---|---|
| `src/utils/scoring.ts` | `scoreTest()` — correct/wrong answers, range questions, band score conversion |
| `src/api/validators.ts` | `validateExamType()`, `validatePagination()`, `validateAnswers()` |
| `src/hooks/useApi.ts` | loading state, error handling, unmount safety |
| `src/utils/textUtils.tsx` | `formatInstruction()` — bolding of word limits |

**Minimum setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

### 11. Dynamic imports for test JSON data
`ListeningTestActualPage.tsx` and `ReadingTestActualPage.tsx` each statically import 36+ JSON test files at the top level. This means **all test data is bundled into the initial JS payload**, even for users who only open one test.

**Fix:** Replace static imports with a dynamic `import()` inside a `useEffect`:
```ts
// Before
import book11Test1 from '../../data/academic/book-11/listening/test-1.json';
const testDataMap = { "book-11-test-1": book11Test1, ... };

// After
const [testData, setTestData] = useState<TestData | null>(null);
useEffect(() => {
  import(`../../data/academic/${bookId}/listening/${testNumber}.json`)
    .then(m => setTestData(m.default as TestData));
}, [bookId, testNumber]);
```

Vite automatically code-splits dynamic imports — each JSON file becomes a separate chunk loaded on demand.

---

## Deferred Until Backend

### 12. Replace hardcoded user data in Navbar
`Navbar.tsx` has hardcoded `"Student Name"`, `"student@example.com"`, and a placeholder DiceBear avatar. The profile dropdown buttons (My Profile, My Progress, Settings, Sign Out) have no handlers.

**When to do:** After auth is implemented. Wire up a user context/store and replace placeholder values with real data.

---

## Summary Table

| # | Task | Effort | Depends on BE? |
|---|---|---|---|
| ~~1~~ | ~~Add `.env.example`~~ ✅ | 5 min | No |
| ~~2~~ | ~~Add `tsc` to build script~~ ✅ | 5 min | No |
| ~~3~~ | ~~Clean up versioned aliases in vite.config.ts~~ ✅ | 15 min | No |
| ~~4~~ | ~~Guard `console.log` in ReportMistakeButton~~ ✅ | 5 min | No |
| 5 | Enable `strict: true` in tsconfig | 2–4 hrs | No |
| ~~6~~ | ~~Fix `@ts-ignore` with discriminated union~~ ✅ | 1–2 hrs | No |
| ~~7~~ | ~~Add Error Boundaries~~ ✅ | 1 hr | No |
| 8 | Replace inline `style={{}}` with Tailwind | 1 hr | No |
| 9 | Add ESLint + Prettier | 2–3 hrs | **Deferred until BE** |
| 10 | Add Vitest + unit tests | 1–2 days | No |
| 11 | Dynamic imports for test JSON data | 3–4 hrs | No |
| 12 | Navbar real user data | 1 hr | **Yes** |
