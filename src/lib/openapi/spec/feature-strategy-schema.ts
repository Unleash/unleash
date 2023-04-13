import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const featureStrategySchema = {
    $id: '#/components/schemas/featureStrategySchema',
    description:
        'A singles activation strategy configuration schema for a feature',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        id: {
            type: 'string',
            description: 'A uuid for the feature strategy',
            example: '6b5157cb-343a-41e7-bfa3-7b4ec3044840',
        },
        name: {
            type: 'string',
            description: 'The name or type of strategy',
            example: 'flexibleRollout',
        },
        title: {
            type: 'string',
            nullable: true,
            description: 'A descriptive title for the strategy',
            example: 'Gradual Rollout 25-Prod',
        },
        featureName: {
            type: 'string',
            description: 'The name or feature the strategy is attached to',
            example: 'myAwesomeFeature',
        },
        sortOrder: {
            type: 'number',
            description: 'The order of the strategy in the list',
            example: '9999',
        },
        segments: {
            type: 'array',
            description: 'A list of segment ids attached to the strategy',
            example: '[1,2]',
            items: {
                type: 'number',
            },
        },
        constraints: {
            type: 'array',
            description: 'A list of the constraints attached to the strategy',
            example: [
                {
                    values: ['1', '2'],
                    inverted: false,
                    operator: 'IN',
                    contextName: 'appName',
                    caseInsensitive: false,
                },
            ],
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        parameters: {
            description: 'An object containing the parameters for the strategy',
            example: {
                groupId: 'some_new',
                rollout: '25',
                stickiness: 'sessionId',
            },
            $ref: '#/components/schemas/parametersSchema',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type FeatureStrategySchema = FromSchema<typeof featureStrategySchema>;
