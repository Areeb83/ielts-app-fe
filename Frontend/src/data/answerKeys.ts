import type { AnswerKey } from "../utils/scoring";
import axiosInstance from "../api/axiosInstance";

/**
 * Fetch answer key from the API for both listening and reading.
 */
export async function fetchAnswerKey(testId: string, testType: "listening" | "reading"): Promise<AnswerKey | null> {
    const bookSlug = testId.split('-test-')[0];
    const testSlug = `test-${testId.split('-test-')[1]}`;
    try {
        const { data } = await axiosInstance.get(
            `/${testType}/academic/books/${bookSlug}/tests/${testSlug}/answers`
        );
        return { testId: data.data.testId, answers: data.data.answers } as AnswerKey;
    } catch (err) {
        console.error(`Failed to fetch ${testType} answer key from API:`, err);
        return null;
    }
}

// Sync version — returns null, callers should use fetchAnswerKey
export function getAnswerKey(_testId: string, _testType: "listening" | "reading"): AnswerKey | null {
    return null;
}
