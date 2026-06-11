import type { AnswerMap } from "../types/question";

export interface AnswerKeyEntry {
    questionNumber: number;
    answerType: string;
    acceptedAnswers: string[];
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

/**
 * Compare a user's answer against accepted answers.
 * Case-insensitive, trimmed, ignores extra spaces.
 */
function isAnswerCorrect(userAnswer: string | string[] | undefined, acceptedAnswers: string[]): boolean {
    if (!userAnswer) return false;

    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

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
        const qNum = String(entry.questionNumber);
        const userAnswer = answers[qNum];
        const isCorrect = isAnswerCorrect(userAnswer, entry.acceptedAnswers);

        if (isCorrect) correct++;

        results.push({
            questionNumber: entry.questionNumber,
            userAnswer: Array.isArray(userAnswer) ? userAnswer.join(", ") : (userAnswer ?? ""),
            correctAnswers: entry.acceptedAnswers,
            isCorrect,
        });
    }

    const total = answerKey.answers.length;

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
