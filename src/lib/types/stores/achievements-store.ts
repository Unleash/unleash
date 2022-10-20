import {
    Achievement,
    AchievementDefinitions,
} from '../../constants/achievements';
import { IAchievement } from '../models/achievement';

export interface IAchievementsStore {
    getAllByUser(userId: number): Promise<IAchievement[]>;
    getDefinitions(): Promise<AchievementDefinitions>;
    unlock(achievementId: Achievement, userId: number): Promise<IAchievement>;
    markAsSeen(id: number, userId: number): Promise<void>;
}
