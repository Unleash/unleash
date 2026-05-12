import { type RefObject, useEffect, useRef, useState } from 'react';

interface IsElementWiderThanResult<T extends Element> {
    /** Attach to the element you want to measure. */
    ref: RefObject<T>;
    /** True when width >= threshold; false until the first ResizeObserver callback. */
    isWide: boolean;
}

export const useIsElementWiderThan = <T extends Element = HTMLElement>(
    threshold: number,
): IsElementWiderThanResult<T> => {
    const [isWide, setIsWide] = useState(false);
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setIsWide(entry.contentRect.width >= threshold);
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isWide };
};
