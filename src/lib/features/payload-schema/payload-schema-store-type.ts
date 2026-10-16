export interface IPayloadSchemaStore {
    upsert(featureName: string, schema: Record<string, unknown>): Promise<void>;
    get(featureName: string): Promise<Record<string, unknown> | undefined>;
}
