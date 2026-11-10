import type { FromSchema } from 'json-schema-to-ts';
import { featureSearchResponseSchema } from './feature-search-response-schema.js';

export const userRecentFlagSchema = {
    $id: '#/components/schemas/userRecentFlagSchema',
    type: 'object',
    additionalProperties: false,
    required: [...featureSearchResponseSchema.required, 'userLastUpdatedAt'],
    description: 'A flag the current user recently worked on.',
    properties: {
        ...featureSearchResponseSchema.properties,
        userLastUpdatedAt: {
            type: 'string',
            format: 'date-time',
            description:
                'When the current user created or last changed this flag.',
            example: '2026-11-09T12:00:00.000Z',
        },
    },
    components: featureSearchResponseSchema.components,
} as const;

export type UserRecentFlagSchema = FromSchema<
    typeof userRecentFlagSchema,
    { keepDefaultedPropertiesOptional: true }
>;
