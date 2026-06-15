// ─── Transcript Data ─────────────────────────────────────────────────────

export interface TranscriptLine {
    speaker: string;
    text: string;
}

export interface TranscriptSection {
    sectionNumber: number;
    title: string;
    transcript: TranscriptLine[];
}

export interface TranscriptData {
    testId: string;
    sections: TranscriptSection[];
}

// ─── Imports (add as transcripts are created) ────────────────────────────
import b11l1 from "./academic/book-11/listening/test-1-transcript.json";
import b11l2 from "./academic/book-11/listening/test-2-transcript.json";
import b11l3 from "./academic/book-11/listening/test-3-transcript.json";
import b11l4 from "./academic/book-11/listening/test-4-transcript.json";
import b12l1 from "./academic/book-12/listening/test-1-transcript.json";
import b12l2 from "./academic/book-12/listening/test-2-transcript.json";
import b12l3 from "./academic/book-12/listening/test-3-transcript.json";
import b12l4 from "./academic/book-12/listening/test-4-transcript.json";
import b13l1 from "./academic/book-13/listening/test-1-transcript.json";
import b13l2 from "./academic/book-13/listening/test-2-transcript.json";
import b13l4 from "./academic/book-13/listening/test-4-transcript.json";
import b14l1 from "./academic/book-14/listening/test-1-transcript.json";
import b14l2 from "./academic/book-14/listening/test-2-transcript.json";
import b14l3 from "./academic/book-14/listening/test-3-transcript.json";
import b14l4 from "./academic/book-14/listening/test-4-transcript.json";
import b15l1 from "./academic/book-15/listening/test-1-transcript.json";
import b15l2 from "./academic/book-15/listening/test-2-transcript.json";
import b15l3 from "./academic/book-15/listening/test-3-transcript.json";
import b15l4 from "./academic/book-15/listening/test-4-transcript.json";
import b16l1 from "./academic/book-16/listening/test-1-transcript.json";
import b16l2 from "./academic/book-16/listening/test-2-transcript.json";
import b16l3 from "./academic/book-16/listening/test-3-transcript.json";
import b16l4 from "./academic/book-16/listening/test-4-transcript.json";
import b17l1 from "./academic/book-17/listening/test-1-transcript.json";
import b17l2 from "./academic/book-17/listening/test-2-transcript.json";
import b17l3 from "./academic/book-17/listening/test-3-transcript.json";
import b17l4 from "./academic/book-17/listening/test-4-transcript.json";
import b18l1 from "./academic/book-18/listening/test-1-transcript.json";
import b18l2 from "./academic/book-18/listening/test-2-transcript.json";
import b18l3 from "./academic/book-18/listening/test-3-transcript.json";
import b18l4 from "./academic/book-18/listening/test-4-transcript.json";
import b19l1 from "./academic/book-19/listening/test-1-transcript.json";
import b19l2 from "./academic/book-19/listening/test-2-transcript.json";
import b19l3 from "./academic/book-19/listening/test-3-transcript.json";
import b19l4 from "./academic/book-19/listening/test-4-transcript.json";

const transcriptMap: Record<string, TranscriptData> = {
    "book-11-test-1": b11l1 as TranscriptData,
    "book-11-test-2": b11l2 as TranscriptData,
    "book-11-test-3": b11l3 as TranscriptData,
    "book-11-test-4": b11l4 as TranscriptData,
    "book-12-test-1": b12l1 as TranscriptData,
    "book-12-test-2": b12l2 as TranscriptData,
    "book-12-test-3": b12l3 as TranscriptData,
    "book-12-test-4": b12l4 as TranscriptData,
    "book-13-test-1": b13l1 as TranscriptData,
    "book-13-test-2": b13l2 as TranscriptData,
    "book-13-test-4": b13l4 as TranscriptData,
    "book-14-test-1": b14l1 as TranscriptData,
    "book-14-test-2": b14l2 as TranscriptData,
    "book-14-test-3": b14l3 as TranscriptData,
    "book-14-test-4": b14l4 as TranscriptData,
    "book-15-test-1": b15l1 as TranscriptData,
    "book-15-test-2": b15l2 as TranscriptData,
    "book-15-test-3": b15l3 as TranscriptData,
    "book-15-test-4": b15l4 as TranscriptData,
    "book-16-test-1": b16l1 as TranscriptData,
    "book-16-test-2": b16l2 as TranscriptData,
    "book-16-test-3": b16l3 as TranscriptData,
    "book-16-test-4": b16l4 as TranscriptData,
    "book-17-test-1": b17l1 as TranscriptData,
    "book-17-test-2": b17l2 as TranscriptData,
    "book-17-test-3": b17l3 as TranscriptData,
    "book-17-test-4": b17l4 as TranscriptData,
    "book-18-test-1": b18l1 as TranscriptData,
    "book-18-test-2": b18l2 as TranscriptData,
    "book-18-test-3": b18l3 as TranscriptData,
    "book-18-test-4": b18l4 as TranscriptData,
    "book-19-test-1": b19l1 as TranscriptData,
    "book-19-test-2": b19l2 as TranscriptData,
    "book-19-test-3": b19l3 as TranscriptData,
    "book-19-test-4": b19l4 as TranscriptData,
};

export function getTranscript(testId: string): TranscriptData | null {
    return transcriptMap[testId] ?? null;
}
