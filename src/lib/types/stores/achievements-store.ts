import { Achievement } from '../../achievements';
import { IAchievement } from '../models/achievement';

export interface IAchievementsStore {
    getAllByUser(userId: number): Promise<IAchievement[]>;
    unlock(achievement: Achievement, userId: number): Promise<void>;
    markAsSeen(id: number, userId: number): Promise<void>;
}
