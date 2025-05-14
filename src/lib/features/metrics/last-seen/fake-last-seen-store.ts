import type { LastSeenInput } from './last-seen-service.js';
import type { ILastSeenStore } from './types/last-seen-store-type.js';

export class FakeLastSeenStore implements ILastSeenStore {
    setLastSeen(data: LastSeenInput[]): Promise<void> {
        data.map((lastSeen) => lastSeen);
        return Promise.resolve();
    }

    cleanLastSeen(): Promise<void> {
        return Promise.resolve();
    }
}
