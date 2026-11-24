import { basePath } from './formatPath.js';
import { getLocalStorageItem, setLocalStorageItem } from './storage.js';

export const createLocalStorage = <T extends object | string>(
    key: string,
    initialValue: T,
    timeToLive?: number,
) => {
    const internalKey = `${basePath}:${key}:localStorage:v2`;
    const value = (() => {
        const state = getLocalStorageItem<T>(internalKey);
        if (state === undefined) {
            return initialValue;
        }
        return state;
    })();

    let lastWriteFailed = false;

    const onUpdate = (newValue: T | ((prev: T) => T), fallbackValue?: T): T => {
        if (newValue instanceof Function) {
            const previousValue =
                lastWriteFailed && fallbackValue !== undefined
                    ? undefined
                    : getLocalStorageItem<T>(internalKey);
            const output = newValue(
                previousValue ?? fallbackValue ?? initialValue,
            );
            lastWriteFailed = !setLocalStorageItem(
                internalKey,
                output,
                timeToLive,
            );
            return output;
        }

        lastWriteFailed = !setLocalStorageItem(
            internalKey,
            newValue,
            timeToLive,
        );
        return newValue;
    };

    return { value, setValue: onUpdate };
};
