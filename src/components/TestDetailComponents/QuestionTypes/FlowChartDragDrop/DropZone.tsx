import { type FC, type ReactNode, Children, type DragEvent } from "react";

interface DropZoneProps {
    id: string;
    children?: ReactNode;
    isOver?: boolean;
    isActive?: boolean;
    status?: 'correct' | 'wrong';
    onDragOver?: (e: DragEvent<HTMLSpanElement>) => void;
    onDragLeave?: (e: DragEvent<HTMLSpanElement>) => void;
    onDrop?: (e: DragEvent<HTMLSpanElement>) => void;
}

export const DropZone: FC<DropZoneProps> = ({
    id,
    children,
    isOver,
    isActive,
    status,
    onDragOver,
    onDragLeave,
    onDrop,
}) => {
    const hasContent = Children.count(children) > 0;
    const filledClass = hasContent ? "dropzone--filled" : "";
    const overClass = isOver ? "dropzone--over" : "";
    const activeClass = isActive ? "dropzone--active" : "";
    const statusClass = status === 'correct' ? 'dropzone--correct' : status === 'wrong' ? 'dropzone--wrong' : '';

    const handleDragOver = (e: DragEvent<HTMLSpanElement>) => {
        e.preventDefault(); // CRITICAL: allows the drop to happen
        e.dataTransfer.dropEffect = "move";
        onDragOver?.(e);
    };

    const handleDragLeave = (e: DragEvent<HTMLSpanElement>) => {
        // Only clear if actually leaving this element (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onDragLeave?.(e);
        }
    };

    const handleDrop = (e: DragEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop?.(e);
    };

    return (
        <span
            className={`dropzone ${filledClass} ${overClass} ${activeClass} ${statusClass}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {hasContent ? (
                children
            ) : (
                <span className="dropzone__placeholder">{id}</span>
            )}
        </span>
    );
};
