import type { Db } from '../../db/db';
import type { IUniqueConnectionStore } from '../../types';
import type { UniqueConnections } from './unique-connection-store-type';

export class UniqueConnectionStore implements IUniqueConnectionStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert(uniqueConnections: UniqueConnections): Promise<void> {
        await this.db<UniqueConnections>('unique_connections')
            .insert({ id: uniqueConnections.id, hll: uniqueConnections.hll })
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
}
