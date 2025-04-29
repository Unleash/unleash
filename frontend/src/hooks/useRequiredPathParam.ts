import { useOptionalPathParam } from './useOptionalPathParam.js';

export const useRequiredPathParam = (key: string): string => {
    const value = useOptionalPathParam(key);

    if (!value) {
        throw new Error(`Missing required path param: ${key}`);
    }

    return value;
};
