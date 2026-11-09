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

    useEffect(() => {
        setStoredValue(localValue);
    }, [localValue, setStoredValue]);

    return [
        localValue,
        (value: T | ((prevState: T) => T)) => {
            setStoredValue(value);
            setLocalValue(value);
        },
    ] as const;
};
