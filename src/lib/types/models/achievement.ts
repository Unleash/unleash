import { Achievement } from '../../constants/achievements';

export interface IAchievement {
    id: Achievement;
    title: string;
    description: string;
    imageUrl: string;
    rarity?: string;
}

interface IAchievementUnlockValue {
    id: number;
    achievementId: Achievement;
    unlockedAt: Date;
    seenAt?: Date;
}

interface IAchievementUnlockNull {
    id: -1;
}

export type IAchievementUnlock =
    | IAchievementUnlockValue
    | IAchievementUnlockNull;
