import type { Db } from '../../db/db.js';
import type { IPayloadSchemaReadModel } from './payload-schema-read-model-type.js';

export class PayloadSchemaReadModel implements IPayloadSchemaReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getPayloadSchema(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined> {
        const row = await this.db('feature_payload_schemas')
            .where('feature_name', featureName)
            .first('schema');
        return row?.schema;
    }
}
