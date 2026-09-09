import { useState } from 'react';
import type React from 'react';

export interface HighlightProps {
    highlights: Highlight[];
    onAdd: (h: Omit<Highlight, 'id'>) => void;
    onRemove: (groupId: string) => void;
    pendingRef: React.MutableRefObject<{ paragraphIndex: number; start: number; end: number }[]>;
}

export interface Highlight {
    id: string;
    groupId: string;
    paragraphIndex: number;
    start: number;
    end: number;
}

function useHighlights() {
    const [highlights, setHighlights] = useState<Highlight[]>([]);

    const addHighlight = (h: Omit<Highlight, 'id'>) => {
        setHighlights((prev) => [
            ...prev,
            { ...h, id: crypto.randomUUID() },
        ]);
    };

    const removeHighlightGroup = (groupId: string) => {
        setHighlights((prev) => prev.filter((h) => h.groupId !== groupId));
    };

    return { highlights, addHighlight, removeHighlightGroup };
}

export default useHighlights;
