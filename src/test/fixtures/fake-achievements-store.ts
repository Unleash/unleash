import { IAchievementsStore } from '../../lib/types/stores/achievements-store';
import { IAchievement } from '../../lib/types/models/achievement';
import { Achievement } from '../../lib/achievements';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeAchievementsStore implements IAchievementsStore {
    getAllByUser(userId: number): Promise<IAchievement[]> {
        throw new Error('Method not implemented.');
    }

    unlock(achievement: Achievement, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    markAsSeen(id: number, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
