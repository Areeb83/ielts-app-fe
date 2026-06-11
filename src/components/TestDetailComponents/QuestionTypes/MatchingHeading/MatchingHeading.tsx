import React, { useState } from "react";
import type { MatchingHeadingData, AnswerMap } from "../../../../types/question";
import { DraggableWord } from "../FlowChartDragDrop/DraggableWord";
import "./MatchingHeading.css";

interface MatchingHeadingProps {
    instruction: string;
    questionRange?: string;
    data: MatchingHeadingData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    // Shared drag state passed down from TestDetailContainer
    draggingWordId?: string | null;
    onDragStart: (wordId: string) => void;
    onDragEnd: () => void;
    reviewMode?: boolean;
}

const MatchingHeading: React.FC<MatchingHeadingProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    draggingWordId,
    onDragStart,
    onDragEnd,
    reviewMode,
}) => {
    const [isOverPool, setIsOverPool] = useState(false);
    const usedWords = Object.values(answers).filter(
        (val) => typeof val === "string" && val !== ""
    ) as string[];

    // Extract the Roman numeral prefix from a heading string e.g. "ii  An undisputed..." → "ii"
    const getRomanId = (heading: string) => {
        const match = heading.match(/^([ivxlc]+)\s+/i);
        return match ? match[1].toLowerCase() : heading;
    };

    const handleWordDragStart = (wordId: string, e: React.DragEvent<HTMLElement>) => {
        const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
        ghost.style.position = "absolute";
        ghost.style.top = "-9999px";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
        requestAnimationFrame(() => document.body.removeChild(ghost));
        onDragStart(wordId);
    };

    const handleDragEnd = () => {
        onDragEnd();
    };

    const handleDropOnPool = () => {
        if (!draggingWordId) return;

        const wordToMove = draggingWordId;

        // Find if this word was placed in a zone and remove it
        const findingQId = Object.keys(answers).find(
            (qId) => answers[qId] === wordToMove
        );
        if (findingQId) {
            onAnswerChange(findingQId, "");
        } else {
            // If it wasn't in a zone, just clear the drag state manually
            onDragEnd();
        }
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
        <div className={`matching-heading${reviewMode ? " matching-heading--review" : ""}`}>
            {questionRange && (
                <h4 className="matching-heading__range">{questionRange}</h4>
            )}
            <p className="matching-heading__instruction">{formatInstruction(instruction)}</p>

            <div className="matching-heading__content">
                <div className="matching-heading__list-box">
                    <h3 className="matching-heading__list-title">List of Headings</h3>
                    <div 
                        className={`matching-heading__pool options-pool ${isOverPool ? "options-pool--drag-over" : ""}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsOverPool(true);
                            e.dataTransfer.dropEffect = "move";
                        }}
                        onDragLeave={() => setIsOverPool(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsOverPool(false);
                            handleDropOnPool();
                        }}
                    >
                        <div className="matching-heading__pool-items options-pool__items">
                            {data.headings
                                .filter((heading) => !reviewMode || !usedWords.includes(getRomanId(heading)))
                                .map((heading, index) => {
                                const romanId = getRomanId(heading);
                                const displayText = heading.replace(/^[ivxlc]+\s+/i, "").trim();
                                return (
                                    <div key={index} className="matching-heading__item-wrapper">
                                        <span className="matching-heading__roman">
                                            {getRomanNumeral(index + 1)}
                                        </span>
                                        <DraggableWord
                                            id={romanId}
                                            text={displayText}
                                            disabled={usedWords.includes(romanId)}
                                            isDragging={draggingWordId === romanId}
                                            onDragStart={handleWordDragStart}
                                            onDragEnd={handleDragEnd}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for Roman Numerals
function getRomanNumeral(num: number): string {
    const romanMap: [number, string][] = [
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    let result = "";
    for (const [val, symbol] of romanMap) {
        while (num >= val) {
            result += symbol;
            num -= val;
        }
    }
    return result;
}

export default MatchingHeading;
