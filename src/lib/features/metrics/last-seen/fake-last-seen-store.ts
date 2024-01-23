import { LastSeenInput } from './last-seen-service';
import { ILastSeenStore } from './types/last-seen-store-type';

export class FakeLastSeenStore implements ILastSeenStore {
    setLastSeen(data: LastSeenInput[]): Promise<void> {
        data.map((lastSeen) => lastSeen);
        return Promise.resolve();
    }

    cleanLastSeen(): Promise<void> {
        return Promise.resolve();
    }
}
