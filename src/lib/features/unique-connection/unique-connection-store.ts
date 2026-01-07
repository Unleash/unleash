import type { Db } from '../../db/db.js';
import type { IUniqueConnectionStore } from '../../types/index.js';
import type { UniqueConnections } from './unique-connection-store-type.js';
import type { Knex } from 'knex';

export class UniqueConnectionStore implements IUniqueConnectionStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert(uniqueConnections: UniqueConnections): Promise<void> {
        await this.db<UniqueConnections & { updated_at: Knex.Raw<any> }>(
            'unique_connections',
        )
            .insert({
                id: uniqueConnections.id,
                hll: uniqueConnections.hll,
                updated_at: this.db.raw('DEFAULT'),
            })
            .onConflict('id')
            .merge();
    }

    async get(
        id: 'current' | 'previous',
    ): Promise<(UniqueConnections & { updatedAt: Date }) | null> {
        const row = await this.db('unique_connections')
            .select('id', 'hll', 'updated_at')
            .where('id', id)
            .first();
        return row
            ? { id: row.id, hll: row.hll, updatedAt: row.updated_at }
            : null;
    }

    async deleteAll(): Promise<void> {
        await this.db('unique_connections').delete();
    }
}
