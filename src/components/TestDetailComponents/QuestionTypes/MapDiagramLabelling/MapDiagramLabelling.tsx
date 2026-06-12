import React from "react";
import type { AnswerMap, MapDiagramLabellingData } from "../../../../types/question";
import "./MapDiagramLabelling.css";

interface MapDiagramLabellingProps {
    instruction: string;
    questionRange: string;
    data: MapDiagramLabellingData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    reviewMode?: boolean;
    activeQuestion?: number;
    questionStatus?: Record<string, 'correct' | 'wrong'>;
}

const MapDiagramLabelling: React.FC<MapDiagramLabellingProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    reviewMode,
    activeQuestion,
    questionStatus,
}) => {
    // Format instruction to bold uppercase constraints (e.g., "NO MORE THAN TWO WORDS")
    const formatInstruction = (text: string) => {
        const regex = /(NO MORE THAN [A-Z ]+|\*\*[^*]+\*\*)/g;
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (part.match(/^NO MORE THAN/)) {
                return <strong key={i}>{part}</strong>;
            }
            if (part.match(/^\*\*.*\*\*$/)) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="map-diagram-container">
            <div className="map-diagram__header">
                {questionRange && (
                    <h4 className="map-diagram__range">{questionRange}</h4>
                )}
                <p className="map-diagram__instruction">{formatInstruction(instruction)}</p>
            </div>

            {data.title && <h3 className="map-diagram__title">{data.title}</h3>}
            <div className={`map-diagram__content${reviewMode ? " map-diagram__content--vertical" : ""}`}>
                {/* Left Side: Image or Text */}
                <div className="map-diagram__image-wrapper">
                    {data.leftSideContent ? (
                        data.leftSideContent.type === 'image' ? (
                            <img
                                src={data.leftSideContent.value}
                                alt="Map or Diagram"
                                className="map-diagram__image"
                            />
                        ) : (
                            <div className="map-diagram__text-content">
                                {data.leftSideContent.value.split('\n').map((line, i) => {
                                    // 1. Detect if it's the title (first line if it's not an option)
                                    const isTitle = i === 0 && !line.match(/^[A-Z]\s+/);
                                    // 2. Detect if it's an option (starts with "A ", "B ", etc.)
                                    const optionMatch = line.match(/^([A-Z])\s+(.*)/);

                                    if (isTitle) {
                                        return <h4 key={i} className="map-diagram__text-title">{line}</h4>;
                                    }

                                    if (optionMatch) {
                                        return (
                                            <p key={i} className="map-diagram__text-line">
                                                <span className="map-diagram__text-letter">{optionMatch[1]}</span>
                                                <span>{optionMatch[2]}</span>
                                            </p>
                                        );
                                    }

                                    return <p key={i} className="map-diagram__text-line">{line}</p>;
                                })}
                            </div>
                        )
                    ) : (
                        data.imageSrc && (
                            <img
                                src={data.imageSrc}
                                alt="Map or Diagram"
                                className="map-diagram__image"
                            />
                        )
                    )}
                </div>

                {/* Right Side: Matching Grid */}
                <div className="map-diagram__table-wrapper">
                    {data.rightSideTitle && (
                        <h4 className="map-diagram__text-title">{data.rightSideTitle}</h4>
                    )}
                    <table className="map-diagram__table">
                        <thead>
                            <tr>
                                <th className="map-diagram__th map-diagram__th--empty"></th>
                                {data.options.map((opt) => (
                                    <th key={opt} className="map-diagram__th">
                                        {opt}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.questions.map((q) => {
                                const selectedAnswer = answers[q.id] as string;

                                const status = questionStatus?.[q.id];
                                return (
                                    <tr key={q.id} className={`map-diagram__row${status === 'correct' ? ' map-diagram__row--correct' : ''}${status === 'wrong' ? ' map-diagram__row--wrong' : ''}`}>
                                        {/* Question Text Cell */}
                                        <td className="map-diagram__td-question">
                                            <span className={`map-diagram__q-num${activeQuestion === Number(q.id) ? " map-diagram__q-num--active" : ""}`}>{q.questionNumber}</span>
                                            {q.text}
                                        </td>

                                        {/* Radio Button Cells */}
                                        {data.options.map((opt) => {
                                            const isSelected = selectedAnswer === opt;
                                            return (
                                                <td
                                                    key={opt}
                                                    className={`map-diagram__td-radio ${isSelected ? 'selected' : ''}${isSelected && questionStatus?.[q.id] === 'correct' ? ' map-diagram__td-radio--correct' : ''}${isSelected && questionStatus?.[q.id] === 'wrong' ? ' map-diagram__td-radio--wrong' : ''}`}
                                                >
                                                    <label className="map-diagram__label">
                                                        <input
                                                            type="radio"
                                                            name={`question-${q.id}`}
                                                            value={opt}
                                                            checked={isSelected}
                                                            onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                                            className="map-diagram__radio-input"
                                                            disabled={reviewMode}
                                                        />
                                                    </label>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MapDiagramLabelling;
