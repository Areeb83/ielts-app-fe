// Footer.tsx — IELTS Question Navigation Footer
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import "./Footer.css";

export interface FooterPart {
    id: number;
    label: string;
    questions: number[];
    mergedRanges?: [number, number][]; // e.g. [[25,26]] means show "25-26" as one box
}

interface FooterProps {
    parts: FooterPart[];
    answers: Record<string, any>;
    currentQuestion: number;
    onSelectQuestion: (q: number) => void;
    onSubmit?: () => void;
}

function partOf(q: number, parts: FooterPart[]) {
    return parts.find((p) => p.questions.includes(q));
}

/** Build display items from a part's questions + mergedRanges */
type DisplayItem = { type: "single"; q: number } | { type: "range"; start: number; end: number };

function buildDisplayItems(part: FooterPart): DisplayItem[] {
    const merged = part.mergedRanges ?? [];
    const mergedSet = new Set<number>();
    for (const [s, e] of merged) {
        for (let i = s; i <= e; i++) mergedSet.add(i);
    }

    const items: DisplayItem[] = [];
    let i = 0;
    while (i < part.questions.length) {
        const q = part.questions[i];
        const range = merged.find(([s]) => s === q);
        if (range) {
            items.push({ type: "range", start: range[0], end: range[1] });
            // Skip all questions in this range
            i += range[1] - range[0] + 1;
        } else if (!mergedSet.has(q)) {
            items.push({ type: "single", q });
            i++;
        } else {
            i++;
        }
    }
    return items;
}

const Footer: React.FC<FooterProps> = ({
    parts,
    answers,
    currentQuestion,
    onSelectQuestion,
    onSubmit,
}) => {
    const initialPart = partOf(currentQuestion, parts)?.id ?? parts[0]?.id ?? 1;
    const [activePart, setActivePart] = useState(initialPart);

    // Sync activePart when currentQuestion moves to a different part
    const currentPartId = partOf(currentQuestion, parts)?.id;
    if (currentPartId && currentPartId !== activePart) {
        setActivePart(currentPartId);
    }

    // Collect all merged ranges across parts
    const allMergedRanges = parts.flatMap((p) => p.mergedRanges ?? []);

    const isAnswered = (q: number) => {
        // Check if q belongs to a merged range (e.g. 25 is part of [25,26])
        const range = allMergedRanges.find(([s, e]) => q >= s && q <= e);
        if (range) {
            const requiredCount = range[1] - range[0] + 1;
            // Answer stored under "25 – 26" key
            const rangeKey = `${range[0]} – ${range[1]}`;
            const val = answers[rangeKey];
            if (Array.isArray(val)) {
                const filled = val.filter((v) => v && String(v).trim() !== "");
                return filled.length >= requiredCount;
            }
            return false;
        }
        // Normal single-question check
        const val = answers[String(q)];
        if (val == null) return false;
        if (typeof val === "string") return val.trim() !== "";
        if (Array.isArray(val)) return val.some((v) => v && String(v).trim() !== "");
        return Boolean(val);
    };

    const answeredCount = (part: FooterPart) =>
        part.questions.reduce((n, q) => n + (isAnswered(q) ? 1 : 0), 0);

    return (
        <footer className="ielts-footer" style={{ position: "fixed" }}>
            <div className="ielts-footer__parts-row">
                {parts.map((part, idx) => {
                    const expanded = part.id === activePart;
                    return (
                        <React.Fragment key={part.id}>
                            {idx > 0 && <div className="ielts-footer__divider" />}

                            {expanded ? (
                                <div className="ielts-footer__part ielts-footer__part--active">
                                    <span className="ielts-footer__part-label ielts-footer__part-label--bar">
                                        {part.label}
                                    </span>
                                    <div className="ielts-footer__numbers">
                                        {buildDisplayItems(part).map((item) => {
                                            if (item.type === "single") {
                                                const current = item.q === currentQuestion;
                                                const answered = isAnswered(item.q);
                                                return (
                                                    <button
                                                        key={item.q}
                                                        type="button"
                                                        className={`ielts-footer__num-btn${answered ? " ielts-footer__num-btn--answered" : ""}`}
                                                        onClick={() => onSelectQuestion(item.q)}
                                                    >
                                                        <span className={`ielts-footer__num${current ? " ielts-footer__num--current" : ""}`}>
                                                            {item.q}
                                                        </span>
                                                    </button>
                                                );
                                            }
                                            // Range item
                                            const current = currentQuestion >= item.start && currentQuestion <= item.end;
                                            const answered = isAnswered(item.start) || isAnswered(item.end);
                                            return (
                                                <button
                                                    key={`${item.start}-${item.end}`}
                                                    type="button"
                                                    className={`ielts-footer__num-btn ielts-footer__num-btn--range${answered ? " ielts-footer__num-btn--answered" : ""}`}
                                                    onClick={() => onSelectQuestion(item.start)}
                                                >
                                                    <span className={`ielts-footer__num${current ? " ielts-footer__num--current" : ""}`}>
                                                        {item.start}-{item.end}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="ielts-footer__part ielts-footer__part--collapsed"
                                    onClick={() => onSelectQuestion(part.questions[0])}
                                >
                                    <span className="ielts-footer__part-label">
                                        {part.label}
                                    </span>
                                    <span className="ielts-footer__counter">
                                        {answeredCount(part)} of {part.questions.length}
                                    </span>
                                </button>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Submit button */}
            {onSubmit && (
                <button
                    className="ielts-footer__submit-btn"
                    onClick={onSubmit}
                    title="Submit"
                    aria-label="Submit"
                >
                    <FaCheck size={20} />
                </button>
            )}
        </footer>
    );
};

export default Footer;
