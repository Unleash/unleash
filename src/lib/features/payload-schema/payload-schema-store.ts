import type { Db } from '../../db/db.js';
import type { IPayloadSchemaStore } from './payload-schema-store-type.js';

const TABLE = 'feature_payload_schemas';

export class PayloadSchemaStore implements IPayloadSchemaStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async upsert(
        featureName: string,
        schema: Record<string, unknown>,
    ): Promise<void> {
        // hand knex one json literal rather than letting pg serialize the object
        const serialized = JSON.stringify(schema);
        await this.db(TABLE)
            .insert({ feature_name: featureName, schema: serialized })
            .onConflict('feature_name')
            .merge({ schema: serialized, updated_at: this.db.fn.now() });
    }

    async get(
        featureName: string,
    ): Promise<Record<string, unknown> | undefined> {
        const row = await this.db(TABLE)
            .where('feature_name', featureName)
            .first('schema');
        return row?.schema;
    }
}
