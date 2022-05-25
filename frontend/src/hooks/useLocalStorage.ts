import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { basePath } from 'utils/formatPath';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

export const useLocalStorage = <T extends object>(
    key: string,
    initialValue: T
) => {
    const internalKey = `${basePath}:${key}:useLocalStorage:v1`;
    const [value, setValue] = useState<T>(() => {
        const state = getLocalStorageItem<T>(internalKey);
        if (state === undefined) {
            return initialValue;
        }
        return state;
    });

    const onUpdate = useCallback<Dispatch<SetStateAction<T>>>(
        value => {
            if (value instanceof Function) {
                setValue(prev => {
                    const output = value(prev);
                    setLocalStorageItem(internalKey, output);
                    return output;
                });
            }
            setLocalStorageItem(internalKey, value);
            setValue(value);
        },
        [internalKey]
    );

    return [value, onUpdate] as const;
};
