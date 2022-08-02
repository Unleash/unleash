import { FromSchema } from 'json-schema-to-ts';

export const clientFeaturesQuerySchema = {
    $id: '#/components/schemas/clientFeaturesQuerySchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        tag: {
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
        project: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        namePrefix: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        inlineSegmentConstraints: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type ClientFeaturesQuerySchema = FromSchema<
    typeof clientFeaturesQuerySchema
>;
