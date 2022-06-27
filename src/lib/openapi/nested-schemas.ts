export interface ISchemaObject {
    [k: string]: IComponentSchema;
}

interface IComponentSchema {
    components: { schemas?: ISchemaObject };
}

export const includeSchemasRecursively = (
    schemas: ISchemaObject,
): { [key: string]: ISchemaObject } =>
    Object.entries(schemas).reduce(([key, value], acc) => ({
        ...acc,
        [key]: value,
        ...includeSchemasRecursively(value.components.schemas),
    }));
