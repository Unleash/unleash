// Convert between public schema types and internal data types.
// Avoids coupling public schemas to internal implementation details.
export interface SchemaMapper<SCHEMA, INTERNAL, INPUT = Partial<SCHEMA>> {
    fromPublic(input: SCHEMA): INTERNAL;
    toPublic(input: INTERNAL): SCHEMA;
    mapInput?(input: INPUT): INTERNAL;
}
