export type FeaturePayloadSchema = {
    feature: string;
    schema: Record<string, unknown>;
};

export interface IPayloadSchemaReadModel {
    getPayloadSchema(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined>;
    getPayloadSchemas(featureNames: string[]): Promise<FeaturePayloadSchema[]>;
}
