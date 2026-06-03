import React from "react";
import type { PassageData, AnswerMap } from "../../../types/question";
import { DropZone } from "../QuestionTypes/FlowChartDragDrop/DropZone";
import { DraggableWord } from "../QuestionTypes/FlowChartDragDrop/DraggableWord";
import "./ReadingPassage.css";

interface ReadingPassageProps {
    data: PassageData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    draggingWordId?: string | null;
    onDragStart: (wordId: string) => void;
    onDragEnd: () => void;
}

const ReadingPassage: React.FC<ReadingPassageProps> = ({
    data,
    answers,
    onAnswerChange,
    draggingWordId,
    onDragStart,
    onDragEnd,
}) => {
    const [dragOverZoneId, setDragOverZoneId] = React.useState<string | null>(null);

    const handleDropOnZone = (targetZoneId: string) => {
        if (!draggingWordId) return;

        const wordToMove = draggingWordId;

        // 1. Remove from old zone if it was placed somewhere else
        const oldQId = Object.keys(answers).find(
            (qId) => answers[qId] === wordToMove
        );
        if (oldQId && oldQId !== targetZoneId) {
            onAnswerChange(oldQId, "");
        }

        // 2. Place into the target zone (this will also clear draggingWordId via parent handler)
        onAnswerChange(targetZoneId, wordToMove);
        setDragOverZoneId(null);
    };

    return (
        <div className="reading-passage-container">
            <h2 className="passage-title">{data.title}</h2>
            <div className="passage-body">
                {data.sections.map((section, idx) => (
                    <div key={idx} className="passage-section">
                        <div className="passage-section__header">
                            {section.questionId && (
                                <div className="passage-section__dropzone-wrapper">
                                    <DropZone
                                        id={section.questionId}
                                        isOver={dragOverZoneId === section.questionId}
                                        onDragOver={() => setDragOverZoneId(section.questionId!)}
                                        onDragLeave={() => setDragOverZoneId(null)}
                                        onDrop={() => handleDropOnZone(section.questionId!)}
                                    >
                                        {answers[section.questionId] ? (
                                            <DraggableWord
                                                key={`${section.questionId}-${answers[section.questionId]}`}
                                                id={answers[section.questionId] as string}
                                                text={answers[section.questionId] as string}
                                                isDragging={draggingWordId === answers[section.questionId]}
                                                onDragStart={(id, e) => {
                                                    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
                                                    ghost.style.position = "absolute";
                                                    ghost.style.top = "-9999px";
                                                    document.body.appendChild(ghost);
                                                    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
                                                    requestAnimationFrame(() => document.body.removeChild(ghost));
                                                    onDragStart(id);
                                                }}
                                                onDragEnd={onDragEnd}
                                            />
                                        ) : null}
                                    </DropZone>
                                </div>
                            )}
                        </div>
                        <p className="passage-paragraph">{section.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadingPassage;
