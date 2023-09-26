import { FromSchema } from 'json-schema-to-ts';

export const parentFeatureOptionsSchema = {
    $id: '#/components/schemas/parentFeatureOptionsSchema',
    type: 'object',
    description:
        'A list of parent feature names available for a given child feature. Features that have their own parents are excluded.',
    additionalProperties: false,
    items: {
        type: 'string',
    },
    components: {},
} as const;

export type ParentFeatureOptionsSchema = FromSchema<
    typeof parentFeatureOptionsSchema
>;
