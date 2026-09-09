import type { TestData } from "../types/question";

// ─── Reading Test Data ───────────────────────────────────────────────────────
import b11r1 from "./academic/book-11/reading/test-1.json";
import b11r2 from "./academic/book-11/reading/test-2.json";
import b11r3 from "./academic/book-11/reading/test-3.json";
import b11r4 from "./academic/book-11/reading/test-4.json";
import b12r1 from "./academic/book-12/reading/test-1.json";
import b12r2 from "./academic/book-12/reading/test-2.json";
import b12r3 from "./academic/book-12/reading/test-3.json";
import b12r4 from "./academic/book-12/reading/test-4.json";
import b13r1 from "./academic/book-13/reading/test-1.json";
import b13r2 from "./academic/book-13/reading/test-2.json";
import b13r3 from "./academic/book-13/reading/test-3.json";
import b13r4 from "./academic/book-13/reading/test-4.json";
import b14r1 from "./academic/book-14/reading/test-1.json";
import b14r2 from "./academic/book-14/reading/test-2.json";
import b14r3 from "./academic/book-14/reading/test-3.json";
import b14r4 from "./academic/book-14/reading/test-4.json";
import b15r1 from "./academic/book-15/reading/test-1.json";
import b15r2 from "./academic/book-15/reading/test-2.json";
import b15r3 from "./academic/book-15/reading/test-3.json";
import b15r4 from "./academic/book-15/reading/test-4.json";
import b16r1 from "./academic/book-16/reading/test-1.json";
import b16r2 from "./academic/book-16/reading/test-2.json";
import b16r3 from "./academic/book-16/reading/test-3.json";
import b16r4 from "./academic/book-16/reading/test-4.json";
import b17r1 from "./academic/book-17/reading/test-1.json";
import b17r2 from "./academic/book-17/reading/test-2.json";
import b17r3 from "./academic/book-17/reading/test-3.json";
import b17r4 from "./academic/book-17/reading/test-4.json";
import b18r1 from "./academic/book-18/reading/test-1.json";
import b18r2 from "./academic/book-18/reading/test-2.json";
import b18r3 from "./academic/book-18/reading/test-3.json";
import b18r4 from "./academic/book-18/reading/test-4.json";
import b19r1 from "./academic/book-19/reading/test-1.json";
import b19r2 from "./academic/book-19/reading/test-2.json";
import b19r3 from "./academic/book-19/reading/test-3.json";
import b19r4 from "./academic/book-19/reading/test-4.json";

// ─── Listening Test Data ─────────────────────────────────────────────────────
import b11l1 from "./academic/book-11/listening/test-1.json";
import b11l2 from "./academic/book-11/listening/test-2.json";
import b11l3 from "./academic/book-11/listening/test-3.json";
import b11l4 from "./academic/book-11/listening/test-4.json";
import b12l1 from "./academic/book-12/listening/test-1.json";
import b12l2 from "./academic/book-12/listening/test-2.json";
import b12l3 from "./academic/book-12/listening/test-3.json";
import b12l4 from "./academic/book-12/listening/test-4.json";
import b13l1 from "./academic/book-13/listening/test-1.json";
import b13l2 from "./academic/book-13/listening/test-2.json";
import b13l3 from "./academic/book-13/listening/test-3.json";
import b13l4 from "./academic/book-13/listening/test-4.json";
import b14l1 from "./academic/book-14/listening/test-1.json";
import b14l2 from "./academic/book-14/listening/test-2.json";
import b14l3 from "./academic/book-14/listening/test-3.json";
import b14l4 from "./academic/book-14/listening/test-4.json";
import b15l1 from "./academic/book-15/listening/test-1.json";
import b15l2 from "./academic/book-15/listening/test-2.json";
import b15l3 from "./academic/book-15/listening/test-3.json";
import b15l4 from "./academic/book-15/listening/test-4.json";
import b16l1 from "./academic/book-16/listening/test-1.json";
import b16l2 from "./academic/book-16/listening/test-2.json";
import b16l3 from "./academic/book-16/listening/test-3.json";
import b16l4 from "./academic/book-16/listening/test-4.json";
import b17l1 from "./academic/book-17/listening/test-1.json";
import b17l2 from "./academic/book-17/listening/test-2.json";
import b17l3 from "./academic/book-17/listening/test-3.json";
import b17l4 from "./academic/book-17/listening/test-4.json";
import b18l1 from "./academic/book-18/listening/test-1.json";
import b18l2 from "./academic/book-18/listening/test-2.json";
import b18l3 from "./academic/book-18/listening/test-3.json";
import b18l4 from "./academic/book-18/listening/test-4.json";
import b19l1 from "./academic/book-19/listening/test-1.json";
import b19l2 from "./academic/book-19/listening/test-2.json";
import b19l3 from "./academic/book-19/listening/test-3.json";
import b19l4 from "./academic/book-19/listening/test-4.json";

