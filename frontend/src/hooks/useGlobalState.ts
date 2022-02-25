import React from 'react';
import { createGlobalState } from 'react-hooks-global-state';

type UseGlobalState<T> = () => [
    value: T,
    setValue: React.Dispatch<React.SetStateAction<T>>
];

// Create a hook that stores global state (shared across all hook instances).
export const createGlobalStateHook = <T>(
    key: string,
    initialValue: T
): UseGlobalState<T> => {
    const container = createGlobalState<{ [key: string]: T }>({
        [key]: initialValue,
    });

    const setGlobalState = (value: React.SetStateAction<T>) => {
        container.setGlobalState(key, value);
    };

    return () => [container.useGlobalState(key)[0], setGlobalState];
};
