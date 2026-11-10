import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';

export const isObjectSchema = (
    schema: unknown,
): schema is JsonSchemaProperty & { type: 'object' } =>
    typeof schema === 'object' &&
    schema !== null &&
    (schema as { type?: unknown }).type === 'object';

export type SchemaMatcher = (schema: JsonSchemaProperty) => boolean;

export const isPlainStringOrNumberSchema: SchemaMatcher = (schema) =>
    !Array.isArray(schema.enum) &&
    !Array.isArray(schema.anyOf) &&
    !Array.isArray(schema.oneOf) &&
    (schema.type === undefined ||
        schema.type === 'string' ||
        schema.type === 'number' ||
        schema.type === 'integer');

export const isDateTimeSchema: SchemaMatcher = (schema) =>
    isPlainStringOrNumberSchema(schema) && schema.format === 'date-time';

export const isObjectWithPropertiesSchema: SchemaMatcher = (schema) =>
    schema.type === 'object' && typeof schema.properties === 'object';
