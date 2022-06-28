import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { tagSchema } from './tag-schema';
import { tagTypeSchema } from './tag-type-schema';
import { featureTagSchema } from './feature-tag-schema';
import { projectSchema } from './project-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { environmentSchema } from './environment-schema';
import { segmentSchema } from './segment-schema';
import { featureStrategySegmentSchema } from './feature-strategy-segment-schema';
import { strategySchema } from './strategy-schema';

export const stateSchema = {
    $id: '#/components/schemas/stateSchema',
    type: 'object',
    additionalProperties: true,
    required: ['version'],
    properties: {
        version: {
            type: 'integer',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
        tags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
        tagTypes: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        featureTags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTagSchema',
            },
        },
        projects: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectSchema',
            },
        },
        featureStrategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        featureEnvironments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentSchema',
            },
        },
        segments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/segmentSchema',
            },
        },
        featureStrategySegments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySegmentSchema',
            },
        },
    },
    components: {
        schemas: {
            featureSchema,
            tagSchema,
            tagTypeSchema,
            featureTagSchema,
            projectSchema,
            featureStrategySchema,
            featureEnvironmentSchema,
            environmentSchema,
            segmentSchema,
            featureStrategySegmentSchema,
            strategySchema,
        },
    },
} as const;

export type StateSchema = FromSchema<typeof stateSchema>;
