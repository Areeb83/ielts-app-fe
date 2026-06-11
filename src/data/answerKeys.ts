import type { AnswerKey } from "../utils/scoring";

// ─── Reading Answer Keys ─────────────────────────────────────────────────────
import b11r1 from "./academic/book-11/reading/test-1-answers.json";
import b11r2 from "./academic/book-11/reading/test-2-answers.json";
import b11r3 from "./academic/book-11/reading/test-3-answers.json";
import b11r4 from "./academic/book-11/reading/test-4-answers.json";
import b12r1 from "./academic/book-12/reading/test-1-answers.json";
import b12r2 from "./academic/book-12/reading/test-2-answers.json";
import b12r3 from "./academic/book-12/reading/test-3-answers.json";
import b12r4 from "./academic/book-12/reading/test-4-answers.json";
import b13r1 from "./academic/book-13/reading/test-1-answers.json";
import b13r2 from "./academic/book-13/reading/test-2-answers.json";
import b13r3 from "./academic/book-13/reading/test-3-answers.json";
import b13r4 from "./academic/book-13/reading/test-4-answers.json";
import b14r1 from "./academic/book-14/reading/test-1-answers.json";
import b14r2 from "./academic/book-14/reading/test-2-answers.json";
import b14r3 from "./academic/book-14/reading/test-3-answers.json";
import b14r4 from "./academic/book-14/reading/test-4-answers.json";
import b15r1 from "./academic/book-15/reading/test-1-answers.json";
import b15r2 from "./academic/book-15/reading/test-2-answers.json";
import b15r3 from "./academic/book-15/reading/test-3-answers.json";
import b15r4 from "./academic/book-15/reading/test-4-answers.json";
import b16r1 from "./academic/book-16/reading/test-1-answers.json";
import b16r2 from "./academic/book-16/reading/test-2-answers.json";
import b16r3 from "./academic/book-16/reading/test-3-answers.json";
import b16r4 from "./academic/book-16/reading/test-4-answers.json";
import b17r1 from "./academic/book-17/reading/test-1-answers.json";
import b17r2 from "./academic/book-17/reading/test-2-answers.json";
import b17r3 from "./academic/book-17/reading/test-3-answers.json";
import b17r4 from "./academic/book-17/reading/test-4-answers.json";
import b18r1 from "./academic/book-18/reading/test-1-answers.json";
import b18r2 from "./academic/book-18/reading/test-2-answers.json";
import b18r3 from "./academic/book-18/reading/test-3-answers.json";
import b18r4 from "./academic/book-18/reading/test-4-answers.json";
import b19r1 from "./academic/book-19/reading/test-1-answers.json";
import b19r2 from "./academic/book-19/reading/test-2-answers.json";
import b19r3 from "./academic/book-19/reading/test-3-answers.json";
import b19r4 from "./academic/book-19/reading/test-4-answers.json";

// ─── Listening Answer Keys ───────────────────────────────────────────────────
import b11l1 from "./academic/book-11/listening/test-1-answers.json";
import b11l2 from "./academic/book-11/listening/test-2-answers.json";
import b11l3 from "./academic/book-11/listening/test-3-answers.json";
import b11l4 from "./academic/book-11/listening/test-4-answers.json";
import b12l1 from "./academic/book-12/listening/test-1-answers.json";
import b12l2 from "./academic/book-12/listening/test-2-answers.json";
import b12l3 from "./academic/book-12/listening/test-3-answers.json";
import b12l4 from "./academic/book-12/listening/test-4-answers.json";
import b13l1 from "./academic/book-13/listening/test-1-answers.json";
import b13l2 from "./academic/book-13/listening/test-2-answers.json";
import b13l3 from "./academic/book-13/listening/test-3-answers.json";
import b13l4 from "./academic/book-13/listening/test-4-answers.json";
import b14l1 from "./academic/book-14/listening/test-1-answers.json";
import b14l2 from "./academic/book-14/listening/test-2-answers.json";
import b14l3 from "./academic/book-14/listening/test-3-answers.json";
import b14l4 from "./academic/book-14/listening/test-4-answers.json";
import b15l1 from "./academic/book-15/listening/test-1-answers.json";
import b15l2 from "./academic/book-15/listening/test-2-answers.json";
import b15l3 from "./academic/book-15/listening/test-3-answers.json";
import b15l4 from "./academic/book-15/listening/test-4-answers.json";
import b16l1 from "./academic/book-16/listening/test-1-answers.json";
import b16l2 from "./academic/book-16/listening/test-2-answers.json";
import b16l3 from "./academic/book-16/listening/test-3-answers.json";
import b16l4 from "./academic/book-16/listening/test-4-answers.json";
import b17l1 from "./academic/book-17/listening/test-1-answers.json";
import b17l2 from "./academic/book-17/listening/test-2-answers.json";
import b17l3 from "./academic/book-17/listening/test-3-answers.json";
import b17l4 from "./academic/book-17/listening/test-4-answers.json";
import b18l1 from "./academic/book-18/listening/test-1-answers.json";
import b18l2 from "./academic/book-18/listening/test-2-answers.json";
import b18l3 from "./academic/book-18/listening/test-3-answers.json";
import b18l4 from "./academic/book-18/listening/test-4-answers.json";
import b19l1 from "./academic/book-19/listening/test-1-answers.json";
import b19l2 from "./academic/book-19/listening/test-2-answers.json";
import b19l3 from "./academic/book-19/listening/test-3-answers.json";
import b19l4 from "./academic/book-19/listening/test-4-answers.json";

