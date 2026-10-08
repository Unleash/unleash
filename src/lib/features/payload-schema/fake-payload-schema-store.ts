import type { IPayloadSchemaStore } from './payload-schema-store-type.js';

export class FakePayloadSchemaStore implements IPayloadSchemaStore {
    private schemas = new Map<string, Record<string, unknown>>();

    async upsert(
        featureName: string,
        schema: Record<string, unknown>,
    ): Promise<void> {
        this.schemas.set(featureName, schema);
    }

    async get(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined> {
        return this.schemas.get(featureName);
    }
}
