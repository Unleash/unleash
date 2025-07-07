import type { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema.js';

export const frontendApiFeaturesPostSchema = {
    $id: '#/components/schemas/frontendApiFeaturesPostContextSchema',
    description: 'The Unleash frontend API POST request body.',
    type: 'object',
    additionalProperties: true,
    properties: {
        context: {
            description: 'The Unleash context.',
            type: 'object',
            additionalProperties: true,
            properties: sdkContextSchema.properties,
        },
    },
    components: {},
} as const;

export type FrontendApiFeaturesPostSchema = FromSchema<
    typeof frontendApiFeaturesPostSchema
>;
