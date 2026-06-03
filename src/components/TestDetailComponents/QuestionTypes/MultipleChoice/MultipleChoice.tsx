import React from "react";
import type {
    MultipleChoiceData,
    MultipleChoiceQuestion,
    AnswerMap,
    IdentificationData,
} from "../../../../types/question";
import "./MultipleChoice.css";

interface MultipleChoiceProps {
    instruction: string;
    questionRange: string;
    data: MultipleChoiceData | IdentificationData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string | string[]) => void;
}

const formatInstruction = (text: string) => {
    const regex = /(\b(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)\b|NO MORE THAN [A-Z ]+|\*\*[^*]+\*\*)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
        if (part.match(/^\*\*.*\*\*$/)) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part && part.match(/^(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|NO MORE THAN)/)) return <strong key={i}>{part}</strong>;
        return part;
    });
};

const MultipleChoiceItem: React.FC<{
    question: MultipleChoiceQuestion;
    answers: AnswerMap;
    onAnswerChange: (id: string, value: string | string[]) => void;
}> = ({ question, answers, onAnswerChange }) => {
    const isMultiple = !!question.multiple;
    const maxCount = question.count ?? 1;

    // Derive selected state
    const selected: string[] = isMultiple
        ? ((answers[question.id] as string[]) || [])
        : answers[question.id]
        ? [answers[question.id] as string]
        : [];

    const isSelected = (letter: string) => selected.includes(letter);

    const handleClick = (letter: string) => {
        if (isMultiple) {
            if (isSelected(letter)) {
                // Deselect
                onAnswerChange(
                    question.id,
                    selected.filter((l) => l !== letter)
                );
            } else if (selected.length < maxCount) {
                // Select (if under limit)
                onAnswerChange(question.id, [...selected, letter]);
            }
            // Else: blocked — do nothing
        } else {
            // Single answer: replace
            onAnswerChange(question.id, letter);
        }
    };

    const isBlocked = (letter: string) =>
        isMultiple && !isSelected(letter) && selected.length >= maxCount;

    return (
        <div className="mc-question">
            <p className="mc-question__text">
                {!isMultiple && <span className="mc-question__number">{question.id}</span>}{!isMultiple && " "}
                {formatInstruction(question.text)}
            </p>
            <div className="mc-question__options">
                {question.options.map((option) => (
                    <button
                        key={option.letter}
                        className={[
                            "mc-option",
                            isSelected(option.letter) ? "mc-option--selected" : "",
                            isBlocked(option.letter) ? "mc-option--blocked" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => handleClick(option.letter)}
                        disabled={isBlocked(option.letter)}
                        aria-pressed={isSelected(option.letter)}
                    >
                        {isMultiple ? (
                            <span className="mc-option__checkbox"></span>
                        ) : (
                            <span className="mc-option__radio"></span>
                        )}
                        <span className="mc-option__text">{option.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
}) => {
    // Check if this is an identification question (T/F/NG or Y/N/NG)
    const isIdentification = "optionsType" in data;
    const identificationData = isIdentification ? (data as IdentificationData) : null;
    
    const explanatoryText = identificationData
        ? identificationData.optionsType === "TRUE_FALSE"
            ? "Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this."
            : "Choose YES if the statement agrees with the claims of the writer, choose NO if the statement contradicts the claims of the writer, or choose NOT GIVEN if it is impossible to say what the writer thinks about this."
        : null;

    const questions = identificationData 
        ? identificationData.questions.map(q => ({
            ...q,
            options: (identificationData.optionsType === "TRUE_FALSE" 
                ? ["TRUE", "FALSE", "NOT GIVEN"] 
                : ["YES", "NO", "NOT GIVEN"]
            ).map(opt => ({ letter: opt, text: opt })),
            multiple: false
        } as MultipleChoiceQuestion))
        : (data as MultipleChoiceData).questions;

    return (
        <div className="mc-container">
            {questionRange && (
                <h4 className="mc__range">{questionRange}</h4>
            )}

            {"title" in data && (data as any).title && (
                <h3 className="mc__title">{(data as any).title}</h3>
            )}

            {explanatoryText && (
                <div className="mc__explanation">
                    {formatInstruction(explanatoryText)}
                </div>
            )}

            <div className="mc__questions">
                {questions.map((question) => (
                    <MultipleChoiceItem
                        key={question.id}
                        question={question}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default MultipleChoice;
