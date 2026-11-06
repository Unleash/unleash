import type { IUserRecentFlagsReadModel } from './user-recent-flags-read-model-type.js';

export class FakeUserRecentFlagsReadModel implements IUserRecentFlagsReadModel {
    async getUserRecentFlagNames(): Promise<string[]> {
        return [];
    }
}
