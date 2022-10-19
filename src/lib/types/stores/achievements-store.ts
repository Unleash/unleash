import { Achievement } from '../../constants/achievements';
import { IAchievement } from '../models/achievement';

export interface IAchievementsStore {
    getAllByUser(userId: number): Promise<IAchievement[]>;
    unlock(achievementId: Achievement, userId: number): Promise<IAchievement>;
    markAsSeen(id: number, userId: number): Promise<void>;
}
