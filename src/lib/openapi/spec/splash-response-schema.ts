import type { FromSchema } from 'json-schema-to-ts';
import { splashRequestSchema } from './splash-request-schema.js';

export const splashResponseSchema = {
    ...splashRequestSchema,
    $id: '#/components/schemas/splashResponseSchema',
    additionalProperties: false,
    description: 'Data related to a user having seen a splash screen.',
    required: [...splashRequestSchema.required, 'seen'],
    properties: {
        ...splashRequestSchema.properties,
        seen: {
            type: 'boolean',
            description:
                'Indicates whether the user has seen the splash screen or not.',
            example: true,
        },
    },
    components: {},
} as const;

export type SplashResponseSchema = FromSchema<typeof splashResponseSchema>;
