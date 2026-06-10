import React, { useRef, useState, useCallback, useEffect } from 'react';
import FloatingButton from './FloatingButton';
import './Highlightable.css';

export interface ContainerHighlight {
    id: string;
    groupId: string;
    start: number;
    end: number;
}

/** Absolute character offset of a node+offset within a container's text content. */
function getTextOffset(container: Element, node: Node, offset: number): number {
    const r = document.createRange();
    r.selectNodeContents(container);
    r.setEnd(node, offset);
    return r.toString().length;
}

/** Recreates a DOM Range from absolute character offsets within a container. */
function rangeFromOffsets(container: Element, start: number, end: number): Range | null {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let total = 0;
    let startNode: Text | null = null;
    let startOff = 0;
    let endNode: Text | null = null;
    let endOff = 0;
    let node: Node | null;

    while ((node = walker.nextNode())) {
        const len = (node as Text).length;
        if (!startNode && total + len > start) {
            startNode = node as Text;
            startOff = start - total;
        }
        if (total + len >= end) {
            endNode = node as Text;
            endOff = end - total;
            break;
        }
        total += len;
    }

    if (!startNode || !endNode) return null;
    const range = document.createRange();
    range.setStart(startNode, startOff);
    range.setEnd(endNode, endOff);
    return range;
}

/** Find text-offset ranges occupied by input wrapper elements (hidden-measurer, fake-placeholder, etc.) */
function getInputExclusions(container: Element): { start: number; end: number }[] {
    const wrappers = container.querySelectorAll('[class*="input-wrapper"]');
    if (wrappers.length === 0) return [];

    const wrapperArr = Array.from(wrappers);
    const wrapperRanges = wrapperArr.map(() => ({ start: -1, end: -1 }));

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let node: Node | null;

    while ((node = walker.nextNode())) {
        const len = (node as Text).length;
        for (let i = 0; i < wrapperArr.length; i++) {
            if (wrapperArr[i].contains(node)) {
                if (wrapperRanges[i].start === -1) wrapperRanges[i].start = offset;
                wrapperRanges[i].end = offset + len;
            }
        }
        offset += len;
    }

    const exclusions: { start: number; end: number }[] = [];
    for (const r of wrapperRanges) {
        if (r.start !== -1 && r.end !== -1) exclusions.push(r);
    }
    exclusions.sort((a, b) => a.start - b.start);
    return exclusions;
}

/** Split a [start, end] range into segments that skip over exclusion zones. */
function splitAroundExclusions(
    start: number,
    end: number,
    exclusions: { start: number; end: number }[]
): { start: number; end: number }[] {
    const segments: { start: number; end: number }[] = [];
    let cursor = start;

    for (const ex of exclusions) {
        if (ex.start >= end || ex.end <= start) continue;
        const exStart = Math.max(ex.start, start);
        const exEnd = Math.min(ex.end, end);
        if (cursor < exStart) {
            segments.push({ start: cursor, end: exStart });
        }
        cursor = Math.max(cursor, exEnd);
    }

    if (cursor < end) {
        segments.push({ start: cursor, end });
    }

    return segments;
}

const INTERACTIVE = 'input, button, select, textarea, label, [role="button"]';

interface HighlightableContainerProps {
    children: React.ReactNode;
    highlights: ContainerHighlight[];
    onAdd: (segments: { start: number; end: number }[]) => void;
    onRemove: (groupId: string) => void;
}

