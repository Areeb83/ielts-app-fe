import React from "react";
import type { QuestionGroup, AnswerMap } from "../../../types/question";
import FlowChartDragDrop from "./FlowChartDragDrop/FlowChartDragDrop";
import SentenceCompletion from "./SentenceCompletion/SentenceCompletion";
import SummaryCompletion from "./SummaryCompletion/SummaryCompletion";
import MultipleChoice from "./MultipleChoice/MultipleChoice";
import TableCompletion from "./TableCompletion/TableCompletion";
import MapDiagramLabelling from "./MapDiagramLabelling/MapDiagramLabelling";
import MatchingFeature from "./MatchingFeature/MatchingFeature";
import MatchingHeading from "./MatchingHeading/MatchingHeading";
import DiagramLabelling from "./DiagramLabelling/DiagramLabelling";
import SentenceCompletionDragDrop from "./SentenceCompletionDragDrop/SentenceCompletionDragDrop";
import ParagraphMatching from "./ParagraphMatching/ParagraphMatching";
import SummaryCompletionDragDrop from "./SummaryCompletionDragDrop/SummaryCompletionDragDrop";

interface QuestionRendererProps {
    group: QuestionGroup;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string | string[]) => void;
    testType?: 'listening' | 'reading';
    reviewMode?: boolean;
    activeQuestion?: number;
    questionStatus?: Record<string, 'correct' | 'wrong'>;
    // Shared drag state for cross-pane DnD (Matching Heading)
    draggingWordId?: string | null;
    onDragStart?: (wordId: string) => void;
    onDragEnd?: () => void;
}

/**
 * The "Switcher" component.
 * Maps a QuestionGroup's `type` to the correct renderer.
 * Add new question types here as you build them.
 */
const QuestionRenderer: React.FC<QuestionRendererProps> = ({ group, answers, onAnswerChange, testType, reviewMode, activeQuestion, questionStatus, draggingWordId, onDragStart, onDragEnd }) => {
    const questionRange = group.hideRange
        ? ""
        : group.startQuestion === group.endQuestion
            ? `Question ${group.startQuestion}`
            : `Questions ${group.startQuestion}–${group.endQuestion}`;

    switch (group.type) {
        case "FLOW_CHART_DRAG_DROP":
            // @ts-ignore
            return (
                <FlowChartDragDrop
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore - Note: TS cast is fine since we know the mapping type
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    testType={testType}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "SENTENCE_COMPLETION":
            // @ts-ignore
            return (
                <SentenceCompletion
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    questionStatus={questionStatus}
                />
            );

        case "SENTENCE_COMPLETION_DRAG_DROP":
            return (
                <SentenceCompletionDragDrop
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    testType={testType}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "SUMMARY_COMPLETION":
            return (
                <SummaryCompletion
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    questionStatus={questionStatus}
                />
            );

        case "MULTIPLE_CHOICE":
        case "IDENTIFICATION":
            return (
                <MultipleChoice
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "TABLE_COMPLETION":
            return (
                <TableCompletion
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    questionStatus={questionStatus}
                />
            );

        case "DIAGRAM_LABELLING":
            return (
                <DiagramLabelling
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                    questionStatus={questionStatus}
                />
            );

        case "MAP_DIAGRAM_LABELLING":
            return (
                <MapDiagramLabelling
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "MATCHING_FEATURE":
            return (
                <MatchingFeature
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    optionsBelow={testType === 'reading'}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "SUMMARY_COMPLETION_DRAG_DROP":
            return (
                <SummaryCompletionDragDrop
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    testType={testType}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "PARAGRAPH_MATCHING":
            return (
                <ParagraphMatching
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    reviewMode={reviewMode}
                    activeQuestion={activeQuestion}
                />
            );

        case "MATCHING_HEADING":
            return (
                <MatchingHeading
                    instruction={group.instruction}
                    questionRange={questionRange}
                    // @ts-ignore
                    data={group.data}
                    answers={answers}
                    // @ts-ignore
                    onAnswerChange={onAnswerChange}
                    draggingWordId={draggingWordId}
                    onDragStart={onDragStart ?? (() => { })}
                    onDragEnd={onDragEnd ?? (() => { })}
                    reviewMode={reviewMode}
                />
            );

        default:
            return (
                <div style={{ padding: 20, background: "#fff3cd", borderRadius: 8, border: "1px solid #ffc107" }}>
                    <p><strong>⚠️ Unknown question type:</strong> <code>{group.type}</code></p>
                    <p>Questions {group.startQuestion}–{group.endQuestion}</p>
                </div>
            );
    }
};

export default QuestionRenderer;
