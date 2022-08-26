import { useRef } from 'react';

/**
 * Don't revalidate if array content didn't change.
 * Needed for `columns` memo optimization.
 */
export const useEnvironmentsRef = (environments: string[] = []) => {
    const ref = useRef<string[]>(environments);

    if (environments?.join('') !== ref.current?.join('')) {
        ref.current = environments;
    }

    return ref.current;
};
