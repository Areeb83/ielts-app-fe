# Highlight Feature Guide

## What It Does
Students can select and highlight text in yellow during a reading test. Highlights persist across page refreshes. Clicking a highlight shows a "Remove Highlight" button that removes all segments added in the same action.

---

## When to Add Highlight Support to a New Area

Any text the student should be able to highlight needs to be wrapped in `<Highlightable>`. Currently it is applied to the **reading passage only** (title, section headings, paragraph content). If you add a new text area (e.g. General Training passages, a new passage layout), follow the steps below.

---

## Step-by-Step: How to Apply Highlighting to a New Component

### 1. Call `useHighlights` once at the parent level

```tsx
import useHighlights from '../../Highlightable/useHighlights';

const { highlights, addHighlight, removeHighlightGroup } = useHighlights(testId);
```

- `testId` must be the test's unique id (e.g. `"book-19-test-1"`) — this is the localStorage key
- Call this **once** in the parent component, NOT inside each `Highlightable`
- `highlights` is a flat array of all highlights for the test

---

### 2. Create a shared `pendingHighlightsRef`

```tsx
const pendingHighlightsRef = React.useRef<{ paragraphIndex: number; start: number; end: number }[]>([]);
```

- This ref is **shared across all `Highlightable` instances** in the same parent
- It enables cross-element selection (selecting across heading + paragraph highlights both)
- Create it **once** in the parent, pass it down to every `Highlightable`

---

### 3. Assign a unique `paragraphIndex` to each highlightable element

Every `<Highlightable>` instance needs a **unique integer index** within the same `testId`. Indices must not collide.

**Current scheme in `ReadingPassage`:**
| Element | Index |
|---|---|
| Paragraph content | `idx` (0-based section index) |
| Passage title | `sections.length` |
| Section heading (A, B, C...) | `sections.length + 1 + idx` |

If you add a new component, pick indices that don't overlap with existing ones. Using large offsets (e.g. `1000 + idx`) is safe.

---

### 4. Wrap each text element in `<Highlightable>`

```tsx
import Highlightable from '../../Highlightable/Highlightable';

<p className="passage-paragraph">
    <Highlightable
        text={section.content}
        paragraphIndex={idx}
        highlights={highlights.filter(h => h.paragraphIndex === idx)}
        onAdd={addHighlight}
        onRemove={removeHighlightGroup}
        pendingHighlightsRef={pendingHighlightsRef}
    />
</p>
```

**Every prop is required — do not omit any:**
| Prop | Type | Description |
|---|---|---|
| `text` | `string` | The full text string to render |
| `paragraphIndex` | `number` | Unique index for this element |
| `highlights` | `Highlight[]` | Pre-filtered to this element's index |
| `onAdd` | `fn` | `addHighlight` from `useHighlights` |
| `onRemove` | `fn` | `removeHighlightGroup` from `useHighlights` |
| `pendingHighlightsRef` | `MutableRefObject` | Shared ref from parent |

⚠️ **Do NOT pass `removeHighlight`** — it removes a single segment by `id`. You must pass `removeHighlightGroup` which removes all segments added in the same action (by `groupId`).

---

### 5. Pass `testId` down if it isn't already available

`useHighlights` needs `testId`. In `ReadingPassage` it comes from a prop added to the component:

```tsx
// ReadingPassage props
interface ReadingPassageProps {
    testId: string;
    // ... other props
}
```

It is passed from `TestDetailContainer`:
```tsx
<ReadingPassage
    testId={testData.testId}
    // ...
/>
```

If you create a new passage component, make sure `testId` flows down to it.

---

## File Reference

```
src/components/Highlightable/
  ├── useHighlights.ts       — State management + localStorage + groupId removal
  ├── Highlightable.tsx      — Selection detection, text segmentation, button coordination
  ├── FloatingButton.tsx     — Portal-rendered "Highlight" / "Remove Highlight" button
  └── Highlightable.css      — Yellow mark style + floating button style
```

**Files that use it:**
```
src/components/TestDetailComponents/TestDetailContainer/
  ├── ReadingPassage.tsx     — Applies highlighting to title, headings, paragraphs
  └── index.tsx              — Passes testData.testId to ReadingPassage
```

---

## Things That Must NOT Be Forgotten

### ❌ Don't call `useHighlights` inside `Highlightable`
It must be called in the **parent**. Each `Highlightable` receives `highlights`, `onAdd`, `onRemove` as props.

### ❌ Don't create a separate `pendingHighlightsRef` per `Highlightable`
All instances in the same passage **must share one ref**. Separate refs break cross-element selection — each instance would be unaware of others.

### ❌ Don't use `removeHighlight` — use `removeHighlightGroup`
`removeHighlight(id)` removes one segment. If the user highlighted across heading + paragraph in one action, clicking remove on the heading would only remove the heading highlight, leaving the paragraph highlighted. `removeHighlightGroup(groupId)` removes all segments from the same action.

### ❌ Don't reuse `paragraphIndex` values across different elements
If two `Highlightable` instances share the same `paragraphIndex`, their highlights will be mixed up — one element will render the other's highlights.

### ❌ Don't place `<Highlightable>` inside a block element other than `<p>` or `<span>` ancestors
`Highlightable` renders a `<span>` internally. Placing it inside a `<div>` is fine but placing it directly inside a table cell or flex container may cause unexpected layout.

### ❌ Don't put `<Highlightable>` around interactive elements (inputs, dropzones, buttons)
It only works on plain readable text. Wrapping interactive question components will interfere with their own mouse event handling.

---

## How Cross-Element Selection Works (Important for Debugging)

When a user selects text across multiple elements (e.g. heading to paragraph):

1. `document.mouseup` fires — all `Highlightable` instances have registered their own handler via `useEffect`
2. Handlers fire **in DOM order** (registration order = render order)
3. The instance where the selection **starts** (`container.contains(range.startContainer) === true`):
   - Clears `pendingHighlightsRef.current`
   - Pushes its own unhighlighted gaps
   - Stores the button position in a local `pendingButtonPosRef`
   - Calls `setTimeout(0)` to show the button after all handlers complete
4. Other instances that the selection passes through push their gaps silently — no button
5. `setTimeout(0)` fires — if `pendingHighlightsRef.current.length > 0`, the button is shown
6. On confirm — a single `groupId = crypto.randomUUID()` is generated, all pending entries get `onAdd` called with that groupId

**Why `setTimeout(0)`?** All synchronous mouseup handlers complete first, so by the time the timeout fires, all instances have pushed their gaps. Without it, only the start instance's gaps would be in pending when the button is shown.

---

## Data Model

```ts
interface Highlight {
    id: string;           // unique per segment
    groupId: string;      // shared across all segments added in one confirm action
    paragraphIndex: number;
    start: number;        // char offset in the text string (inclusive)
    end: number;          // char offset in the text string (exclusive)
}
```

**localStorage format:**
```
key:   "highlights-book-19-test-1"
value: Highlight[]  (JSON array)
```
