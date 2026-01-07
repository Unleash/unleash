import type { FromSchema } from 'json-schema-to-ts';

export const featureTypeSchema = {
    $id: '#/components/schemas/featureTypeSchema',
    type: 'object',
    description:
        'A [feature flag type](https://docs.getunleash.io/concepts/feature-flags#feature-flag-types).',
    additionalProperties: false,
    required: ['id', 'name', 'description', 'lifetimeDays'],
    properties: {
        id: {
            type: 'string',
            description: 'The identifier of this feature flag type.',
            example: 'kill-switch',
        },
        name: {
            type: 'string',
            description: 'The display name of this feature flag type.',
            example: 'Kill switch',
        },
        description: {
            type: 'string',
            description:
                'A description of what this feature flag type is intended to be used for.',
            example:
                'Kill switch feature flags are used to quickly turn on or off critical functionality in your system.',
        },
        lifetimeDays: {
            type: 'integer',
            minimum: 0,
            description:
                'How many days it takes before a feature flag of this typed is flagged as [potentially stale](https://docs.getunleash.io/concepts/technical-debt#stale-and-potentially-stale-toggles) by Unleash. If this value is `null`, Unleash will never mark it as potentially stale.',
            example: 40,
            nullable: true,
        },
    },
    components: {},
} as const;

export type FeatureTypeSchema = FromSchema<typeof featureTypeSchema>;
