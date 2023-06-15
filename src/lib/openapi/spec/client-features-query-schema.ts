import { FromSchema } from 'json-schema-to-ts';

export const clientFeaturesQuerySchema = {
    $id: '#/components/schemas/clientFeaturesQuerySchema',
    type: 'object',
    additionalProperties: false,
    description: 'Query parameters active for a client features request',
    properties: {
        tag: {
            type: 'array',
            description: 'Features tagged with one of these tags are included',
            items: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            example: [['simple:payment', 'simple:stripejourney']],
        },
        project: {
            type: 'array',
            items: {
                type: 'string',
            },
            description:
                'Features that are part of these projects are included in this response. (DEPRECATED) - Handled by API tokens',
            example: ['new.payment.flow'],
            deprecated: true,
        },
        namePrefix: {
            description:
                'Features are filtered to only include features whose name starts with this prefix',
            type: 'string',
            example: 'payment',
        },
        environment: {
            type: 'string',
            description:
                'Strategies for the feature toggle configured for this environment are included. (DEPRECATED) - Handled by API tokens',
            deprecated: true,
        },
        inlineSegmentConstraints: {
            description:
                'Set to true if requesting client does not support Unleash-Client-Specification 4.2.2 or newer. Modern SDKs will have this set to false, since they will be able to merge constraints and segments themselves',
            type: 'boolean',
            example: true,
        },
    },
    components: {},
} as const;

export type ClientFeaturesQuerySchema = FromSchema<
    typeof clientFeaturesQuerySchema
>;
