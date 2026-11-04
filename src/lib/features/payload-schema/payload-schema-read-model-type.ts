export interface IPayloadSchemaReadModel {
    getPayloadSchema(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined>;
}
