import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface FloatingButtonProps {
    x: number;
    y: number;
    label: string;
    onConfirm: () => void;
    onDismiss: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ x, y, label, onConfirm, onDismiss }) => {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onDismiss();
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [onDismiss]);

    return createPortal(
        <button
            ref={ref}
            className="highlight-floating-btn"
            style={{ left: x, top: y }}
            onMouseDown={(e) => e.preventDefault()} // prevent losing the text selection
            onClick={onConfirm}
        >
            {label}
        </button>,
        document.body
    );
};

export default FloatingButton;
