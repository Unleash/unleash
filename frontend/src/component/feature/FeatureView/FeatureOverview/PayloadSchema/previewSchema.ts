import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';

const firstExample = (schema: JsonSchemaProperty): unknown => {
    const { examples } = schema;
    return Array.isArray(examples) && examples.length > 0
        ? examples[0]
        : undefined;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): Record<string, unknown> =>
    isPlainObject(value) ? value : {};

export const formValueWithExamplesAsDefaults = (
    schema: JsonSchemaProperty,
): Record<string, unknown> => {
    const rootDefault = asRecord(schema.default);
    const rootExample = asRecord(firstExample(schema));

    return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([key, propSchema]) => [
            key,
            propSchema.default ??
                rootDefault[key] ??
                firstExample(propSchema) ??
                rootExample[key],
        ]),
    );
};
