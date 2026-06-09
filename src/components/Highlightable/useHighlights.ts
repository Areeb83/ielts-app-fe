import { useState, useEffect } from 'react';

export interface Highlight {
    id: string;
    groupId: string;
    paragraphIndex: number;
    start: number;
    end: number;
}

function useHighlights(testId: string) {
    const storageKey = `highlights-${testId}`;

    const [highlights, setHighlights] = useState<Highlight[]>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(highlights));
    }, [highlights, storageKey]);

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
