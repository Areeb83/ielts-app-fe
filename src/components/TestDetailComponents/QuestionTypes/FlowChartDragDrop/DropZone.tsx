import React from "react";

interface DropZoneProps {
    id: string;
    children?: React.ReactNode;
    isOver?: boolean;
    isActive?: boolean;
    onDragOver?: (e: React.DragEvent<HTMLSpanElement>) => void;
    onDragLeave?: (e: React.DragEvent<HTMLSpanElement>) => void;
    onDrop?: (e: React.DragEvent<HTMLSpanElement>) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
    id,
    children,
    isOver,
    isActive,
    onDragOver,
    onDragLeave,
    onDrop,
}) => {
    const hasContent = React.Children.count(children) > 0;
    const filledClass = hasContent ? "dropzone--filled" : "";
    const overClass = isOver ? "dropzone--over" : "";
    const activeClass = isActive ? "dropzone--active" : "";

    const handleDragOver = (e: React.DragEvent<HTMLSpanElement>) => {
        e.preventDefault(); // CRITICAL: allows the drop to happen
        e.dataTransfer.dropEffect = "move";
        onDragOver?.(e);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLSpanElement>) => {
        // Only clear if actually leaving this element (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onDragLeave?.(e);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop?.(e);
    };

    return (
        <span
            className={`dropzone ${filledClass} ${overClass} ${activeClass}`}
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
