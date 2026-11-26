import type { VariantSchema } from 'openapi';

export type IFeatureVariantEdit = VariantSchema & {
    id: string;
    isValid: boolean;
    new: boolean;
};
