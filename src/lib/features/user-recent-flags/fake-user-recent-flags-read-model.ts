import type {
    IUserRecentFlagsReadModel,
    UserRecentFlag,
} from './user-recent-flags-read-model-type.js';

export class FakeUserRecentFlagsReadModel implements IUserRecentFlagsReadModel {
    async getUserRecentFlags(): Promise<UserRecentFlag[]> {
        return [];
    }
}
