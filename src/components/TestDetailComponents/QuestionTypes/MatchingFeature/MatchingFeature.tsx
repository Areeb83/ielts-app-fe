import React from "react";
import type { AnswerMap, MatchingFeatureData } from "../../../../types/question";
import "./MatchingFeature.css";

interface MatchingFeatureProps {
    instruction: string;
    questionRange: string;
    data: MatchingFeatureData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    optionsBelow?: boolean;
    reviewMode?: boolean;
    activeQuestion?: number;
    questionStatus?: Record<string, 'correct' | 'wrong'>;
}

const formatInstruction = (text: string) => {
    const regex = /(NO MORE THAN [A-Z ]+|[A-Z][–-][A-Z]|\*\*[^*]+\*\*)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
        if (part.match(/^\*\*.*\*\*$/)) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.match(/(NO MORE THAN|[A-Z][–-][A-Z])/)) return <strong key={i}>{part}</strong>;
        return part;
    });
};

const MatchingFeature: React.FC<MatchingFeatureProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    optionsBelow = false,
    reviewMode,
    activeQuestion,
    questionStatus,
}) => {
    const optionsBox = (
        <div className="matching-feature__options-box">
            <table className="matching-feature__options-table">
                <thead>
                    <tr>
                        <th colSpan={2} className="matching-feature__options-title">
                            {data.title || "List of Options"}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.options.map((opt) => {
                        return (
                            <tr key={opt.letter}>
                                <td className="matching-feature__opt-letter">{opt.letter}</td>
                                <td className="matching-feature__opt-text">
                                    {opt.text}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="matching-feature-container">
            <div className="matching-feature__header">
                {questionRange && (
                    <h4 className="matching-feature__range">{questionRange}</h4>
                )}
                <p className="matching-feature__instruction">{formatInstruction(instruction)}</p>
            </div>

            <div className={`matching-feature__content${optionsBelow ? " matching-feature__content--below" : ""}`}>
                {/* Options box: LEFT for listening, BELOW for reading */}
                {!optionsBelow && optionsBox}

                {/* Matching Grid */}
                <div className="matching-feature__table-wrapper">
                    {data.rightSideTitle && (
                        <div className="matching-feature__right-title">{data.rightSideTitle}</div>
                    )}
                    <table className="matching-feature__table">
                        <thead>
                            <tr>
                                <th className="matching-feature__th matching-feature__th--empty"></th>
                                {data.options.map((opt) => (
                                    <th key={opt.letter} className="matching-feature__th">
                                        {opt.letter}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.questions.map((q) => {
                                const selectedAnswer = answers[q.id] as string;

                                const status = questionStatus?.[q.id];
                                return (
                                    <tr key={q.id} className={`matching-feature__row${status === 'correct' ? ' matching-feature__row--correct' : ''}${status === 'wrong' ? ' matching-feature__row--wrong' : ''}`}>
                                        <td className="matching-feature__td-question">
                                            <div className="matching-feature__question-content">
                                                <span className={`matching-feature__q-num${activeQuestion === Number(q.id) ? " matching-feature__q-num--active" : ""}`}>{q.questionNumber}</span>
                                                <span className="matching-feature__q-text">
                                                    {q.text}
                                                </span>
                                            </div>
                                        </td>

                                        {data.options.map((opt) => {
                                            const isSelected = selectedAnswer === opt.letter;
                                            return (
                                                <td
                                                    key={opt.letter}
                                                    className={`matching-feature__td-radio ${isSelected ? 'selected' : ''}${isSelected && questionStatus?.[q.id] === 'correct' ? ' matching-feature__td-radio--correct' : ''}${isSelected && questionStatus?.[q.id] === 'wrong' ? ' matching-feature__td-radio--wrong' : ''}`}
                                                >
                                                    <label className="matching-feature__label">
                                                        <input
                                                            type="radio"
                                                            name={`question-${q.id}`}
                                                            value={opt.letter}
                                                            checked={isSelected}
                                                            onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                                            className="matching-feature__radio-input"
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

                {/* Options box below questions for reading */}
                {optionsBelow && optionsBox}
            </div>
        </div>
    );
};

export default MatchingFeature;
