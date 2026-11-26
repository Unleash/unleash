import type { StrategyVariantSchema } from 'openapi';

export type StrategyVariantEdit = StrategyVariantSchema & {
    id: string;
    isValid: boolean;
    new: boolean;
};
