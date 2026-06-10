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
    const r = document.createRange();
    r.selectNodeContents(container);
    r.setEnd(targetNode, offsetInNode);
    return r.toString().length;
}

/**
 * Splits `text` into plain and highlighted segments.
 * Supports overlapping highlights — the most recently added highlight
 * (last in array) "wins" the groupId for any overlapping region, so
 * clicking Remove on it peels off only the top layer.
 */
function buildSegments(text: string, highlights: Highlight[]): Segment[] {
    if (highlights.length === 0) {
        return [{ text, highlighted: false }];
    }

    // Collect all boundary points
    const boundaries = new Set<number>();
    boundaries.add(0);
    boundaries.add(text.length);
    for (const h of highlights) {
        boundaries.add(Math.max(0, h.start));
        boundaries.add(Math.min(text.length, h.end));
    }

    const sorted = [...boundaries].sort((a, b) => a - b);
    const raw: Segment[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
        const segStart = sorted[i];
        const segEnd = sorted[i + 1];
        if (segStart === segEnd) continue;

        // Find all highlights covering this segment; pick the last one (most recent)
        const covering = highlights.filter(h => h.start <= segStart && h.end >= segEnd);

        if (covering.length > 0) {
            const topmost = covering[covering.length - 1];
            raw.push({ text: text.slice(segStart, segEnd), highlighted: true, groupId: topmost.groupId });
        } else {
            raw.push({ text: text.slice(segStart, segEnd), highlighted: false });
        }
    }

    // Merge adjacent segments with the same state
    const merged: Segment[] = [];
    for (const seg of raw) {
        const last = merged[merged.length - 1];
        if (last && last.highlighted === seg.highlighted && last.groupId === seg.groupId) {
            last.text += seg.text;
        } else {
            merged.push({ ...seg });
        }
    }

    return merged;
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
    const pendingButtonPosRef = useRef<{ x: number; y: number } | null>(null);

    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const container = containerRef.current;
        if (!container) return;

        const startInside = container.contains(range.startContainer);
        const endInside = container.contains(range.endContainer);

        if (!startInside) {
            // This instance doesn't show the button, but if it's within the
            // selection range it should contribute its full range to the shared pending list
            const fullyInside = range.intersectsNode(container);
            if (!fullyInside && !endInside) return;

            const start = 0;
            const end = endInside
                ? getAbsoluteOffset(container, range.endContainer, range.endOffset)
                : text.length;

            if (end > start) {
                pendingHighlightsRef.current.push({ paragraphIndex, start, end });
            }
            return;
        }

        // This instance starts the selection — it owns the button
        const start = getAbsoluteOffset(container, range.startContainer, range.startOffset);
        const end = endInside
            ? getAbsoluteOffset(container, range.endContainer, range.endOffset)
            : text.length;

        if (end <= start) return;

        const rects = range.getClientRects();
        if (!rects.length) return;

        // Clear stale pending, push the full selected range for this paragraph.
        // addHighlight will clip any overlapping existing highlights.
        pendingHighlightsRef.current = [];
        pendingHighlightsRef.current.push({ paragraphIndex, start, end });

        // Store button position — show after all handlers have fired so other
        // instances (paragraphs below) can also push their gaps into pending
        pendingButtonPosRef.current = {
            x: rects[0].left + rects[0].width / 2,
            y: rects[0].top - 4,
        };

        setTimeout(() => {
            if (pendingHighlightsRef.current.length > 0 && pendingButtonPosRef.current) {
                const sel = window.getSelection();
                if (sel && sel.rangeCount && !sel.isCollapsed) {
                    // Paint a fake selection using the CSS Custom Highlight API so
                    // the text still looks selected, then clear the native selection
                    // so Chrome has nothing to attach its "Search" bubble to.
                    const savedRange = sel.getRangeAt(0).cloneRange();
                    if ('highlights' in CSS) {
                        CSS.highlights.set('pending-highlight', new Highlight(savedRange));
                    }
                    sel.removeAllRanges();
                }
                setButtonPos(pendingButtonPosRef.current);
            }
            pendingButtonPosRef.current = null;
        }, 0);
    }, [text, paragraphIndex, pendingHighlightsRef]);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    const clearPendingHighlight = useCallback(() => {
        if ('highlights' in CSS) CSS.highlights.delete('pending-highlight');
    }, []);

    const handleConfirm = useCallback(() => {
        clearPendingHighlight();
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
    }, [mode, onAdd, onRemove, pendingHighlightsRef, clearPendingHighlight]);

    const handleDismiss = useCallback(() => {
        clearPendingHighlight();
        pendingRangeRef.current = null;
        pendingRemoveIdRef.current = null;
        pendingHighlightsRef.current = [];
        setButtonPos(null);
        setMode('highlight');
    }, [pendingHighlightsRef, clearPendingHighlight]);

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
