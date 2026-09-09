import { useRef, useEffect } from "react";

interface AutoScrollConfig {
    headerHeight?: number;
    footerHeight?: number;
    hotZoneTop?: number;
    hotZoneBottom?: number;
    maxSpeed?: number;
}

export function useAutoScroll(isDragging: boolean, config?: AutoScrollConfig): void {
    const headerHeight = config?.headerHeight ?? 70;
    const footerHeight = config?.footerHeight ?? 70;
    const hotZoneTop = config?.hotZoneTop ?? 90;
    const hotZoneBottom = config?.hotZoneBottom ?? 90;
    const maxSpeed = config?.maxSpeed ?? 14;

    const scrollRAF = useRef<number | null>(null);
    const lastClientY = useRef<number>(0);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
            if (node == null) return null;
            if (node.scrollHeight > node.clientHeight) {
                const overflowY = window.getComputedStyle(node).overflowY;
                if (overflowY === "auto" || overflowY === "scroll") return node;
            }
            return getScrollParent(node.parentElement);
        };

        const stop = () => {
            if (scrollRAF.current !== null) {
                cancelAnimationFrame(scrollRAF.current);
                scrollRAF.current = null;
            }
        };

        const start = () => {
            if (scrollRAF.current !== null) return;
            const step = () => {
                if (!scrollContainerRef.current) {
                    scrollRAF.current = null;
                    return;
                }
                const y = lastClientY.current;
                const topBoundary = headerHeight + hotZoneTop;
                const bottomBoundary = window.innerHeight - footerHeight - hotZoneBottom;
                let speed = 0;
                if (y < topBoundary) {
                    const ratio = 1 - Math.max(0, (y - headerHeight)) / hotZoneTop;
                    speed = -Math.round(maxSpeed * Math.min(1, ratio));
                } else if (y > bottomBoundary) {
                    const ratio = 1 - Math.max(0, (window.innerHeight - footerHeight - y)) / hotZoneBottom;
                    speed = Math.round(maxSpeed * Math.min(1, ratio));
                }
                if (speed !== 0) {
                    scrollContainerRef.current.scrollBy({ top: speed, behavior: "instant" });
                }
                scrollRAF.current = requestAnimationFrame(step);
            };
            scrollRAF.current = requestAnimationFrame(step);
        };

        const handleDragOver = (e: DragEvent) => {
            lastClientY.current = e.clientY;
            scrollContainerRef.current =
                getScrollParent(e.target as HTMLElement) ?? document.documentElement;
            start();
        };

        if (isDragging) {
            window.addEventListener("dragover", handleDragOver);
        } else {
            stop();
            scrollContainerRef.current = null;
        }

        return () => {
            window.removeEventListener("dragover", handleDragOver);
        };
    }, [isDragging, headerHeight, footerHeight, hotZoneTop, hotZoneBottom, maxSpeed]);

    // Cancel any in-flight RAF on unmount
    useEffect(() => () => {
        if (scrollRAF.current !== null) cancelAnimationFrame(scrollRAF.current);
    }, []);
}
