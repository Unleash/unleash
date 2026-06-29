import { useEffect, useMemo, useRef } from 'react';
import debounce from 'debounce';

/**
 * Stable debounced callback that always invokes the latest `fn`.
 * Replaces `react-table` v7's `useAsyncDebounce`.
 */
export const useDebouncedCallback = <Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number,
) => {
    const fnRef = useRef(fn);

    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    const debounced = useMemo(
        () =>
            debounce((...args: Args) => {
                fnRef.current(...args);
            }, delay),
        [delay],
    );

    useEffect(() => {
        return () => {
            debounced.clear();
        };
    }, [debounced]);

    return debounced;
};
