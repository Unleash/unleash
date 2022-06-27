export interface ISchemaObject {
    [k: string]: IComponentSchema;
}

interface IComponentSchema {
    components: { schemas?: ISchemaObject };
}

export const includeSchemasRecursively = (
    schemas: ISchemaObject,
): ISchemaObject =>
    Object.entries(schemas).reduce<ISchemaObject>(
        (acc: ISchemaObject, [key, value]) => ({
            ...acc,
            [key]: value,
            ...includeSchemasRecursively(value.components.schemas ?? {}),
        }),
        {},
    );
