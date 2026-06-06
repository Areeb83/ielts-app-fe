import React from "react";
import type { AnswerMap, DiagramLabellingData } from "../../../../types/question";
import "./DiagramLabelling.css";

interface DiagramLabellingProps {
    instruction: string;
    questionRange: string;
    data: DiagramLabellingData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
}

const formatInstruction = (text: string) => {
    const regex = /(NO MORE THAN [A-Z ]+|\*\*[^*]+\*\*)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
        if (part.match(/^NO MORE THAN/)) return <strong key={i}>{part}</strong>;
        if (part.match(/^\*\*.*\*\*$/)) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return part;
    });
};

const DiagramLabelling: React.FC<DiagramLabellingProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
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
                            className="diagram-labelling__input"
                            value={(answers[q.id] as string) ?? ""}
                            onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiagramLabelling;
