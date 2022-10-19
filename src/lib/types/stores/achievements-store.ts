import { IAchievement } from '../models/achievement';

export interface IAchievementsStore {
    getAllByUser(userId: number): Promise<IAchievement[]>;
    unlock(achievementId: string, userId: number): Promise<IAchievement>;
    markAsSeen(id: number, userId: number): Promise<void>;
}
