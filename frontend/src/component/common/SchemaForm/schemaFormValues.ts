import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import {
    isArraySchema,
    isBooleanSchema,
    isDictionarySchema,
    isEnumSchema,
    isObjectWithPropertiesSchema,
} from 'component/common/SchemaForm/schemaMatchers.ts';
import { isPlainObject } from 'utils/plainObject';

const firstExample = (schema: JsonSchemaProperty): unknown => {
    const { examples } = schema;
    return Array.isArray(examples) && examples.length > 0
        ? examples[0]
        : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> =>
    isPlainObject(value) ? value : {};

const emptyValueForProperty = (schema: JsonSchemaProperty): unknown => {
    if (isArraySchema(schema)) return [];
    if (isBooleanSchema(schema)) return false;
    if (isDictionarySchema(schema)) return {};
    if (isEnumSchema(schema)) return schema.enum?.[0];
    if (schema.type === 'number' || schema.type === 'integer') return 0;
    return '';
};

type FallbackProperty = {
    propSchema: JsonSchemaProperty;
    key: string;
    rootExample: Record<string, unknown>;
    required: boolean;
};

const resolvedFormValue = (
    schema: JsonSchemaProperty,
    fallbackValue: (property: FallbackProperty) => unknown,
    ancestorRequired = true,
): Record<string, unknown> => {
    const rootDefault = asRecord(schema.default);
    const rootExample = asRecord(firstExample(schema));
    const requiredKeys = new Set(schema.required ?? []);

    return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([key, propSchema]) => {
            const required = ancestorRequired && requiredKeys.has(key);

            if (isObjectWithPropertiesSchema(propSchema)) {
                const effectiveDefault = isPlainObject(propSchema.default)
                    ? propSchema.default
                    : rootDefault[key];
                const effectiveExamples =
                    firstExample(propSchema) !== undefined
                        ? propSchema.examples
                        : rootExample[key] !== undefined
                          ? [rootExample[key]]
                          : undefined;

                const nestedValue = resolvedFormValue(
                    {
                        ...propSchema,
                        default: effectiveDefault,
                        examples: effectiveExamples,
                    },
                    fallbackValue,
                    required,
                );

                const hasDefault = Object.values(nestedValue).some(
                    (value) => value !== undefined,
                );
                return [key, hasDefault || required ? nestedValue : undefined];
            }

            return [
                key,
                propSchema.default ??
                    rootDefault[key] ??
                    fallbackValue({ propSchema, key, rootExample, required }),
            ];
        }),
    );
};

export const formValueWithExamplesAsDefaults = (
    schema: JsonSchemaProperty,
): Record<string, unknown> =>
    resolvedFormValue(
        schema,
        ({ propSchema, key, rootExample }) =>
            firstExample(propSchema) ?? rootExample[key],
    );

export const defaultPayloadValue = (
    schema: JsonSchemaProperty,
): Record<string, unknown> =>
    resolvedFormValue(schema, ({ propSchema, required }) =>
        required ? emptyValueForProperty(propSchema) : undefined,
    );
