import type { AnswerMap } from "../types/question";

export interface AnswerKeyEntry {
    questionNumber: number | string;
    answerType: string;
    acceptedAnswers: string[];
    count?: number;
}

export interface AnswerKey {
    testId: string;
    answers: AnswerKeyEntry[];
}

export interface QuestionResult {
    questionNumber: number;
    userAnswer: string;
    correctAnswers: string[];
    isCorrect: boolean;
}

export interface ScoreResult {
    correct: number;
    total: number;
    bandScore: number;
    results: QuestionResult[];
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Compare a user's answer against accepted answers.
 * Case-insensitive, trimmed, ignores extra spaces.
 */
function isAnswerCorrect(userAnswer: string | string[] | undefined, acceptedAnswers: string[]): boolean {
    if (!userAnswer) return false;

    if (Array.isArray(userAnswer)) {
        // For multi-select questions — check if any entry matches
        return userAnswer.some(ua =>
            acceptedAnswers.some(aa => normalize(ua) === normalize(aa))
        );
    }

    return acceptedAnswers.some(aa => normalize(userAnswer) === normalize(aa));
}

/**
 * Score a test by comparing user answers against the answer key.
 */
export function scoreTest(userAnswers: AnswerMap | undefined | null, answerKey: AnswerKey): ScoreResult {
    const answers = userAnswers ?? {};
    const results: QuestionResult[] = [];
    let correct = 0;

    for (const entry of answerKey.answers) {
        const qNumStr = String(entry.questionNumber);

        // Check if this is a multi-select range entry like "25-26"
        const rangeMatch = qNumStr.match(/^(\d+)\s*[–-]\s*(\d+)$/);
        if (rangeMatch && entry.count) {
            const start = Number(rangeMatch[1]);
            const end = Number(rangeMatch[2]);
            // User answer stored under key with en-dash + spaces: "25 – 26"
            const answerKey1 = `${start} – ${end}`;
            const answerKey2 = `${start}-${end}`;
            const answerKey3 = `${start} - ${end}`;
            const userAnswer = answers[answerKey1] ?? answers[answerKey2] ?? answers[answerKey3] ?? answers[qNumStr];
            const userArr = Array.isArray(userAnswer) ? userAnswer : [];

            // Expand into individual results for each question in the range
            for (let n = start; n <= end; n++) {
                const idx = n - start;
                const singleUserAnswer = userArr[idx] ?? "";
                const isMatch = entry.acceptedAnswers.some(aa =>
                    normalize(singleUserAnswer) === normalize(aa)
                );
                if (isMatch) correct++;
                results.push({
                    questionNumber: n,
                    userAnswer: singleUserAnswer,
                    correctAnswers: entry.acceptedAnswers,
                    isCorrect: isMatch,
                });
            }
        } else {
            const userAnswer = answers[qNumStr];
            const isCorrect = isAnswerCorrect(userAnswer, entry.acceptedAnswers);

            if (isCorrect) correct++;

            results.push({
                questionNumber: typeof entry.questionNumber === 'string' ? Number(entry.questionNumber) || 0 : entry.questionNumber,
                userAnswer: Array.isArray(userAnswer) ? userAnswer.join(", ") : (userAnswer ?? ""),
                correctAnswers: entry.acceptedAnswers,
                isCorrect,
            });
        }
    }

    const total = results.length;

    return {
        correct,
        total,
        bandScore: getBandScore(correct),
        results,
    };
}

/**
 * IELTS Listening/Reading band score conversion.
 * Based on standard IELTS scoring (approximate — may vary slightly by test).
 */
export function getBandScore(correct: number): number {
    if (correct >= 39) return 9.0;
    if (correct >= 37) return 8.5;
    if (correct >= 35) return 8.0;
    if (correct >= 33) return 7.5;
    if (correct >= 30) return 7.0;
    if (correct >= 27) return 6.5;
    if (correct >= 23) return 6.0;
    if (correct >= 20) return 5.5;
    if (correct >= 16) return 5.0;
    if (correct >= 13) return 4.5;
    if (correct >= 10) return 4.0;
    if (correct >= 7) return 3.5;
    if (correct >= 4) return 3.0;
    if (correct >= 2) return 2.5;
    if (correct >= 1) return 2.0;
    return 0;
}
