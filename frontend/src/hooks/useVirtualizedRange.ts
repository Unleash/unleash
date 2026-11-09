import { type RefObject, useEffect, useState } from 'react';

/**
 * Get index of first and last displayed item in current scroll offset.
 * This is done to optimize performance for large lists.
 *
 * Row indexes are anchored to the table's own position in the scroll
 * container, so tables that don't start at the top (e.g. stacked below
 * another table) render the correct rows.
 *
 * @param rowHeight height of single item in pixels
 * @param tableRef the virtualized table whose rows are being displayed
 * @param scrollOffset how many items above and below to render -- TODO: calculate from window height
 * @param dampening cause less re-renders -- only after jumping this x of elements, "staircase" effect
 * @param parentElement scroll container, defaults to window
 * @returns [firstIndex, lastIndex]
 */
export const useVirtualizedRange = (
    rowHeight: number,
    tableRef: RefObject<HTMLElement | null>,
    scrollOffset = 40,
    dampening = 5,
    parentElement?: HTMLElement | null,
) => {
    const parent = parentElement ? parentElement : window;

    const [scrollIndex, setScrollIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            requestAnimationFrame(() => {
                // nothing to measure in a brief window before React attaches the ref
                if (!tableRef.current) {
                    return;
                }
                // negative when the table hasn't been reached yet
                const scrollDistancePastTableTop =
                    (parentElement?.getBoundingClientRect().top ?? 0) -
                    tableRef.current.getBoundingClientRect().top;
                setScrollIndex(
                    Math.max(
                        0,
                        Math.floor(
                            scrollDistancePastTableTop /
                                (rowHeight * dampening),
                        ),
                    ) * dampening,
                );
            });
        };
        handleScroll();
        parent.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            parent.removeEventListener('scroll', handleScroll);
        };
    }, [rowHeight, dampening, parent, parentElement, tableRef]);

    return [scrollIndex - scrollOffset, scrollIndex + scrollOffset] as const;
};
