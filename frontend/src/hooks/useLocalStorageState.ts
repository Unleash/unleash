import { useEffect, useMemo, useRef, useState } from 'react';
import { createLocalStorage } from '../utils/createLocalStorage.js';

export const useLocalStorageState = <T extends object | string>(
    key: string,
    initialValue: T,
    timeToLive?: number,
) => {
    const initialValueRef = useRef(initialValue);
    const { value: initialStoredValue, setValue: setStoredValue } = useMemo(
        () => createLocalStorage<T>(key, initialValueRef.current, timeToLive),
        [key, timeToLive],
    );

    const [localValue, setLocalValue] = useState<T>(initialStoredValue);
    const localValueRef = useRef(initialStoredValue);

    useEffect(() => {
        // A child effect may have updated storage since the initial render.
        setStoredValue((value) => value, localValueRef.current);
    }, [setStoredValue]);

    return [
        localValue,
        (value: T | ((prevState: T) => T)) => {
            const nextValue = setStoredValue(value, localValueRef.current);
            localValueRef.current = nextValue;
            setLocalValue(nextValue);
        },
    ] as const;
};
