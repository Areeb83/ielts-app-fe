import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { Highlight } from './useHighlights';
import FloatingButton from './FloatingButton';
import './Highlightable.css';

interface Segment {
    text: string;
    highlighted: boolean;
    groupId?: string;
}

/**
 * Walks the DOM tree inside `container` to compute the absolute character
 * offset of `offsetInNode` within `targetNode`.
 */
function getAbsoluteOffset(container: Element, targetNode: Node, offsetInNode: number): number {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let total = 0;
    let node: Node | null;
    while ((node = walker.nextNode())) {
        if (node === targetNode) {
            return total + offsetInNode;
        }
        total += (node as Text).length;
    }
    return total;
}

/**
 * Splits `text` into plain and highlighted segments based on the highlights array.
 */
function buildSegments(text: string, highlights: Highlight[]): Segment[] {
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    const segments: Segment[] = [];
    let cursor = 0;

    for (const h of sorted) {
        if (h.start > cursor) {
            segments.push({ text: text.slice(cursor, h.start), highlighted: false });
        }
        const start = Math.max(h.start, cursor);
        if (h.end > start) {
            segments.push({ text: text.slice(start, h.end), highlighted: true, groupId: h.groupId });
        }
        cursor = Math.max(cursor, h.end);
    }

    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor), highlighted: false });
    }

    return segments;
}

/**
 * Returns the gaps (non-highlighted ranges) within [start, end]
 * given a list of existing highlights for this paragraph.
 */
function getUnhighlightedGaps(
    start: number,
    end: number,
    existing: Highlight[]
): { start: number; end: number }[] {
    const sorted = existing
        .filter((h) => h.start < end && h.end > start)
        .sort((a, b) => a.start - b.start);

    const gaps: { start: number; end: number }[] = [];
    let cursor = start;

    for (const h of sorted) {
        const gapEnd = Math.min(h.start, end);
        if (gapEnd > cursor) gaps.push({ start: cursor, end: gapEnd });
        cursor = Math.max(cursor, h.end);
    }

    if (cursor < end) gaps.push({ start: cursor, end });
    return gaps;
}

interface HighlightableProps {
    text: string;
    paragraphIndex: number;
    highlights: Highlight[];
    onAdd: (h: Omit<Highlight, 'id'>) => void;
    onRemove: (groupId: string) => void;
    pendingHighlightsRef: React.MutableRefObject<{ paragraphIndex: number; start: number; end: number }[]>;
}

const Highlightable: React.FC<HighlightableProps> = ({
    text,
    paragraphIndex,
    highlights,
    onAdd,
    onRemove,
    pendingHighlightsRef,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
    const [mode, setMode] = useState<'highlight' | 'remove'>('highlight');
    const pendingRangeRef = useRef<{ start: number; end: number } | null>(null);
    const pendingRemoveIdRef = useRef<string | null>(null);

    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const container = containerRef.current;
        if (!container) return;

        const startInside = container.contains(range.startContainer);
        const endInside = container.contains(range.endContainer);
        const myHighlights = highlights.filter(h => h.paragraphIndex === paragraphIndex);

        if (!startInside) {
            // This instance doesn't show the button, but if it's within the
            // selection range it should contribute its gaps to the shared pending list
            const fullyInside = range.intersectsNode(container);
            if (!fullyInside && !endInside) return;

            const start = 0;
            const end = endInside
                ? getAbsoluteOffset(container, range.endContainer, range.endOffset)
                : text.length;

            const gaps = getUnhighlightedGaps(start, end, myHighlights);
            gaps.forEach(g => pendingHighlightsRef.current.push({ paragraphIndex, ...g }));
            return;
        }

        // This instance starts the selection — it owns the button
        const start = getAbsoluteOffset(container, range.startContainer, range.startOffset);
        const end = endInside
            ? getAbsoluteOffset(container, range.endContainer, range.endOffset)
            : text.length;

        if (end <= start) return;

        const gaps = getUnhighlightedGaps(start, end, myHighlights);
        if (!gaps.length) return;

        // Clear stale pending from previous selection, then add ours
        pendingHighlightsRef.current = [];
        gaps.forEach(g => pendingHighlightsRef.current.push({ paragraphIndex, ...g }));

        const rects = range.getClientRects();
        if (!rects.length) return;
        setButtonPos({
            x: rects[0].left + rects[0].width / 2,
            y: rects[0].top - 4,
        });
    }, [highlights, text, paragraphIndex, pendingHighlightsRef]);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    const handleConfirm = useCallback(() => {
        if (mode === 'remove') {
            if (pendingRemoveIdRef.current) {
                onRemove(pendingRemoveIdRef.current);
                pendingRemoveIdRef.current = null;
            }
        } else {
            // All highlights added in this action share the same groupId
            const groupId = crypto.randomUUID();
            pendingHighlightsRef.current.forEach(({ paragraphIndex: pIdx, start, end }) => {
                onAdd({ paragraphIndex: pIdx, start, end, groupId });
            });
            pendingHighlightsRef.current = [];
            window.getSelection()?.removeAllRanges();
        }
        setButtonPos(null);
        setMode('highlight');
    }, [mode, onAdd, onRemove, pendingHighlightsRef]);

    const handleDismiss = useCallback(() => {
        pendingRangeRef.current = null;
        pendingRemoveIdRef.current = null;
        pendingHighlightsRef.current = [];
        setButtonPos(null);
        setMode('highlight');
    }, [pendingHighlightsRef]);

    const segments = buildSegments(text, highlights);

    return (
        <>
            <span ref={containerRef} className="highlightable__container">
                {segments.map((seg, i) =>
                    seg.highlighted ? (
                        <mark
                            key={i}
                            className="highlightable__mark"
                            onClick={(e) => {
                                if (!seg.groupId) return;
                                pendingRemoveIdRef.current = seg.groupId;
                                setMode('remove');
                                const rect = (e.target as HTMLElement).getBoundingClientRect();
                                setButtonPos({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 4,
                                });
                            }}
                        >
                            {seg.text}
                        </mark>
                    ) : (
                        <span key={i}>{seg.text}</span>
                    )
                )}
            </span>
            {buttonPos && (
                <FloatingButton
                    x={buttonPos.x}
                    y={buttonPos.y}
                    label={mode === 'remove' ? 'Remove Highlight' : 'Highlight'}
                    onConfirm={handleConfirm}
                    onDismiss={handleDismiss}
                />
            )}
        </>
    );
};

export default Highlightable;
