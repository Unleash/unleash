export type JsonSchemaProperty = Record<string, unknown> & {
    type?: string;
    title?: string;
    description?: string;
    enum?: Array<string | number>;
    const?: unknown;
    default?: unknown;
    examples?: unknown;
    properties?: Record<string, JsonSchemaProperty>;
    additionalProperties?: boolean;
    required?: string[];
    oneOf?: JsonSchemaProperty[];
    anyOf?: JsonSchemaProperty[];
};
