import { useEffect, useState } from 'react';
import { createLocalStorage } from '../utils/createLocalStorage.js';

export const useLocalStorageState = <T extends object | string>(
    key: string,
    initialValue: T,
    timeToLive?: number,
) => {
    const { value: initialStoredValue, setValue: setStoredValue } =
        createLocalStorage<T>(key, initialValue, timeToLive);

    const [localValue, setLocalValue] = useState<T>(initialStoredValue);

    useEffect(() => {
        setStoredValue(localValue);
    }, [localValue, setStoredValue]);

    return [
        localValue,
        (value: T | ((prevState: T) => T)) => {
            const newValue =
                value instanceof Function ? value(localValue) : value;
            setStoredValue(newValue);
            setLocalValue(newValue);
        },
    ] as const;
};