const cast = (d: unknown) => d as unknown as TestData;

export const readingTestDataMap: Record<string, TestData> = {
    "book-11-test-1": cast(b11r1), "book-11-test-2": cast(b11r2), "book-11-test-3": cast(b11r3), "book-11-test-4": cast(b11r4),
    "book-12-test-1": cast(b12r1), "book-12-test-2": cast(b12r2), "book-12-test-3": cast(b12r3), "book-12-test-4": cast(b12r4),
    "book-13-test-1": cast(b13r1), "book-13-test-2": cast(b13r2), "book-13-test-3": cast(b13r3), "book-13-test-4": cast(b13r4),
    "book-14-test-1": cast(b14r1), "book-14-test-2": cast(b14r2), "book-14-test-3": cast(b14r3), "book-14-test-4": cast(b14r4),
    "book-15-test-1": cast(b15r1), "book-15-test-2": cast(b15r2), "book-15-test-3": cast(b15r3), "book-15-test-4": cast(b15r4),
    "book-16-test-1": cast(b16r1), "book-16-test-2": cast(b16r2), "book-16-test-3": cast(b16r3), "book-16-test-4": cast(b16r4),
    "book-17-test-1": cast(b17r1), "book-17-test-2": cast(b17r2), "book-17-test-3": cast(b17r3), "book-17-test-4": cast(b17r4),
    "book-18-test-1": cast(b18r1), "book-18-test-2": cast(b18r2), "book-18-test-3": cast(b18r3), "book-18-test-4": cast(b18r4),
    "book-19-test-1": cast(b19r1), "book-19-test-2": cast(b19r2), "book-19-test-3": cast(b19r3), "book-19-test-4": cast(b19r4),
};

export const listeningTestDataMap: Record<string, TestData> = {
    "book-11-test-1": cast(b11l1), "book-11-test-2": cast(b11l2), "book-11-test-3": cast(b11l3), "book-11-test-4": cast(b11l4),
    "book-12-test-1": cast(b12l1), "book-12-test-2": cast(b12l2), "book-12-test-3": cast(b12l3), "book-12-test-4": cast(b12l4),
    "book-13-test-1": cast(b13l1), "book-13-test-2": cast(b13l2), "book-13-test-3": cast(b13l3), "book-13-test-4": cast(b13l4),
    "book-14-test-1": cast(b14l1), "book-14-test-2": cast(b14l2), "book-14-test-3": cast(b14l3), "book-14-test-4": cast(b14l4),
    "book-15-test-1": cast(b15l1), "book-15-test-2": cast(b15l2), "book-15-test-3": cast(b15l3), "book-15-test-4": cast(b15l4),
    "book-16-test-1": cast(b16l1), "book-16-test-2": cast(b16l2), "book-16-test-3": cast(b16l3), "book-16-test-4": cast(b16l4),
    "book-17-test-1": cast(b17l1), "book-17-test-2": cast(b17l2), "book-17-test-3": cast(b17l3), "book-17-test-4": cast(b17l4),
    "book-18-test-1": cast(b18l1), "book-18-test-2": cast(b18l2), "book-18-test-3": cast(b18l3), "book-18-test-4": cast(b18l4),
    "book-19-test-1": cast(b19l1), "book-19-test-2": cast(b19l2), "book-19-test-3": cast(b19l3), "book-19-test-4": cast(b19l4),
};

export function getTestData(testId: string, testType: "listening" | "reading"): TestData | null {
    const map = testType === "listening" ? listeningTestDataMap : readingTestDataMap;
    return map[testId] ?? null;
}
