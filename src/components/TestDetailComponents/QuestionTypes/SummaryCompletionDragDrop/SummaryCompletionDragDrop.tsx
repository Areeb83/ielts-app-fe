import React, { useState } from "react";
import type { SummaryCompletionDragDropData, ContentPart, AnswerMap } from "../../../../types/question";
import { DraggableWord } from "../FlowChartDragDrop/DraggableWord";
import { DropZone } from "../FlowChartDragDrop/DropZone";
import { useAutoScroll } from "../../../../hooks";
import "./SummaryCompletionDragDrop.css";

interface SummaryCompletionDragDropProps {
    instruction: string;
    questionRange?: string;
    data: SummaryCompletionDragDropData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    testType?: "listening" | "reading";
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

const SummaryCompletionDragDrop: React.FC<SummaryCompletionDragDropProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    testType,
    reviewMode,
}) => {
    const [draggingWordId, setDraggingWordId] = useState<string | null>(null);
    const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null);
    const [dragOverPool, setDragOverPool] = useState(false);

    const usedLetters = Object.values(answers).filter(
        (val) => typeof val === "string" && val !== ""
    ) as string[];

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

    // Get display text for a placed letter (e.g. "A" → "interpretation")
    const getOptionDisplay = (letter: string) => {
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
                            text={getOptionDisplay(placedLetter)}
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

    return (
        <div className={`sum-dnd${reviewMode ? " sum-dnd--review" : ""}`}>
            {questionRange && <h4 className="sum-dnd__range">{questionRange}</h4>}
            <p className="sum-dnd__instruction">{formatInstruction(instruction)}</p>

            {data.title && <h3 className="sum-dnd__title">{data.title}</h3>}

            {/* Paragraph with inline drop zones */}
            <div className="sum-dnd__paragraph">
                {data.content.map((part, idx) => renderContentPart(part, idx))}
            </div>

            {/* Options Pool */}
            <div
                className={`sum-dnd__pool${dragOverPool ? " sum-dnd__pool--over" : ""}`}
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
                    .filter((opt) => !reviewMode || !usedLetters.includes(opt.letter))
                    .map((opt) => (
                    <DraggableWord
                        key={opt.letter}
                        id={opt.letter}
                        text={opt.text}
                        disabled={usedLetters.includes(opt.letter)}
                        isDragging={draggingWordId === opt.letter}
                        onDragStart={handleWordDragStart}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
        </div>
    );
};

export default SummaryCompletionDragDrop;
