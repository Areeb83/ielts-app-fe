# Implementation Plan - Refactoring Question Types for Reusability

The current implementation of question types is tightly coupled with the `ListeningTestPage`. To support reuse in `ReadingTestPage` and other modules, we need to move these components to a shared location and consolidate their styling.

## User Review Required

> [!IMPORTANT]
> This refactor involves moving files and updating many imports. Please ensure you have no unsaved changes in the affected files.

## Proposed Changes

### 1. Create Shared Directory Structure
We will migrate all question-specific logic from the Listening-only directory to a common UI directory.

- **Source**: `src/pages/ListeningTestPage/QuestionTypes/`
- **Destination**: `src/components/QuestionTypes/`

#### Files to Move:
- `FlowChartDragDrop/` (including `.tsx`, `.css`)
- `MapDiagramLabelling/` (including `.tsx`, `.css`)
- `MultipleChoice/` (including `.tsx`, `.css`)
- `SentenceCompletion/` (including `.tsx`, `.css`)
- `SummaryCompletion/` (including `.tsx`, `.css`)
- `TableCompletion/` (including `.tsx`, `.css`)
- `QuestionRenderer.tsx`

---

### 2. Consolidate Styles (`QuestionBase.css`)
To avoid CSS duplication, we will extract common IELTS UI patterns into a central stylesheet.

#### [NEW] [QuestionBase.css](file:///c:/Users/Laptopwala/Desktop/orange%20ielts/Frontend/src/styles/QuestionBase.css)
This file will contain:
- `.q-container`: Base layout for all question groups.
- `.q-header`: Styling for the instruction and question range section.
- `.q-range`: Bold black text for "Questions X–Y".
- `.q-instruction`: Standardized font size and line height for instructions.
- `.q-num`: The bold, unboxed question number prefix (matching our recent fix).
- `.q-grid-card`: The rounded border (`1px solid #000`, `12px radius`, `25px padding`) that wraps complex tables/grids.
- `.q-table`: Reset styles for IELTS-style tables (black borders, collapse).
- `.q-bold-divider`: The prominent `2px solid #000` vertical or horizontal lines.

---

### 3. Component Refactoring Pattern
Each component will be updated to follow a standardized "Atomic" pattern.

#### Example: `MapDiagramLabelling.tsx`
- **Before**: Uses `map-diagram__*` classes with local CSS.
- **After**:
    - Uses `q-header`, `q-range`, `q-instruction` for the top part.
    - Uses `q-grid-card` for the `table-wrapper`.
    - Uses `q-table` and `q-bold-divider` for the matching grid.
    - Local CSS (`MapDiagramLabelling.css`) will only contain logic for the side-by-side layout and image positioning.

#### Example: `TableCompletion.tsx`
- We will apply the same `q-grid-card` wrapper to this component so it looks identical to the Map grid in Part 4.

---

### 4. Updating Logic & Imports
- **QuestionRenderer**: Move and update all component paths.
- **Imports**: All components will now import types from `../../../types/question` (relative to their new home).
- **ListeningTestContainer**: Change the import of `QuestionRenderer` to `import QuestionRenderer from "../../../components/QuestionTypes/QuestionRenderer"`.

## Verification Plan

### Automated Tests
- Run `npm run dev` and navigate through all 4 parts of the Listening Test.
- Verify that all question types (Flow Chart, Sentence, Summary, MCQ, Table, Map) render correctly with the new shared styles.

### Manual Verification
- Check the layout of Part 4 specifically (Table + Map) to ensure the "grid-card" look is applied consistently to both.
- Inspect the DOM to ensure shared classes are being used instead of duplicated styles.
