import { useMemo } from 'react';
import { Variant } from 'unleash-client';
import { getVariantValue } from '@server/util/flag-resolver';

export const useVariant = <T = string>(variant?: Variant) => {
    return useMemo(() => {
        if (variant?.enabled) {
            return getVariantValue<T>(variant);
        }
    }, [variant]);
};
