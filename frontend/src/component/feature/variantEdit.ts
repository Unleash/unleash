import type { VariantSchema } from 'openapi';

export type IFeatureVariantEdit = VariantSchema & {
    isValid: boolean;
    new: boolean;
    id: string;
};
