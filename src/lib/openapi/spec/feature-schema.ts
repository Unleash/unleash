import { FromSchema } from 'json-schema-to-ts';
import { variantSchema } from './variant-schema';
import { constraintSchema } from './constraint-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { tagSchema } from './tag-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';

export const featureSchema = {
    $id: '#/components/schemas/featureSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        description: {
            type: 'string',
            nullable: true,
        },
        archived: {
            type: 'boolean',
        },
        project: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        stale: {
            type: 'boolean',
        },
        favorite: {
            type: 'boolean',
        },
        impressionData: {
            type: 'boolean',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
        tags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
            nullable: true,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            featureEnvironmentSchema,
            featureStrategySchema,
            overrideSchema,
            parametersSchema,
            variantSchema,
            tagSchema,
        },
    },
} as const;

export type FeatureSchema = FromSchema<typeof featureSchema>;
