import type { IStrategyVariant } from '../../types/index.js';

export const hasJsonPayload = <
    Variant extends { payload?: IStrategyVariant['payload'] },
>(
    variant: Variant,
): variant is Variant & { payload: { type: 'json'; value: string } } =>
    variant.payload?.type === 'json';
