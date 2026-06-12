import React from "react";
import type { AnswerMap, ContentPart, SummaryCompletionData } from "../../../../types/question";
import "./SummaryCompletion.css";

interface SummaryCompletionProps {
    instruction: string;
    questionRange: string;
    data: SummaryCompletionData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    reviewMode?: boolean;
    questionStatus?: Record<string, 'correct' | 'wrong'>;
}

/**
 * A helper component that renders an input that grows as the user types.
 */
const AutoGrowingSummaryInput: React.FC<{
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
            const measuredWidth = spanRef.current.offsetWidth;
            // Added 10px buffer for cursor comfort.
            setWidth(Math.max(200, measuredWidth + 10));
        }
    }, [value]);

    return (
        <div className="summary-input-wrapper">
            <span ref={spanRef} className="summary-hidden-measurer">
                {value || " "}
            </span>
            <input
                type="text"
                className={`summary-completion__input${disabled ? " summary-completion__input--review" : ""}${status === "correct" ? " summary-completion__input--correct" : ""}${status === "wrong" ? " summary-completion__input--wrong" : ""}`}
                style={{ width: typeof width === 'number' ? `${width}px` : width }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                disabled={disabled}
            />
            <span className="summary-fake-placeholder">{id}</span>
        </div>
    );
};

const SummaryCompletion: React.FC<SummaryCompletionProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    reviewMode,
    questionStatus,
}) => {
    // Helper to render a content part (text or input) within the paragraph
    const renderContentPart = (part: ContentPart, index: number) => {
        if (typeof part === "string") {
            return <span key={index}>{part}</span>;
        }

        if (part.type === "input") {
            const value = answers[part.id] || "";
            return (
                <AutoGrowingSummaryInput
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
        <div className="summary-completion-container">
            {questionRange && (
                <h4 className="summary-completion__range">{questionRange}</h4>
            )}
            <p className="summary-completion__instruction">{formatInstruction(instruction)}</p>

            <div className="summary-completion__content-box">
                {data.title && <h3 className="summary-completion__title">{data.title}</h3>}

                {data.sections ? (
                    <div className="summary-completion__sections">
                        {data.sections.map((section, sIdx) => (
                            <div key={sIdx} className="summary-completion__section">
                                {section.heading && (
                                    <p className="summary-completion__section-heading">{section.heading}</p>
                                )}
                                <div className="summary-completion__notes-list">
                                    {section.items.map((item, iIdx) => (
                                        <div
                                            key={iIdx}
                                            className={[
                                                "summary-completion__notes-item",
                                                item.indent ? "summary-completion__notes-item--indent" : "",
                                            ].filter(Boolean).join(" ")}
                                        >
                                            {item.bullet && (
                                                <span className="summary-completion__notes-bullet">{item.bullet}</span>
                                            )}
                                            <span className="summary-completion__notes-content">
                                                {item.content.map((part, pIdx) => renderContentPart(part, pIdx))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="summary-completion__paragraph">
                        {(data.content ?? []).map((part, index) => renderContentPart(part, index))}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SummaryCompletion;
