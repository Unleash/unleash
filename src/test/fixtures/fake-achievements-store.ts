import { IAchievementsStore } from '../../lib/types/stores/achievements-store';
import { IAchievement } from '../../lib/types/models/achievement';
import { AchievementDefinitions } from '../../lib/constants/achievements';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeAchievementsStore implements IAchievementsStore {
    getAllByUser(userId: number): Promise<IAchievement[]> {
        throw new Error('Method not implemented.');
    }

    getDefinitions(): Promise<AchievementDefinitions> {
        throw new Error('Method not implemented.');
    }

    unlock(achievementId: string, userId: number): Promise<IAchievement> {
        throw new Error('Method not implemented.');
    }

    markAsSeen(id: number, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
