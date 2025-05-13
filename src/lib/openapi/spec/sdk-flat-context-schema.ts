import type { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema.js';

const { properties, ...standardProperties } = sdkContextSchema.properties;
export const sdkFlatContextSchema = {
    $id: '#/components/schemas/sdkFlatContextSchema',
    description: 'The Unleash context with flattened properties',
    type: 'object',
    required: ['appName'],
    additionalProperties: true,
    properties: standardProperties,
    components: {},
} as const;

export type SdkFlatContextSchema = FromSchema<typeof sdkFlatContextSchema>;
