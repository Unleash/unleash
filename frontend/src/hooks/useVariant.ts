import { useMemo } from 'react';
import { type Variant, getVariantValue } from 'utils/variants';

export const useVariant = <T = string>(variant?: Variant) => {
    return useMemo(() => {
        if (variant?.enabled) {
            return getVariantValue<T>(variant);
        }
    }, [variant]);
};
