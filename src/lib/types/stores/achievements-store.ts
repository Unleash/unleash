import { Achievement } from '../../constants/achievements';
import { IAchievement, IAchievementUnlock } from '../models/achievement';

export interface IAchievementsStore {
    getAll(): Promise<IAchievement[]>;
    getUnlocks(userId: number): Promise<IAchievementUnlock[]>;
    unlock(
        achievementId: Achievement,
        userId: number,
    ): Promise<IAchievementUnlock>;
    markAsSeen(id: number, userId: number): Promise<void>;
}
