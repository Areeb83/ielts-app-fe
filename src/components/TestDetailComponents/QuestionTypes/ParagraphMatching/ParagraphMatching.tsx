import React from "react";
import type { AnswerMap, ParagraphMatchingData } from "../../../../types/question";
import "./ParagraphMatching.css";

interface ParagraphMatchingProps {
    instruction: string;
    questionRange: string;
    data: ParagraphMatchingData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
}

const formatInstruction = (text: string) => {
    // Split into sentences on ". " or "? " boundaries
    const sentences = text.replace(/([.?])\s+/g, '$1\n').split('\n');

    return sentences.map((sentence, si) => {
        // Handle **bold** within each sentence
        const boldParts = sentence.split(/(\*\*[^*]+\*\*)/g);
        const rendered = boldParts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        return (
            <React.Fragment key={si}>
                {si > 0 && <br />}
                {rendered}
            </React.Fragment>
        );
    });
};

const ParagraphMatching: React.FC<ParagraphMatchingProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
}) => {
    return (
        <div className="paragraph-matching-container">
            <div className="paragraph-matching__header">
                {questionRange && (
                    <h4 className="paragraph-matching__range">{questionRange}</h4>
                )}
                <p className="paragraph-matching__instruction">{formatInstruction(instruction)}</p>
            </div>

            <div className="paragraph-matching__list">
                {data.questions.map((q) => (
                    <div key={q.id} className="paragraph-matching__row">
                        <span className="paragraph-matching__num">{q.questionNumber}</span>
                        <select
                            className="paragraph-matching__select"
                            value={(answers[q.id] as string) ?? ""}
                            onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        >
                            <option value="" disabled hidden>—</option>
                            {data.paragraphs.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <span className="paragraph-matching__text">{q.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParagraphMatching;
