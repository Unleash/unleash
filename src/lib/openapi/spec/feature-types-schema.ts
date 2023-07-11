import { FromSchema } from 'json-schema-to-ts';
import { featureTypeSchema } from './feature-type-schema';

export const featureTypesSchema = {
    $id: '#/components/schemas/featureTypesSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A list of [feature toggle types](https://docs.getunleash.io/reference/feature-toggle-types) and the schema version used to represent those feature types.',
    required: ['version', 'types'],
    properties: {
        version: {
            type: 'integer',
            enum: [1],
            example: 1,
            description:
                'The schema version used to describe the feature toggle types listed in the `types` property.',
        },
        types: {
            type: 'array',
            description: 'The list of feature toggle types.',
            items: {
                $ref: '#/components/schemas/featureTypeSchema',
            },
            example: [
                {
                    id: 'release',
                    name: 'Release',
                    description:
                        'Release feature toggles are used to release new features.',
                    lifetimeDays: 40,
                },
                {
                    id: 'experiment',
                    name: 'Experiment',
                    description:
                        'Experiment feature toggles are used to test and verify multiple different versions of a feature.',
                    lifetimeDays: 40,
                },
                {
                    id: 'operational',
                    name: 'Operational',
                    description:
                        'Operational feature toggles are used to control aspects of a rollout.',
                    lifetimeDays: 7,
                },
                {
                    id: 'kill-switch',
                    name: 'Kill switch',
                    description:
                        'Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.',
                    lifetimeDays: null,
                },
                {
                    id: 'permission',
                    name: 'Permission',
                    description:
                        'Permission feature toggles are used to control permissions in your system.',
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
