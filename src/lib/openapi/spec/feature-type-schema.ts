import { FromSchema } from 'json-schema-to-ts';

export const featureTypeSchema = {
    $id: '#/components/schemas/featureTypeSchema',
    type: 'object',
    description:
        'A [feature toggle type](https://docs.getunleash.io/reference/feature-toggle-types).',
    additionalProperties: false,
    required: ['id', 'name', 'description', 'lifetimeDays'],
    properties: {
        id: {
            type: 'string',
            description: 'The identifier of this feature toggle type.',
            example: 'kill-switch',
        },
        name: {
            type: 'string',
            description: 'The display name of this feature toggle type.',
            example: 'Kill switch',
        },
        description: {
            type: 'string',
            description:
                'A description of what this feature toggle type is intended to be used for.',
            example:
                'Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.',
        },
        lifetimeDays: {
            type: 'integer',
            minimum: 0,
            description:
                'How many days it takes before a feature toggle of this typed is flagged as [potentially stale](https://docs.getunleash.io/reference/technical-debt#stale-and-potentially-stale-toggles) by Unleash. If this value is `null`, Unleash will never mark it as potentially stale.',
            example: 40,
            nullable: true,
        },
    },
    components: {},
} as const;

export type FeatureTypeSchema = FromSchema<typeof featureTypeSchema>;
