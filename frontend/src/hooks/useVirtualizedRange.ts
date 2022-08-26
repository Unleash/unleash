import { useEffect, useState } from 'react';

/**
 * Get index of first and last displayed item in current window scroll offset.
 * This is done to optimize performance for large lists.
 *
 * @param rowHeight height of single item in pixels
 * @param scrollOffset how many items above and below to render -- TODO: calculate from window height
 * @param dampening cause less re-renders -- only after jumping this x of elements, "staircase" effect
 * @returns [firstIndex, lastIndex]
 */
export const useVirtualizedRange = (
    rowHeight: number,
    scrollOffset = 40,
    dampening = 5
) => {
    const [scrollIndex, setScrollIndex] = useState(
        Math.floor(window.pageYOffset / rowHeight)
    );

    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(() => {
                setScrollIndex(
                    Math.floor(window.pageYOffset / (rowHeight * dampening)) *
                        dampening
                );
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [rowHeight, dampening]);

    return [scrollIndex - scrollOffset, scrollIndex + scrollOffset] as const;
};
