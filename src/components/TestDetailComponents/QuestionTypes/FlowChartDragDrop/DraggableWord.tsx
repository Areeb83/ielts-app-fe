import { type FC, type DragEvent } from "react";

interface DraggableWordProps {
    id: string;
    text: string;
    disabled?: boolean;
    isDragging?: boolean;
    onDragStart?: (wordId: string, e: DragEvent<HTMLDivElement>) => void;
    onDragEnd?: () => void;
}

export const DraggableWord: FC<DraggableWordProps> = ({
    id,
    text,
    disabled,
    isDragging,
    onDragStart,
    onDragEnd,
}) => {
    const classNames = [
        "draggable-word",
        isDragging ? "draggable-word--dragging" : "",
        disabled ? "draggable-word--disabled" : "",
    ]
        .filter(Boolean)
        .join(" ");

    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        // Set minimal dataTransfer so the browser shows a drag ghost
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        onDragStart?.(id, e);
    };

    const handleDragEnd = () => {
        onDragEnd?.();
    };

    return (
        <div
            draggable={!disabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={classNames}
        >
            {text}
        </div>
    );
};
