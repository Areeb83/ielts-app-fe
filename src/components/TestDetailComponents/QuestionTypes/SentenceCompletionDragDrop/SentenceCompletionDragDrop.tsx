import React, { useState } from "react";
import type { SentenceCompletionDragDropData, ContentPart, AnswerMap } from "../../../../types/question";
import { DraggableWord } from "../FlowChartDragDrop/DraggableWord";
import { DropZone } from "../FlowChartDragDrop/DropZone";
import { useAutoScroll } from "../../../../hooks";
import "./SentenceCompletionDragDrop.css";

interface SentenceCompletionDragDropProps {
    instruction: string;
    questionRange?: string;
    data: SentenceCompletionDragDropData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    testType?: "listening" | "reading";
    reviewMode?: boolean;
    activeQuestion?: number;
}

const SentenceCompletionDragDrop: React.FC<SentenceCompletionDragDropProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    testType,
    reviewMode,
    activeQuestion,
}) => {
    const [draggingWordId, setDraggingWordId] = useState<string | null>(null);
    const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null);
    const [dragOverPool, setDragOverPool] = useState(false);

    const usedWords = Object.values(answers).filter(
        (val) => typeof val === "string" && val !== ""
    ) as string[]; // contains placed letters e.g. ["A", "C"]

    useAutoScroll(!!draggingWordId, { hotZoneTop: testType === "reading" ? 150 : 90 });

    const handleWordDragStart = (wordId: string, e: React.DragEvent<HTMLElement>) => {
        const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
        ghost.style.position = "absolute";
        ghost.style.top = "-9999px";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
        requestAnimationFrame(() => document.body.removeChild(ghost));
        setDraggingWordId(wordId);
    };

    const handleDragEnd = () => {
        setDraggingWordId(null);
        setDragOverZoneId(null);
        setDragOverPool(false);
    };

    const handleDropOnZone = (targetZoneId: string) => {
        if (!draggingWordId) return;
        const oldQId = Object.keys(answers).find((qId) => answers[qId] === draggingWordId);
        if (oldQId && oldQId !== targetZoneId) {
            onAnswerChange(oldQId, "");
        }
        onAnswerChange(targetZoneId, draggingWordId);
        setDragOverZoneId(null);
        setDraggingWordId(null);
    };

    const handleDropOnPool = () => {
        if (!draggingWordId) return;
        const findingQId = Object.keys(answers).find((qId) => answers[qId] === draggingWordId);
        if (findingQId) {
            onAnswerChange(findingQId, "");
        }
        setDragOverPool(false);
        setDraggingWordId(null);
    };

    // Get display text for a placed letter (e.g. "A" → "be discouraged by difficulties.")
    const getOptionText = (letter: string) => {
        const opt = data.options.find((o) => o.letter === letter);
        return opt ? opt.text : letter;
    };

    const renderContentPart = (part: ContentPart, idx: number) => {
        if (typeof part === "string") {
            return <span key={idx}>{part}</span>;
        }
        if (part.type === "bold") {
            return <strong key={idx}>{part.text}</strong>;
        }
        if (part.type === "dropzone") {
            const placedLetter = answers[part.id] as string | undefined;
            return (
                <DropZone
                    key={part.id}
                    id={part.id}
                    isOver={dragOverZoneId === part.id}
                    isActive={activeQuestion === Number(part.id)}
                    onDragOver={() => {
                        setDragOverZoneId(part.id);
                        setDragOverPool(false);
                    }}
                    onDragLeave={() => setDragOverZoneId(null)}
                    onDrop={() => handleDropOnZone(part.id)}
                >
                    {placedLetter && placedLetter !== "" ? (
                        <DraggableWord
                            id={placedLetter}
                            text={getOptionText(placedLetter)}
                            isDragging={draggingWordId === placedLetter}
                            onDragStart={handleWordDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ) : null}
                </DropZone>
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
        <div className={`sc-dnd${reviewMode ? " sc-dnd--review" : ""}`}>
            {questionRange && <h4 className="sc-dnd__range">{questionRange}</h4>}
            <p className="sc-dnd__instruction">{formatInstruction(instruction)}</p>

            {data.title && <h3 className="sc-dnd__title">{data.title}</h3>}

            {/* Sentences */}
            <div className="sc-dnd__sentences">
                {data.sentences.map((sentence, idx) => (
                    <div key={idx} className="sc-dnd__sentence-row">
                        {sentence.questionNumber != null && (
                            <span className="sc-dnd__question-number">{sentence.questionNumber}</span>
                        )}
                        <div className="sc-dnd__sentence-content">
                            {sentence.content.map((part, pIdx) => renderContentPart(part, pIdx))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Options Pool — below all sentences */}
            <div
                className={`sc-dnd__pool${dragOverPool ? " sc-dnd__pool--over" : ""}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverPool(true);
                    setDragOverZoneId(null);
                }}
                onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverPool(false);
                    }
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    handleDropOnPool();
                }}
            >
                {data.options
                    .filter((opt) => !reviewMode || !usedWords.includes(opt.letter))
                    .map((opt) => (
                    <DraggableWord
                        key={opt.letter}
                        id={opt.letter}
                        text={opt.text}
                        disabled={usedWords.includes(opt.letter)}
                        isDragging={draggingWordId === opt.letter}
                        onDragStart={handleWordDragStart}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
        </div>
    );
};

export default SentenceCompletionDragDrop;
