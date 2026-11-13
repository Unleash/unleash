import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import { isObjectWithPropertiesSchema } from 'component/common/SchemaForm/schemaMatchers.ts';

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
        Object.entries(schema.properties ?? {}).map(([key, propSchema]) => {
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

                return [
                    key,
                    formValueWithExamplesAsDefaults({
                        ...propSchema,
                        default: effectiveDefault,
                        examples: effectiveExamples,
                    }),
                ];
            }

            const resolved =
                propSchema.default ??
                rootDefault[key] ??
                firstExample(propSchema) ??
                rootExample[key];

            return [key, resolved];
        }),
    );
};
