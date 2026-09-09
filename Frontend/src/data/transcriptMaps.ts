// ─── Transcript Data ─────────────────────────────────────────────────────
import axiosInstance from "../api/axiosInstance";

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

/**
 * Fetch transcript from the API.
 */
export async function fetchTranscript(testId: string): Promise<TranscriptData | null> {
    const bookSlug = testId.split('-test-')[0];
    const testSlug = `test-${testId.split('-test-')[1]}`;
    try {
        const { data } = await axiosInstance.get(
            `/listening/academic/books/${bookSlug}/tests/${testSlug}/transcript`
        );
        return { testId: data.data.testId, sections: data.data.sections } as TranscriptData;
    } catch (err) {
        console.error('Failed to fetch transcript from API:', err);
        return null;
    }
}

// Keep sync version as a no-op for backwards compat (callers should migrate to fetchTranscript)
export function getTranscript(_testId: string): TranscriptData | null {
    return null;
}
