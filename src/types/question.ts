// ─── JSON Schema TypeScript Interfaces ───────────────────────────────────────
// These types define the shape of the test JSON that the frontend renders.
// Eventually, the backend API will return data matching these types.

// ─── Content Parts (Atomic building blocks) ─────────────────────────────────

/** A drop-zone inside a text element */
export interface DropzonePart {
  id: string;
  type: "dropzone";
}

/** A text input field inside a text element */
export interface InputPart {
  id: string;
  type: "input";
  placeholder?: string;
}

/** A bold text part */
export interface BoldPart {
  type: "bold";
  text: string;
}

/** A content part is either plain text or an interactive element */
export type ContentPart = string | DropzonePart | InputPart | BoldPart;

// ─── Question Group Data (per type) ─────────────────────────────────────────

/** Flow Chart (Drag and Drop): Options pool & interactive steps */
export interface FlowChartDragDropOption {
  letter: string; // "A", "B", etc. — id stored as letter, text shown without letter
  text: string;
}

export interface FlowChartDragDropData {
  title?: string;
  options: string[] | FlowChartDragDropOption[]; // plain words OR lettered options
  steps: {
    type: "text" | "interactive";
    content: string | ContentPart[];
  }[];
}

/** Sentence Completion: Fill-in-the-blank text inputs */
export interface SentenceCompletionData {
  title?: string;
  sentences: {
    questionNumber?: number;
    content: ContentPart[];
  }[];
}

/** Summary Completion: Paragraph-style fill-in-the-blank text inputs */
export interface NotesSectionItem {
  bullet?: string;   // "•", "–", etc.
  indent?: boolean;  // true = indented sub-item
  content: ContentPart[];
}

export interface NotesSection {
  heading?: string;
  items: NotesSectionItem[];
}

export interface SummaryCompletionData {
  title?: string;
  content?: ContentPart[];       // Flat paragraph mode (original)
  sections?: NotesSection[];     // Structured notes mode (sub-headings + bullets)
}

/** Multiple Choice: Single answer (A/B/C) or multiple answers (Choose TWO) */
export interface MultipleChoiceOption {
  letter: string; // "A", "B", "C"...
  text: string;
}

export interface MultipleChoiceQuestion {
  id: string;          // Maps to the question number, e.g. "21"
  text: string;        // The question prompt
  options: MultipleChoiceOption[];
  multiple?: boolean;  // true = "Choose TWO" mode
  count?: number;      // Max selections allowed (e.g. 2)
}

export interface MultipleChoiceData {
  title?: string;
  questions: MultipleChoiceQuestion[];
}

/** A single cell in a Table Completion table */
export type TableCell =
  | string                                        // Static text / header label
  | { id: string; questionNumber?: number }       // Interactive blank (fill-in)
  | ContentPart[];                                // Mixed content (text + inputs)

/** Table Completion: A grid where specific cells are interactive blanks */
export interface TableCompletionData {
  title?: string;       // Optional table caption (e.g. "Accommodation Options")
  headers: string[];    // Column header labels
  rows: TableCell[][];  // Each row = array of cells (length should match headers.length)
}

/** Map / Diagram Labelling: A single question that matches a place name to a letter on the map */
export interface MapDiagramQuestion {
  id: string;             // Question ID matching the answer key (e.g. "27")
  questionNumber: number; // Display number (e.g. 27)
  text: string;           // Place name shown in the row (e.g. "Quilt Shop")
}

/** Map / Diagram Labelling: side-by-side image + radio-button matching grid */
export interface MapDiagramLabellingData {
  title?: string;
  imageSrc?: string;       // Optional legacy image URL
  rightSideTitle?: string; // Optional heading above the grid
  leftSideContent?: {
    type: 'image' | 'text';
    value: string;
  };
  options: string[];      // Letters visible on the map (e.g. ["A","B","C","D","E","F","G","H"])
  questions: MapDiagramQuestion[];
}

/** Matching Feature: A grid where questions are matched to a list of features/options */
export interface MatchingFeatureOption {
  letter: string;
  text: string;
}

export interface MatchingFeatureQuestion {
  id: string;
  questionNumber: number;
  text: string;
}

export interface MatchingFeatureData {
  title?: string;
  rightSideTitle?: string;
  options: MatchingFeatureOption[];
  questions: MatchingFeatureQuestion[];
}

