import type { LastSeenInput } from '../last-seen-service';

export interface ILastSeenStore {
    setLastSeen(data: LastSeenInput[]): Promise<void>;
    cleanLastSeen: () => Promise<void>;
}
