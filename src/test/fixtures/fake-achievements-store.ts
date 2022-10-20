import { IAchievementsStore } from '../../lib/types/stores/achievements-store';
import {
    IAchievement,
    IAchievementUnlock,
} from '../../lib/types/models/achievement';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeAchievementsStore implements IAchievementsStore {
    getAll(): Promise<IAchievement[]> {
        throw new Error('Method not implemented.');
    }

    getUnlocks(userId: number): Promise<IAchievementUnlock[]> {
        throw new Error('Method not implemented.');
    }

    unlock(achievementId: string, userId: number): Promise<IAchievementUnlock> {
        throw new Error('Method not implemented.');
    }

    markAsSeen(id: number, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
