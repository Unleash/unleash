import type { IPayloadSchemaReadModel } from './payload-schema-read-model-type.js';

export class FakePayloadSchemaReadModel implements IPayloadSchemaReadModel {
    private schemas = new Map<string, Record<string, unknown>>();

    setPayloadSchema(
        featureName: string,
        schema: Record<string, unknown>,
    ): void {
        this.schemas.set(featureName, schema);
    }

    async getPayloadSchema(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined> {
        return this.schemas.get(featureName);
    }
}
