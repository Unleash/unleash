import { useCallback } from 'react';
import { useQueryStringState } from './useQueryStringState';

// Store a number in the query string. Call setState to update the query string.
export const useQueryStringNumberState = (
    key: string
): [number | undefined, (value: number) => void] => {
    const [value, setValue] = useQueryStringState(key);

    const setState = useCallback(
        (value: number) => setValue(String(value)),
        [setValue]
    );

    return [
        Number.isFinite(Number(value)) ? Number(value) : undefined,
        setState,
    ];
};
