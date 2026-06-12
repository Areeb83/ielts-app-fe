import React from "react";
import type { AnswerMap, ContentPart, SentenceCompletionData } from "../../../../types/question";
import "./SentenceCompletion.css";

interface SentenceCompletionProps {
    instruction: string;
    questionRange: string;
    data: SentenceCompletionData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    reviewMode?: boolean;
    questionStatus?: Record<string, 'correct' | 'wrong'>;
}

/**
 * A helper component that renders an input that grows as the user types.
 * It uses a hidden span to measure the text width.
 */
const AutoGrowingInput: React.FC<{
    id: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    status?: 'correct' | 'wrong';
}> = ({ id, value, onChange, disabled, status }) => {
    const [width, setWidth] = React.useState<number | string>("200px");
    const spanRef = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        if (spanRef.current) {
            // Measure the span width. Add some extra space for the cursor/comfort.
            const measuredWidth = spanRef.current.offsetWidth;
            // Respect the min-width of 200px from CSS, but allow it to grow.
            // Added 10px buffer for cursor comfort.
            setWidth(Math.max(200, measuredWidth + 10));
        }
    }, [value]);

    return (
        <div className="input-wrapper">
            {/* The hidden measurer must have the same font as the input */}
            <span ref={spanRef} className="hidden-measurer">
                {value || " "}
            </span>
            <input
                type="text"
                className={`sentence-input${disabled ? " sentence-input--review" : ""}${status === "correct" ? " sentence-input--correct" : ""}${status === "wrong" ? " sentence-input--wrong" : ""}`}
                style={{ width: typeof width === 'number' ? `${width}px` : width }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                disabled={disabled}
            />
            <span className="fake-placeholder">{id}</span>
        </div>
    );
};

const SentenceCompletion: React.FC<SentenceCompletionProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    reviewMode,
    questionStatus,
}) => {
    // Helper to render a content part (text or input)
    const renderContentPart = (part: ContentPart, index: number) => {
        if (typeof part === "string") {
            if (part.startsWith("•")) {
                return (
                    <span key={index}>
                        <strong style={{ fontSize: "1.2em" }}>•</strong>
                        {part.slice(1)}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        }

        if (part.type === "bold") {
            return <strong key={index}>{part.text}</strong>;
        }

        if (part.type === "input") {
            const value = answers[part.id] as string || "";
            return (
                <AutoGrowingInput
                    key={part.id}
                    id={part.id}
                    value={value}
                    onChange={(val) => onAnswerChange(part.id, val)}
                    disabled={reviewMode}
                    status={questionStatus?.[part.id]}
                />
            );
        }

        return null;
    };

    const formatInstruction = (text: string) => {
        const regex = /(NO MORE THAN [A-Z ]+|\*\*[^*]+\*\*)/g;
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (part.match(/^NO MORE THAN/)) return <strong key={i}>{part}</strong>;
            if (part.match(/^\*\*.*\*\*$/)) return <strong key={i}>{part.slice(2, -2)}</strong>;
            return part;
        });
    };

    return (
        <div className="sentence-completion-container">
            {questionRange && (
                <h4 className="sentence-completion__range">{questionRange}</h4>
            )}
            <p className="sentence-completion__instruction">{formatInstruction(instruction)}</p>

            <div className="sentence-completion__content">
                {data.title && <h3 className="sentence-completion__title">{data.title}</h3>}
                <div className="sentence-completion__steps flex flex-col gap-2">
                    {data.sentences.map((sentence, idx) => {
                        const firstPart = sentence.content[0];
                        const isSubPoint = typeof firstPart === "string" && firstPart.trimStart().startsWith("–");
                        return (
                            <div key={idx} className={`sentence-completion__step-wrapper${isSubPoint ? " sentence-completion__step-wrapper--sub" : ""}`}>
                                <div className="sentence-completion__step">
                                    <div className="sentence-completion__step-content">
                                        {sentence.content.map((part, pIdx) => renderContentPart(part, pIdx))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SentenceCompletion;
