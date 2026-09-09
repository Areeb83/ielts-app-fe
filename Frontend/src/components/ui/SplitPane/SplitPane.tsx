import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { MoveHorizontal } from 'lucide-react';
import './SplitPane.css';

interface SplitPaneProps {
    leftPane: ReactNode;
    rightPane: ReactNode;
    initialLeftWidth?: number; // Initial width percentage (e.g., 50)
    minLeftWidth?: number;     // Minimum width percentage
    maxLeftWidth?: number;     // Maximum width percentage
}

const SplitPane: React.FC<SplitPaneProps> = ({
    leftPane,
    rightPane,
    initialLeftWidth = 50,
    minLeftWidth = 20,
    maxLeftWidth = 80,
}) => {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent text selection during drag
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            // Calculate new width as a percentage of the container's width
            let newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp width between min and max bounds
            if (newLeftWidth < minLeftWidth) newLeftWidth = minLeftWidth;
            if (newLeftWidth > maxLeftWidth) newLeftWidth = maxLeftWidth;

            setLeftWidth(newLeftWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minLeftWidth, maxLeftWidth]);

    return (
        <div 
            className="split-pane-container" 
            ref={containerRef}
            style={{ cursor: isDragging ? 'col-resize' : 'default' }}
        >
            <div 
                className="split-pane-left" 
                style={{ width: `${leftWidth}%` }}
            >
                {leftPane}
            </div>
            
            <div 
                className={`split-pane-divider ${isDragging ? 'dragging' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="divider-grabber">
                    <MoveHorizontal size={14} className="grabber-icon" />
                </div>
            </div>
            
            <div 
                className="split-pane-right" 
                style={{ width: `${100 - leftWidth}%` }}
            >
                {rightPane}
            </div>
        </div>
    );
};

export default SplitPane;
