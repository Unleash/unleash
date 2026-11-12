import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';

export interface SchemaFields {
    fieldNames: string[];
    hasAdditionalProperties: boolean;
}

export const schemaFields = (schema?: JsonSchemaProperty): SchemaFields => {
    return Object.entries(schema?.properties ?? {}).reduce<SchemaFields>(
        (summary, [name, property]) => {
            const nested =
                property.type === 'object' ? schemaFields(property) : null;

            return {
                fieldNames: [
                    ...summary.fieldNames,
                    ...(nested ? nested.fieldNames : [name]),
                ],
                hasAdditionalProperties:
                    summary.hasAdditionalProperties ||
                    Boolean(nested?.hasAdditionalProperties),
            };
        },
        {
            fieldNames: [],
            hasAdditionalProperties: Boolean(schema?.additionalProperties),
        },
    );
};
