import React, { useState } from "react";
import { ImArrowDown } from "react-icons/im";
import type { FlowChartDragDropData, ContentPart, AnswerMap } from "../../../../types/question";
import { DraggableWord } from "./DraggableWord";
import { DropZone } from "./DropZone";
import { useAutoScroll } from "../../../../hooks";
import "./FlowChartDragDrop.css";

interface FlowChartDragDropProps {
    instruction: string;
    questionRange?: string; // e.g., "Questions 1–5"
    data: FlowChartDragDropData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    testType?: 'listening' | 'reading';
    reviewMode?: boolean;
}

const FlowChartDragDrop: React.FC<FlowChartDragDropProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    testType,
    reviewMode,
}) => {
    // ─── Native DnD State (the "brain") ───
    const [draggingWordId, setDraggingWordId] = useState<string | null>(null);
    const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null);
    const [dragOverPool, setDragOverPool] = useState(false);

    const usedWords = Object.values(answers).filter(
        (val) => typeof val === "string" && val !== ""
    ) as string[];

    // Helpers to handle both plain-string and { letter, text } option formats
    const getOptId   = (opt: string | { letter: string; text: string }) =>
        typeof opt === "string" ? opt : opt.letter;
    const getOptText = (opt: string | { letter: string; text: string }) =>
        typeof opt === "string" ? opt : opt.text;

    useAutoScroll(!!draggingWordId, { hotZoneTop: testType === 'reading' ? 150 : 90 });

    // ─── Drag Start: set explicit ghost image so state update can be synchronous ───
    const handleWordDragStart = (wordId: string, e: React.DragEvent<HTMLElement>) => {
        const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
        ghost.style.position = "absolute";
        ghost.style.top = "-9999px";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
        requestAnimationFrame(() => document.body.removeChild(ghost));
        setDraggingWordId(wordId);
    };

    // ─── Drag End: clean up all state (drop or cancel) ───
    const handleDragEnd = () => {
        setDraggingWordId(null);
        setDragOverZoneId(null);
        setDragOverPool(false);
    };

    // ─── Drop on a DropZone (inside a step) ───
    const handleDropOnZone = (targetZoneId: string) => {
        if (!draggingWordId) return;

        // 1. Remove from old zone if it was placed somewhere
        const oldQId = Object.keys(answers).find(
            (qId) => answers[qId] === draggingWordId
        );
        if (oldQId && oldQId !== targetZoneId) {
            onAnswerChange(oldQId, "");
        }

        // 2. Place into the target zone
        onAnswerChange(targetZoneId, draggingWordId);

        // 3. Reset state
        setDragOverZoneId(null);
        setDraggingWordId(null); // Explicitly clear because unmount might prevent onDragEnd
    };

    // ─── Drop on Options Pool (return word to pool) ───
    const handleDropOnPool = () => {
        if (!draggingWordId) return;

        // Only return if it was placed in a zone (not pool → pool)
        const findingQId = Object.keys(answers).find(
            (qId) => answers[qId] === draggingWordId
        );
        if (findingQId) {
            onAnswerChange(findingQId, "");
        }

        setDragOverPool(false);
        setDraggingWordId(null); // Explicitly clear because unmount might prevent onDragEnd
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
        <div className={`flow-chart-drag-drop${reviewMode ? " flow-chart-drag-drop--review" : ""}`}>
            {questionRange && (
                <h4 className="flow-chart-drag-drop__range">{questionRange}</h4>
            )}
            <p className="flow-chart-drag-drop__instruction">{formatInstruction(instruction)}</p>

            {data.title && (
                <h3 className="flow-chart-drag-drop__title">{data.title}</h3>
            )}

            <div className="flow-chart-drag-drop__content">
                {/* Flow Chart Steps (LEFT) */}
                <div className="flow-chart__steps">
                    {data.steps.map((step, index) => (
                        <div key={index} className="flow-chart__step-wrapper">
                            <div className="flow-chart__step">
                                <div className="flow-chart__step-content">
                                    {typeof step.content === "string" ? (
                                        <span>{step.content}</span>
                                    ) : (
                                        step.content.map(
                                            (part: ContentPart, idx: number) => {
                                                if (typeof part === "string") {
                                                    return <span key={idx}>{part}</span>;
                                                }
                                                if (part.type === "dropzone") {
                                                    const placedWord = answers[part.id] as string | undefined;
                                                    return (
                                                        <DropZone
                                                            key={part.id}
                                                            id={part.id}
                                                            isOver={dragOverZoneId === part.id}
                                                            onDragOver={() => {
                                                                setDragOverZoneId(part.id);
                                                                setDragOverPool(false);
                                                            }}
                                                            onDragLeave={() => {
                                                                setDragOverZoneId(null);
                                                            }}
                                                            onDrop={() => handleDropOnZone(part.id)}
                                                        >
                                                            {placedWord && placedWord !== "" ? (
                                                                <DraggableWord
                                                                    id={placedWord}
                                                                    text={getOptText(data.options.find((o) => getOptId(o) === placedWord) ?? placedWord)}
                                                                    isDragging={draggingWordId === placedWord}
                                                                    onDragStart={handleWordDragStart}
                                                                    onDragEnd={handleDragEnd}
                                                                />
                                                            ) : null}
                                                        </DropZone>
                                                    );
                                                }
                                                return null;
                                            }
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Arrow: react-icons ImArrowDown */}
                            {index < data.steps.length - 1 && (
                                <div className="flow-chart__arrow">
                                    <ImArrowDown className="flow-chart__arrow-icon" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Options Pool (RIGHT) — acts as a drop zone to return words */}
                <div
                    className={`options-pool ${dragOverPool ? "options-pool--drag-over" : ""}`}
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
                    <div className="options-pool__items">
                        {data.options
                            .filter((opt) => !reviewMode || !usedWords.includes(getOptId(opt)))
                            .map((opt) => {
                            const id   = getOptId(opt);
                            const text = getOptText(opt);
                            return (
                                <DraggableWord
                                    key={id}
                                    id={id}
                                    text={text}
                                    disabled={usedWords.includes(id)}
                                    isDragging={draggingWordId === id}
                                    onDragStart={handleWordDragStart}
                                    onDragEnd={handleDragEnd}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowChartDragDrop;
