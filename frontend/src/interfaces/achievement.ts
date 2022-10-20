import { Achievement } from 'constants/achievements';

export interface IAchievement {
    id: Achievement;
    title: string;
    description: string;
    imageUrl: string;
    rarity: string;
}

export interface IAchievementUnlock {
    id: number;
    achievementId: Achievement;
    unlockedAt: Date;
    seenAt?: Date;
}
