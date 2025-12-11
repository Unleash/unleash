import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';
import { clientFeatureSchema } from './client-feature-schema.js';
import { environmentSchema } from './environment-schema.js';
import { clientSegmentSchema } from './client-segment-schema.js';
import { overrideSchema } from './override-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { variantSchema } from './variant-schema.js';
import { dependentFeatureSchema } from './dependent-feature-schema.js';

export const clientFeaturesDeltaSchema = {
    $id: '#/components/schemas/clientFeaturesDeltaSchema',
    type: 'object',
    required: ['events'],
    description: 'Schema for delta updates of feature configurations.',
    properties: {
        events: {
            description: 'A list of delta events.',
            type: 'array',
            items: {
                type: 'object',
                anyOf: [
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'feature'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['feature-updated'] },
                            feature: {
                                $ref: '#/components/schemas/clientFeatureSchema',
                            },
                        },
                    },
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'featureName', 'project'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['feature-removed'] },
                            featureName: { type: 'string' },
                            project: { type: 'string' },
                        },
                    },
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'segment'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['segment-updated'] },
                            segment: {
                                $ref: '#/components/schemas/clientSegmentSchema',
                            },
                        },
                    },
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'segmentId'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['segment-removed'] },
                            segmentId: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        required: ['type', 'features', 'segments', 'eventId'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['hydration'] },
                            features: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/clientFeatureSchema',
                                },
                            },
                            segments: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/clientSegmentSchema',
                                },
                            },
                        },
                    },
                ],
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            clientFeatureSchema,
            environmentSchema,
            clientSegmentSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            variantSchema,
            dependentFeatureSchema,
        },
    },
} as const;

export type ClientFeaturesDeltaSchema = FromSchema<
    typeof clientFeaturesDeltaSchema,
    { keepDefaultedPropertiesOptional: true }
>;
