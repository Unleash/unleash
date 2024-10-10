import { useOptionalPathParam } from './useOptionalPathParam';

export const useOptionalPathParamWithFallback = (
    key: string,
    fallback: string | undefined,
): string => {
    const value = useOptionalPathParam(key) || fallback;

    if (!value) {
        throw new Error(
            `Missing required path param or valid fallback for: ${key}`,
        );
    }

    return value;
};
