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

const transcriptMap: Record<string, TranscriptData> = {
    "book-11-test-1": b11l1 as TranscriptData,
    "book-11-test-2": b11l2 as TranscriptData,
    "book-11-test-3": b11l3 as TranscriptData,
    "book-11-test-4": b11l4 as TranscriptData,
};

export function getTranscript(testId: string): TranscriptData | null {
    return transcriptMap[testId] ?? null;
}
