import type { LastSeenInput } from './last-seen-service';
import type { ILastSeenStore } from './types/last-seen-store-type';

export class FakeLastSeenStore implements ILastSeenStore {
    setLastSeen(data: LastSeenInput[]): Promise<void> {
        data.map((lastSeen) => lastSeen);
        return Promise.resolve();
    }

    cleanLastSeen(): Promise<void> {
        return Promise.resolve();
    }
}