// Keyed by route testId (e.g. "book-11-test-1") + module
export const readingAnswerKeys: Record<string, AnswerKey> = {
    "book-11-test-1": b11r1 as AnswerKey, "book-11-test-2": b11r2 as AnswerKey,
    "book-11-test-3": b11r3 as AnswerKey, "book-11-test-4": b11r4 as AnswerKey,
    "book-12-test-1": b12r1 as AnswerKey, "book-12-test-2": b12r2 as AnswerKey,
    "book-12-test-3": b12r3 as AnswerKey, "book-12-test-4": b12r4 as AnswerKey,
    "book-13-test-1": b13r1 as AnswerKey, "book-13-test-2": b13r2 as AnswerKey,
    "book-13-test-3": b13r3 as AnswerKey, "book-13-test-4": b13r4 as AnswerKey,
    "book-14-test-1": b14r1 as AnswerKey, "book-14-test-2": b14r2 as AnswerKey,
    "book-14-test-3": b14r3 as AnswerKey, "book-14-test-4": b14r4 as AnswerKey,
    "book-15-test-1": b15r1 as AnswerKey, "book-15-test-2": b15r2 as AnswerKey,
    "book-15-test-3": b15r3 as AnswerKey, "book-15-test-4": b15r4 as AnswerKey,
    "book-16-test-1": b16r1 as AnswerKey, "book-16-test-2": b16r2 as AnswerKey,
    "book-16-test-3": b16r3 as AnswerKey, "book-16-test-4": b16r4 as AnswerKey,
    "book-17-test-1": b17r1 as AnswerKey, "book-17-test-2": b17r2 as AnswerKey,
    "book-17-test-3": b17r3 as AnswerKey, "book-17-test-4": b17r4 as AnswerKey,
    "book-18-test-1": b18r1 as AnswerKey, "book-18-test-2": b18r2 as AnswerKey,
    "book-18-test-3": b18r3 as AnswerKey, "book-18-test-4": b18r4 as AnswerKey,
    "book-19-test-1": b19r1 as AnswerKey, "book-19-test-2": b19r2 as AnswerKey,
    "book-19-test-3": b19r3 as AnswerKey, "book-19-test-4": b19r4 as AnswerKey,
};

export const listeningAnswerKeys: Record<string, AnswerKey> = {
    "book-11-test-1": b11l1 as AnswerKey, "book-11-test-2": b11l2 as AnswerKey,
    "book-11-test-3": b11l3 as AnswerKey, "book-11-test-4": b11l4 as AnswerKey,
    "book-12-test-1": b12l1 as AnswerKey, "book-12-test-2": b12l2 as AnswerKey,
    "book-12-test-3": b12l3 as AnswerKey, "book-12-test-4": b12l4 as AnswerKey,
    "book-13-test-1": b13l1 as AnswerKey, "book-13-test-2": b13l2 as AnswerKey,
    "book-13-test-3": b13l3 as AnswerKey, "book-13-test-4": b13l4 as AnswerKey,
    "book-14-test-1": b14l1 as AnswerKey, "book-14-test-2": b14l2 as AnswerKey,
    "book-14-test-3": b14l3 as AnswerKey, "book-14-test-4": b14l4 as AnswerKey,
    "book-15-test-1": b15l1 as AnswerKey, "book-15-test-2": b15l2 as AnswerKey,
    "book-15-test-3": b15l3 as AnswerKey, "book-15-test-4": b15l4 as AnswerKey,
    "book-16-test-1": b16l1 as AnswerKey, "book-16-test-2": b16l2 as AnswerKey,
    "book-16-test-3": b16l3 as AnswerKey, "book-16-test-4": b16l4 as AnswerKey,
    "book-17-test-1": b17l1 as AnswerKey, "book-17-test-2": b17l2 as AnswerKey,
    "book-17-test-3": b17l3 as AnswerKey, "book-17-test-4": b17l4 as AnswerKey,
    "book-18-test-1": b18l1 as AnswerKey, "book-18-test-2": b18l2 as AnswerKey,
    "book-18-test-3": b18l3 as AnswerKey, "book-18-test-4": b18l4 as AnswerKey,
    "book-19-test-1": b19l1 as AnswerKey, "book-19-test-2": b19l2 as AnswerKey,
    "book-19-test-3": b19l3 as AnswerKey, "book-19-test-4": b19l4 as AnswerKey,
};

export function getAnswerKey(testId: string, testType: "listening" | "reading"): AnswerKey | null {
    const map = testType === "listening" ? listeningAnswerKeys : readingAnswerKeys;
    return map[testId] ?? null;
}
