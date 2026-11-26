import type { Db } from '../../db/db.js';
import type {
    FeaturePayloadSchema,
    IPayloadSchemaReadModel,
} from './payload-schema-read-model-type.js';

export class PayloadSchemaReadModel implements IPayloadSchemaReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
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
        if (featureNames.length === 0) return [];
        const rows = await this.db('feature_payload_schemas')
            .whereIn('feature_name', featureNames)
            .select('feature_name', 'schema');
        return rows.map((row) => ({
            feature: row.feature_name,
            schema: row.schema,
        }));
    }
}
