import { useMemo } from 'react';
import { PayloadType, Variant } from 'unleash-client';

export const useVariant = <T = string>(variant?: Variant) => {
    return useMemo(() => {
        if (variant?.enabled) {
            return getVariantValue<T>(variant);
        }
    }, [variant]);
};

const getVariantValue = <T = string>(
    variant: Variant | undefined
): T | undefined => {
    if (variant?.payload !== undefined) {
        if (variant.payload.type === PayloadType.JSON) {
            return JSON.parse(variant.payload.value) as T;
        }

        return variant.payload.value as T;
    }
};
