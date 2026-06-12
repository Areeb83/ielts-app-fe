import React from "react";
import type { AnswerMap, TableCell, TableCompletionData } from "../../../../types/question";
import "./TableCompletion.css";

interface TableCompletionProps {
    instruction: string;
    questionRange: string;
    data: TableCompletionData;
    answers: AnswerMap;
    onAnswerChange: (questionId: string, value: string) => void;
    reviewMode?: boolean;
    questionStatus?: Record<string, 'correct' | 'wrong'>;
}

/**
 * A helper component that renders an input that grows as the user types.
 * It uses a hidden span to measure the text width.
 */
const AutoGrowingInput: React.FC<{
    id: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    status?: 'correct' | 'wrong';
}> = ({ id, value, onChange, disabled, status }) => {
    const [width, setWidth] = React.useState<number | string>("120px");
    const spanRef = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        if (spanRef.current) {
            // Measure the span width. Add some extra space for the cursor/comfort.
            const measuredWidth = spanRef.current.offsetWidth;
            // Respect a min-width of 120px for table cells, but allow it to grow.
            setWidth(Math.max(120, measuredWidth + 10));
        }
    }, [value]);

    return (
        <div className="table-completion__input-wrapper">
            {/* The hidden measurer must have the same font as the input */}
            <span ref={spanRef} className="table-completion__hidden-measurer">
                {value || " "}
            </span>
            <input
                type="text"
                className={`table-completion__input${disabled ? " table-completion__input--review" : ""}${status === "correct" ? " table-completion__input--correct" : ""}${status === "wrong" ? " table-completion__input--wrong" : ""}`}
                style={{ width: typeof width === 'number' ? `${width}px` : width }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                disabled={disabled}
            />
            <span className="table-completion__fake-placeholder">{id}</span>
        </div>
    );
};

const TableCompletion: React.FC<TableCompletionProps> = ({
    instruction,
    questionRange,
    data,
    answers,
    onAnswerChange,
    reviewMode,
    questionStatus,
}) => {
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

    const renderContentPart = (part: any, index: number) => {
        if (typeof part === "string") {
            return <span key={index}>{part}</span>;
        }

        if (part.type === "bold") {
            return <strong key={index}>{part.text}</strong>;
        }

        if (part.type === "br") {
            return <div key={index} style={{ height: "10px" }} />;
        }

        if (part.type === "input") {
            const value = answers[part.id] as string || "";
            return (
                <AutoGrowingInput
                    key={part.id}
                    id={part.id}
                    value={value}
                    onChange={(val) => onAnswerChange(part.id, val)}
                    disabled={reviewMode}
                    status={questionStatus?.[part.id]}
                />
            );
        }

        return null;
    };

    const renderCell = (cell: TableCell, cellIndex: number) => {
        // Static text cell
        if (typeof cell === "string") {
            return (
                <td key={cellIndex} className="table-completion__cell">
                    {cell}
                </td>
            );
        }

        // Mixed content (array of parts)
        if (Array.isArray(cell)) {
            return (
                <td key={cellIndex} className="table-completion__cell table-completion__cell--mixed">
                    {cell.map((part, idx) => renderContentPart(part, idx))}
                </td>
            );
        }

        // Legacy: Single interactive input cell
        const value = (answers[cell.id] as string) || "";
        return (
            <td key={cell.id} className="table-completion__cell table-completion__cell--input">
                <AutoGrowingInput
                    id={cell.id}
                    value={value}
                    onChange={(val) => onAnswerChange(cell.id, val)}
                    disabled={reviewMode}
                    status={questionStatus?.[cell.id]}
                />
            </td>
        );
    };

    return (
        <div className="table-completion-container">
            {questionRange && (
                <h4 className="table-completion__range">{questionRange}</h4>
            )}
            <p className="table-completion__instruction">{formatInstruction(instruction)}</p>

            <div className="table-completion__wrapper">
                {data.title && (
                    <h3 className="table-completion__title">{data.title}</h3>
                )}
                <table className="table-completion__table">
                    <thead>
                        <tr>
                            {data.headers.map((header, idx) => (
                                <th key={idx} className="table-completion__header">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="table-completion__row">
                                {row.map((cell, cellIdx) => renderCell(cell, cellIdx))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableCompletion;