/** Diagram Labelling (Reading): Image on top, numbered text inputs below */
export interface DiagramLabellingQuestion {
  id: string;
  questionNumber: number;
  label?: string; // optional hint text next to the input, e.g. "type of soil"
}

export interface DiagramLabellingData {
  title?: string;
  imageSrc: string; // URL or local path
  questions: DiagramLabellingQuestion[];
}

/** Matching Heading: A pool of headings to be matched to passage sections */
export interface MatchingHeadingData {
  headings: string[];
}

/** Summary Completion (Drag & Drop): Paragraph with inline drop zones + labeled options pool */
export interface SummaryCompletionDragDropOption {
  letter: string; // "A", "B", etc.
  text: string;   // "interpretation", "complexity", etc.
}

export interface SummaryCompletionDragDropData {
  title?: string;
  content: ContentPart[]; // paragraph text interleaved with DropzoneParts
  options: SummaryCompletionDragDropOption[];
}

/** Paragraph Matching: Dropdown (A–H) per question to select which paragraph contains info */
export interface ParagraphMatchingQuestion {
  id: string;
  questionNumber: number;
  text: string;
}

export interface ParagraphMatchingData {
  paragraphs: string[]; // e.g. ["A","B","C","D","E","F","G","H"]
  questions: ParagraphMatchingQuestion[];
}

/** Sentence Completion (Drag & Drop): Sentences with inline drop zones + options pool below */
export interface SentenceCompletionDragDropOption {
  letter: string; // "A", "B", "C"...
  text: string;   // the ending/option text (displayed without the letter)
}

export interface SentenceCompletionDragDropData {
  title?: string;
  options: SentenceCompletionDragDropOption[];
  sentences: {
    questionNumber?: number;
    content: ContentPart[]; // may include DropzonePart for the blanks
  }[];
}

/** Identification: True/False/Not Given or Yes/No/Not Given */
export interface IdentificationQuestion {
  id: string;
  text: string;
}

export interface IdentificationData {
  optionsType: "TRUE_FALSE" | "YES_NO";
  questions: IdentificationQuestion[];
}

// ─── Question Group ─────────────────────────────────────────────────────────

export type QuestionGroupType = "FLOW_CHART_DRAG_DROP" | "SENTENCE_COMPLETION" | "SENTENCE_COMPLETION_DRAG_DROP" | "SUMMARY_COMPLETION" | "SUMMARY_COMPLETION_DRAG_DROP" | "MULTIPLE_CHOICE" | "TABLE_COMPLETION" | "MAP_DIAGRAM_LABELLING" | "DIAGRAM_LABELLING" | "IDENTIFICATION" | "MATCHING_FEATURE" | "MATCHING_HEADING" | "PARAGRAPH_MATCHING";

export interface QuestionGroup {
  type: QuestionGroupType;
  instruction: string;
  startQuestion: number;
  endQuestion: number;
  hideRange?: boolean;
  data: FlowChartDragDropData | SentenceCompletionData | SentenceCompletionDragDropData | SummaryCompletionData | SummaryCompletionDragDropData | MultipleChoiceData | TableCompletionData | MapDiagramLabellingData | DiagramLabellingData | IdentificationData | MatchingFeatureData | MatchingHeadingData | ParagraphMatchingData;
}

// ─── Passage Data (Structured for Reading) ──────────────────────────────────

export interface PassageSection {
  label?: string; // e.g. "Section A"
  questionId?: string; // e.g. "14"
  content: string; // The text of the section
}

export interface PassageData {
  title: string;
  sections: PassageSection[];
}

// ─── Section ────────────────────────────────────────────────────────────────

export interface TestSection {
  sectionNumber: number;
  title: string;
  sectionHeading?: string;
  /** Audio timestamp range for this section (optional) */
  audioStart?: number;
  audioEnd?: number;
  passage?: PassageData; // Optional passage data for reading tests
  questionGroups: QuestionGroup[];
}

// ─── Full Test ──────────────────────────────────────────────────────────────

export interface TestData {
  testId: string;
  bookId: string;
  title: string;
  audioSrc: string;
  totalQuestions: number;
  sections: TestSection[];
}

// ─── Answer State ───────────────────────────────────────────────────────────

/** Keyed by question number (string) → user's answer value */
export type AnswerMap = Record<string, string | string[]>;
