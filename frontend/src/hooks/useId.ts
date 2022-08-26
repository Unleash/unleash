import { useMemo } from 'react';

// Generate a globally unique ID that is stable across renders.
export const useId = (prefix = 'useId'): string => {
    return useMemo(() => {
        return `${prefix}-${counter++}`;
    }, [prefix]);
};

let counter = 0;
