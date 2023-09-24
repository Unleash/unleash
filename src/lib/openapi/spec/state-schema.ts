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
import { strategyVariantSchema } from './strategy-variant-schema';

export const stateSchema = {
    $id: '#/components/schemas/stateSchema',
    type: 'object',
    deprecated: true,
    description:
        'The application state as used by the deprecated export/import APIs.',
    required: ['version'],
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the schema used to describe the state',
            example: 1,
        },
        features: {
            type: 'array',
            description: 'A list of features',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
        strategies: {
            type: 'array',
            description: 'A list of strategies',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
        tags: {
            type: 'array',
            description: 'A list of tags',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
        tagTypes: {
            type: 'array',
            description: 'A list of tag types',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        featureTags: {
            type: 'array',
            description: 'A list of tags applied to features',
            items: {
                $ref: '#/components/schemas/featureTagSchema',
            },
        },
        projects: {
            type: 'array',
            description: 'A list of projects',
            items: {
                $ref: '#/components/schemas/projectSchema',
            },
        },
        featureStrategies: {
            type: 'array',
            description: 'A list of feature strategies as applied to features',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        featureEnvironments: {
            type: 'array',
            description: 'A list of feature environment configurations',
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        environments: {
            type: 'array',
            description: 'A list of environments',
            items: {
                $ref: '#/components/schemas/environmentSchema',
            },
        },
        segments: {
            type: 'array',
            description: 'A list of segments',
            items: {
                $ref: '#/components/schemas/segmentSchema',
            },
        },
        featureStrategySegments: {
            type: 'array',
            description: 'A list of segment/strategy pairings',
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
            strategyVariantSchema,
            featureEnvironmentSchema,
            environmentSchema,
            segmentSchema,
            featureStrategySegmentSchema,
            strategySchema,
        },
    },
} as const;

export type StateSchema = FromSchema<typeof stateSchema>;
