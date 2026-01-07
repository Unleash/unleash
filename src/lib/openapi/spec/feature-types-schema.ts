import type { FromSchema } from 'json-schema-to-ts';
import { featureTypeSchema } from './feature-type-schema.js';

export const featureTypesSchema = {
    $id: '#/components/schemas/featureTypesSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A list of [feature flag types](https://docs.getunleash.io/concepts/feature-flags#feature-flag-types) and the schema version used to represent those feature types.',
    required: ['version', 'types'],
    properties: {
        version: {
            type: 'integer',
            enum: [1],
            example: 1,
            description:
                'The schema version used to describe the feature flag types listed in the `types` property.',
        },
        types: {
            type: 'array',
            description: 'The list of feature flag types.',
            items: {
                $ref: '#/components/schemas/featureTypeSchema',
            },
            example: [
                {
                    id: 'release',
                    name: 'Release',
                    description:
                        'Release feature flags are used to release new features.',
                    lifetimeDays: 40,
                },
                {
                    id: 'experiment',
                    name: 'Experiment',
                    description:
                        'Experiment feature flags are used to test and verify multiple different versions of a feature.',
                    lifetimeDays: 40,
                },
                {
                    id: 'operational',
                    name: 'Operational',
                    description:
                        'Operational feature flags are used to control aspects of a rollout.',
                    lifetimeDays: 7,
                },
                {
                    id: 'kill-switch',
                    name: 'Kill switch',
                    description:
                        'Kill switch feature flags are used to quickly turn on or off critical functionality in your system.',
                    lifetimeDays: null,
                },
                {
                    id: 'permission',
                    name: 'Permission',
                    description:
                        'Permission feature flags are used to control permissions in your system.',
                    lifetimeDays: null,
                },
            ],
        },
    },
    components: {
        schemas: {
            featureTypeSchema,
        },
    },
} as const;

export type FeatureTypesSchema = FromSchema<typeof featureTypesSchema>;
