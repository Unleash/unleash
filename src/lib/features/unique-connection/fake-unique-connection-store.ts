import type { IUniqueConnectionStore } from '../../types/index.js';
import type {
    BucketId,
    TimedUniqueConnections,
    UniqueConnections,
} from './unique-connection-store-type.js';

export class FakeUniqueConnectionStore implements IUniqueConnectionStore {
    private uniqueConnectionsRecord: Record<string, TimedUniqueConnections> =
        {};

    async insert(uniqueConnections: UniqueConnections): Promise<void> {
        this.uniqueConnectionsRecord[uniqueConnections.id] = {
            ...uniqueConnections,
            updatedAt: new Date(),
        };
    }

    async get(
        id: BucketId,
    ): Promise<(UniqueConnections & { updatedAt: Date }) | null> {
        return this.uniqueConnectionsRecord[id] || null;
    }

    async deleteAll(): Promise<void> {
        this.uniqueConnectionsRecord = {};
    }
}
