import React from "react";
import type { AnswerMap, DiagramLabellingData } from "../../../../types/question";
import "./DiagramLabelling.css";

interface DiagramLabellingProps {
    instruction: string;
    questionRange: string;
    data: DiagramLabellingData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    reviewMode?: boolean;
}

const formatInstruction = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*|NO MORE THAN [A-Z ]+)/g);
        const rendered = parts.map((part, i) => {
            if (part.match(/^\*\*.*\*\*$/)) return <strong key={i}>{part.slice(2, -2)}</strong>;
            if (part.match(/^NO MORE THAN/)) return <strong key={i}>{part}</strong>;
            return part;
        });
        return (
            <span key={li} style={{ display: 'block', marginBottom: li < lines.length - 1 ? '6px' : 0 }}>
                {rendered}
            </span>
        );
    });
};

const DiagramLabelling: React.FC<DiagramLabellingProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    reviewMode,
}) => {
    return (
        <div className="diagram-labelling-container">
            <div className="diagram-labelling__header">
                {questionRange && (
                    <h4 className="diagram-labelling__range">{questionRange}</h4>
                )}
                <p className="diagram-labelling__instruction">{formatInstruction(instruction)}</p>
            </div>

            {data.title && <h3 className="diagram-labelling__title">{data.title}</h3>}

            <img
                src={data.imageSrc}
                alt="Diagram"
                className="diagram-labelling__image"
            />

            <div className="diagram-labelling__inputs">
                {data.questions.map((q) => (
                    <div key={q.id} className="diagram-labelling__row">
                        <span className="diagram-labelling__num">{q.questionNumber}</span>
                        {q.label && (
                            <span className="diagram-labelling__label-text">{q.label}</span>
                        )}
                        <input
                            type="text"
                            className={`diagram-labelling__input${reviewMode ? " diagram-labelling__input--review" : ""}`}
                            value={(answers[q.id] as string) ?? ""}
                            onChange={(e) => onAnswerChange(q.id, e.target.value)}
                            disabled={reviewMode}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiagramLabelling;
