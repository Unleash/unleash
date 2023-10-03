import { basePath } from './formatPath';
import { getLocalStorageItem, setLocalStorageItem } from './storage';

export const createLocalStorage = <T extends object>(
    key: string,
    initialValue: T
) => {
    const internalKey = `${basePath}:${key}:localStorage:v2`;
    const value = (() => {
        const state = getLocalStorageItem<T>(internalKey);
        if (state === undefined) {
            return initialValue;
        }
        return state;
    })();

    const onUpdate = (newValue: T | ((prev: T) => T)): T => {
        if (newValue instanceof Function) {
            const previousValue = getLocalStorageItem<T>(internalKey);
            const output = newValue(previousValue ?? initialValue);
            setLocalStorageItem(internalKey, output);
            return output;
        }

        setLocalStorageItem(internalKey, newValue);
        return newValue;
    };

    return { value, setValue: onUpdate };
};
