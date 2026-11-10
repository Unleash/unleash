import type { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { tagSchema } from './tag-schema.js';
import { userRecentFlagSchema } from './user-recent-flag-schema.js';
import { featureSearchEnvironmentSchema } from './feature-search-environment-schema.js';

export const userRecentFlagsSchema = {
    $id: '#/components/schemas/userRecentFlagsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['flags', 'limit', 'offset'],
    description: 'Flags the current user interacted with, most recent first.',
    properties: {
        flags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/userRecentFlagSchema',
            },
            description:
                'The page of flags the current user most recently worked on.',
        },
        limit: {
            type: 'integer',
            minimum: 1,
            description: 'The maximum number of flags returned in this page.',
            example: 100,
        },
        offset: {
            type: 'integer',
            minimum: 0,
            description: 'The number of flags skipped before this page.',
            example: 0,
        },
    },
    components: {
        schemas: {
            featureSearchEnvironmentSchema,
            userRecentFlagSchema,
            constraintSchema,
            featureStrategySchema,
            strategyVariantSchema,
            overrideSchema,
            parametersSchema,
            variantSchema,
            tagSchema,
        },
    },
} as const;

export type UserRecentFlagsSchema = FromSchema<
    typeof userRecentFlagsSchema,
    { keepDefaultedPropertiesOptional: true }
>;