const HighlightableContainer: React.FC<HighlightableContainerProps> = ({
    children,
    highlights,
    onAdd,
    onRemove,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
    const [mode, setMode] = useState<'highlight' | 'remove'>('highlight');
    const pendingRef = useRef<{ start: number; end: number }[] | null>(null);
    const pendingRemoveRef = useRef<string | null>(null);

    // ── Paint stored highlights via CSS Custom Highlight API ──────────
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !('highlights' in CSS)) return;

        const ranges: Range[] = [];
        for (const h of highlights) {
            const r = rangeFromOffsets(container, h.start, h.end);
            if (r) ranges.push(r);
        }

        if (ranges.length > 0) {
            CSS.highlights.set('container-highlights', new Highlight(...ranges));
        } else {
            CSS.highlights.delete('container-highlights');
        }
    }); // runs every render so ranges stay in sync with DOM

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if ('highlights' in CSS) {
                CSS.highlights.delete('container-highlights');
                CSS.highlights.delete('pending-container-selection');
            }
        };
    }, []);

    // ── Selection → show Highlight button ────────────────────────────
    useEffect(() => {
        const handleMouseUp = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) return;

            const container = containerRef.current;
            if (!container) return;

            const range = sel.getRangeAt(0);
            if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return;

            // Ignore if selection is entirely inside an interactive element
            const startEl = range.startContainer.parentElement;
            if (startEl?.closest(INTERACTIVE)) return;

            const start = getTextOffset(container, range.startContainer, range.startOffset);
            const end = getTextOffset(container, range.endContainer, range.endOffset);
            if (end <= start) return;

            const rects = range.getClientRects();
            if (!rects.length) return;

            // Split selection around input wrappers so inputs stay unhighlighted
            const exclusions = getInputExclusions(container);
            const segments = splitAroundExclusions(start, end, exclusions);
            if (segments.length === 0) return;

            pendingRef.current = segments;

            // Suppress Chrome's native "Search" bubble — show split ranges via CSS Highlight API
            if ('highlights' in CSS) {
                const pendingRanges: Range[] = [];
                for (const seg of segments) {
                    const r = rangeFromOffsets(container, seg.start, seg.end);
                    if (r) pendingRanges.push(r);
                }
                if (pendingRanges.length > 0) {
                    CSS.highlights.set('pending-container-selection', new Highlight(...pendingRanges));
                }
            }
            sel.removeAllRanges();

            setMode('highlight');
            setButtonPos({
                x: rects[0].left + rects[0].width / 2,
                y: rects[0].top - 4,
            });
        };

        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // ── Click on highlighted text → show Remove button ───────────────
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (highlights.length === 0 || buttonPos) return;

        const target = e.target as HTMLElement;
        if (target.closest(INTERACTIVE)) return;

        const container = containerRef.current;
        if (!container) return;

        // @ts-expect-error caretRangeFromPoint is non-standard but available in Chrome
        const caretRange: Range | null = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (!caretRange || !container.contains(caretRange.startContainer)) return;

        const offset = getTextOffset(container, caretRange.startContainer, caretRange.startOffset);
        const hit = highlights.find(h => offset >= h.start && offset < h.end);
        if (!hit) return;

        pendingRemoveRef.current = hit.groupId;
        setMode('remove');
        setButtonPos({ x: e.clientX, y: e.clientY - 10 });
    }, [highlights, buttonPos]);

    // ── Button actions ───────────────────────────────────────────────
    const clearPending = useCallback(() => {
        if ('highlights' in CSS) CSS.highlights.delete('pending-container-selection');
    }, []);

    const handleConfirm = useCallback(() => {
        clearPending();
        if (mode === 'remove') {
            if (pendingRemoveRef.current) {
                onRemove(pendingRemoveRef.current);
                pendingRemoveRef.current = null;
            }
        } else if (pendingRef.current && pendingRef.current.length > 0) {
            onAdd(pendingRef.current);
            pendingRef.current = null;
        }
        setButtonPos(null);
        setMode('highlight');
    }, [mode, onAdd, onRemove, clearPending]);

    const handleDismiss = useCallback(() => {
        clearPending();
        pendingRef.current = null;
        pendingRemoveRef.current = null;
        setButtonPos(null);
        setMode('highlight');
    }, [clearPending]);

    return (
        <>
            <div ref={containerRef} onClick={handleClick} className="highlightable__container">
                {children}
            </div>
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

export default HighlightableContainer;
