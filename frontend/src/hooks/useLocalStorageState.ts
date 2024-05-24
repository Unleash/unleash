import { useEffect, useState } from 'react';
import { createLocalStorage } from '../utils/createLocalStorage';

export const useLocalStorageState = <T extends object | string>(
    key: string,
    initialValue: T,
) => {
    const { value: initialStoredValue, setValue: setStoredValue } =
        createLocalStorage<T>(key, initialValue);

    const [localValue, setLocalValue] = useState<T>(initialStoredValue);

    useEffect(() => {
        setStoredValue(localValue);
    }, [localValue]);

    return [localValue, setLocalValue] as const;
};
