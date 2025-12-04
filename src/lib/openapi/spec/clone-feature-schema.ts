import type { FromSchema } from 'json-schema-to-ts';

export const cloneFeatureSchema = {
    $id: '#/components/schemas/cloneFeatureSchema',
    type: 'object',
    required: ['name'],
    description: 'Copy of a feature with a new name',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the new feature',
            example: 'new-feature',
        },
        replaceGroupId: {
            type: 'boolean',
            example: true,
            description:
                'Whether to use the new feature name as its group ID or not. Group ID is used for calculating [stickiness](https://docs.getunleash.io/concepts/stickiness#calculation). Defaults to true.',
        },
    },
    components: {},
} as const;

export type CloneFeatureSchema = FromSchema<typeof cloneFeatureSchema>;
