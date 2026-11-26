import type {
    FeaturePayloadSchema,
    IPayloadSchemaReadModel,
} from './payload-schema-read-model-type.js';

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
        const [found] = await this.getPayloadSchemas([featureName]);
        return found?.schema;
    }

    async getPayloadSchemas(
        featureNames: string[],
    ): Promise<FeaturePayloadSchema[]> {
        return featureNames.flatMap((feature) => {
            const schema = this.schemas.get(feature);
            return schema ? [{ feature, schema }] : [];
        });
    }
}
