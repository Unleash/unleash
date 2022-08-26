import React from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

type UsePersistentGlobalState<T> = () => [
    value: T,
    setValue: React.Dispatch<React.SetStateAction<T>>
];

/**
 * Create a hook that stores global state (shared across all hook instances).
 * The state is also persisted to localStorage and restored on page load.
 * The localStorage state is not synced between tabs.
 *
 * @deprecated `hooks/useLocalStorage` -- we don't need `react-hooks-global-state`
 */
export const createPersistentGlobalStateHook = <T extends object>(
    key: string,
    initialValue: T
): UsePersistentGlobalState<T> => {
    const container = createGlobalState<{ [key: string]: T }>({
        [key]: getLocalStorageItem<T>(key) ?? initialValue,
    });

    const setGlobalState = (value: React.SetStateAction<T>) => {
        const prev = container.getGlobalState(key);
        const next = value instanceof Function ? value(prev) : value;
        container.setGlobalState(key, next);
        setLocalStorageItem(key, next);
    };

    return () => [container.useGlobalState(key)[0], setGlobalState];
};
