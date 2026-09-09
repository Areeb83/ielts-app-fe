# Highlight Feature Guide

## What It Does

Students can select and highlight text in yellow during a reading test. Highlights are **in-memory only** — they reset on page reload. This is intentional: highlights are a temporary focusing tool for the current test attempt. Clicking a highlighted region shows a "Remove Highlight" button.

---

## Where It's Applied

### Left pane (Reading Passage) — `<Highlightable>` component
Wraps individual text strings (title, headings, paragraphs) in the passage. Uses `<mark>` elements for rendering.

### Right pane (Questions) — `<HighlightableContainer>` component
Wraps the entire questions pane as a single container. Uses the **CSS Custom Highlight API** (`::highlight()`) for rendering — no DOM changes needed. Works over any content including mixed question types.

---

## Architecture Overview

```
src/components/Highlightable/
  ├── useHighlights.ts             — In-memory state (add/remove), shared by left pane
  ├── Highlightable.tsx            — Per-paragraph component for the passage (left pane)
  ├── HighlightableContainer.tsx   — Whole-container component for questions (right pane)
  ├── FloatingButton.tsx           — Portal-rendered "Highlight" / "Remove Highlight" button
  └── Highlightable.css            — Mark styles, CSS highlight styles, floating button styles
```

**Files that use it:**
```
src/components/TestDetailComponents/TestDetailContainer/
  ├── ReadingPassage.tsx   — Uses useHighlights() + <Highlightable> for passage text
  └── index.tsx            — Uses <HighlightableContainer> to wrap the questions pane
```

---

## Left Pane: `<Highlightable>` — How to Use

### 1. Call `useHighlights()` once at the parent level

```tsx
import useHighlights from '../../Highlightable/useHighlights';

const { highlights, addHighlight, removeHighlightGroup } = useHighlights();
```

- No arguments — highlights are in-memory, not persisted
- Call this **once** in the parent component, NOT inside each `<Highlightable>`

### 2. Create a shared `pendingHighlightsRef`

```tsx
const pendingHighlightsRef = React.useRef<{ paragraphIndex: number; start: number; end: number }[]>([]);
```

- Shared across all `<Highlightable>` instances in the same parent
- Enables cross-paragraph selection
- Create **once** in the parent, pass down to every `<Highlightable>`

### 3. Assign unique `paragraphIndex` values (scoped by section)

Every `<Highlightable>` needs a unique integer index. Indices are offset by `sectionIndex * 10000` to prevent collisions across sections.

**Current scheme in `ReadingPassage`:**

| Element | Index |
|---|---|
| Paragraph content | `sectionIndex * 10000 + idx` |
| Passage title | `sectionIndex * 10000 + sections.length` |
| Section heading | `sectionIndex * 10000 + sections.length + 1 + idx` |

### 4. Wrap each text element in `<Highlightable>`

```tsx
<Highlightable
    text={section.content}
    paragraphIndex={base + idx}
    highlights={highlights.filter(h => h.paragraphIndex === base + idx)}
    onAdd={addHighlight}
    onRemove={removeHighlightGroup}
    pendingHighlightsRef={pendingHighlightsRef}
/>
```

All props are required.

---

## Right Pane: `<HighlightableContainer>` — How It Works

In `TestDetailContainer/index.tsx`, the questions pane is wrapped in `<HighlightableContainer>` for reading tests:

```tsx
<HighlightableContainer
    highlights={qHighlights.filter(h => h.sectionIndex === currentSectionIndex)}
    onAdd={addQHighlight}
    onRemove={removeQHighlight}
>
    {questionsContent}
</HighlightableContainer>
```

- Wraps arbitrary children — no need to modify individual question components
- Uses the CSS Custom Highlight API to paint highlights (no `<mark>` elements)
- Stores highlights as absolute character offsets within the container's text content
- Click-to-remove detects which highlight is at the click position via `caretRangeFromPoint`
- Skips interactive elements (inputs, buttons, selects, labels) automatically

---

## Overlapping Highlights

Highlights are stored as **independent layers that can overlap**. This means:

1. Highlight A covers chars 10–30
2. Highlight B covers chars 5–35 (overlaps A entirely)
3. Both are stored separately in the highlights array
4. `buildSegments` uses a boundary-sweep to split text at every highlight edge
5. For overlapping regions, the **most recently added** highlight's `groupId` is shown
6. Removing B peels off the top layer — A remains visible underneath

This "layered" approach ensures that removing a highlight always removes exactly what the user selected, regardless of what was highlighted before.

---

## Chrome "Search" Bubble Suppression

Chrome shows a native "Search" button when text is selected. Both `Highlightable` and `HighlightableContainer` suppress this by:

1. Cloning the selection range
2. Painting a fake selection via `CSS.highlights.set('pending-highlight', ...)` or `CSS.highlights.set('pending-container-selection', ...)`
3. Clearing the native selection with `sel.removeAllRanges()`

Chrome sees no native selection, so it has nothing to attach its bubble to. The fake CSS highlight makes the text still look selected (blue tint).

---

## Per-Section Persistence

Highlights persist when navigating between sections within the same test:

- **Left pane**: `useHighlights()` is called inside `ReadingPassage` (which is NOT remounted on section change). `paragraphIndex` is offset by `sectionIndex * 10000` so highlights from different sections don't collide.
- **Right pane**: `qHighlights` state lives in `TestDetailContainer`. Each highlight stores its `sectionIndex`. Only highlights matching `currentSectionIndex` are passed to `HighlightableContainer`.

---

## Data Model

```ts
// Left pane (Highlightable)
interface Highlight {
    id: string;             // unique per entry
    groupId: string;        // shared across all entries added in one confirm action
    paragraphIndex: number; // scoped by sectionIndex * 10000
    start: number;          // char offset (inclusive)
    end: number;            // char offset (exclusive)
}

// Right pane (HighlightableContainer)
interface ContainerHighlight {
    id: string;
    groupId: string;
    start: number;          // absolute char offset within container
    end: number;
}
// + sectionIndex (added in TestDetailContainer state)
```

---

## Rules

- Do NOT call `useHighlights` inside `<Highlightable>` — call it in the parent
- Do NOT create separate `pendingHighlightsRef` per `<Highlightable>` — all instances must share one
- Do NOT reuse `paragraphIndex` across different elements or sections
- Do NOT wrap interactive elements (inputs, dropzones, buttons) in `<Highlightable>`
- Do NOT persist highlights to localStorage — they are intentionally in-memory only
